require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { Admin, Settings, Package, Enquiry, Contact, getNextSeq } = require('./models');
const { requireAdmin } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/oktrek';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'oktrek-style-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 } // 8 hours
}));

// make settings available to every view
app.use(async (req, res, next) => {
  try {
    const settings = await Settings.findOne() || {};
    res.locals.settings = settings;
    res.locals.isAdmin = !!(req.session && req.session.isAdmin);
    next();
  } catch (err) {
    next(err);
  }
});

// ---------- Multer upload config ----------
function makeUploader(subfolder) {
  const dir = path.join(__dirname, 'public', 'uploads', subfolder);
  try { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); } catch(e) { /* read-only env (Vercel) */ }
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, dir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase();
      cb(null, `${base}-${Date.now()}${ext}`);
    }
  });
  return multer({
    storage,
    limits: { fileSize: 8 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const ok = /jpeg|jpg|png|webp|gif/.test(file.mimetype);
      cb(ok ? null : new Error('Only image files are allowed'), ok);
    }
  });
}
const uploadHero = makeUploader('hero');
const uploadPackage = makeUploader('packages');
const uploadGallery = makeUploader('gallery');
const uploadLogo = makeUploader('logo');

// =====================================================
// PUBLIC SITE ROUTES
// =====================================================

app.get('/', async (req, res, next) => {
  try {
    const published = await Package.find({ published: true });
    const featured = published.filter(p => p.featured);
    res.render('index', {
      page: 'home',
      packages: featured.length ? featured : published.slice(0, 6)
    });
  } catch (err) { next(err); }
});

app.get('/packages', async (req, res, next) => {
  try {
    const { region, difficulty, sort } = req.query;
    let query = { published: true };
    if (region) query.region = region;
    if (difficulty) query.difficulty = difficulty;

    let sortObj = {};
    if (sort === 'price_asc') sortObj = { price: 1 };
    else if (sort === 'price_desc') sortObj = { price: -1 };
    else if (sort === 'rating') sortObj = { rating: -1 };

    const list = await Package.find(query).sort(sortObj);
    const allPublished = await Package.find({ published: true });
    const regions = [...new Set(allPublished.map(p => p.region))];
    const difficulties = [...new Set(allPublished.map(p => p.difficulty))];

    res.render('packages', {
      page: 'packages',
      packages: list,
      regions,
      difficulties,
      query: req.query
    });
  } catch (err) { next(err); }
});

app.get('/packages/:id', async (req, res, next) => {
  try {
    const pkg = await Package.findOne({ _id: req.params.id, published: true });
    if (!pkg) return res.status(404).render('404', { page: '' });
    const related = await Package.find({ _id: { $ne: pkg._id }, published: true }).limit(3);
    res.render('package-detail', { page: 'packages', pkg, related, submitted: req.query.sent === '1' });
  } catch (err) { next(err); }
});

app.post('/packages/:id/enquire', async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.status(404).send('Package not found');

    await Enquiry.create({
      packageId: pkg._id.toString(),
      packageTitle: pkg.title,
      name: req.body.name || '',
      email: req.body.email || '',
      phone: req.body.phone || '',
      travellers: req.body.travellers || '',
      preferredDate: req.body.preferredDate || '',
      pickupCity: req.body.pickupCity || '',
      message: req.body.message || '',
      status: 'new'
    });
    res.redirect(`/packages/${pkg.id}?sent=1`);
  } catch (err) { next(err); }
});

app.get('/about', (req, res) => {
  res.render('about', { page: 'about' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { page: 'contact', submitted: req.query.sent === '1' });
});

app.post('/contact', async (req, res, next) => {
  try {
    await Contact.create({
      name: req.body.name || '',
      email: req.body.email || '',
      subject: req.body.subject || '',
      message: req.body.message || ''
    });
    res.redirect('/contact?sent=1');
  } catch (err) { next(err); }
});

// =====================================================
// ADMIN ROUTES
// =====================================================

app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  res.render('admin/login', { page: 'admin', error: null });
});

app.post('/admin/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    const ok = admin && bcrypt.compareSync(password || '', admin.passwordHash);
    if (!ok) {
      return res.render('admin/login', { page: 'admin', error: 'Invalid username or password' });
    }
    req.session.isAdmin = true;
    req.session.adminUsername = username;
    res.redirect('/admin');
  } catch (err) { next(err); }
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

app.get('/admin', requireAdmin, async (req, res, next) => {
  try {
    const [packageCount, enquiryCount, newEnquiryCount, contactCount, recentEnquiries] = await Promise.all([
      Package.countDocuments(),
      Enquiry.countDocuments(),
      Enquiry.countDocuments({ status: 'new' }),
      Contact.countDocuments(),
      Enquiry.find().sort({ createdAt: -1 }).limit(5)
    ]);
    res.render('admin/dashboard', {
      page: 'admin',
      stats: {
        packages: packageCount,
        enquiries: enquiryCount,
        newEnquiries: newEnquiryCount,
        contacts: contactCount
      },
      recentEnquiries
    });
  } catch (err) { next(err); }
});

// ---- Packages CRUD ----
app.get('/admin/packages', requireAdmin, async (req, res, next) => {
  try {
    const packages = await Package.find().sort({ _id: -1 });
    res.render('admin/packages', { page: 'admin', packages });
  } catch (err) { next(err); }
});

app.get('/admin/packages/new', requireAdmin, (req, res) => {
  res.render('admin/package-form', { page: 'admin', pkg: null });
});

app.post('/admin/packages/new', requireAdmin, uploadPackage.single('image'), async (req, res, next) => {
  try {
    const b = req.body;
    const image = req.file ? `/uploads/packages/${req.file.filename}` : '/images/destination-1.jpg';
    let itinerary = [];
    try { itinerary = JSON.parse(b.itinerary || '[]'); } catch(e) { itinerary = []; }
    await Package.create({
      title: b.title,
      region: b.region,
      difficulty: b.difficulty,
      duration: b.duration,
      price: Number(b.price) || 0,
      rating: Number(b.rating) || 4.5,
      minAge: b.minAge || '',
      location: b.location,
      image,
      gallery: [],
      summary: b.summary,
      inclusions: b.inclusions,
      exclusions: b.exclusions || '',
      itinerary,
      featured: b.featured === 'on',
      published: b.published === 'on'
    });
    res.redirect('/admin/packages');
  } catch (err) { next(err); }
});

app.get('/admin/packages/:id/edit', requireAdmin, async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.redirect('/admin/packages');
    res.render('admin/package-form', { page: 'admin', pkg });
  } catch (err) { next(err); }
});

app.post('/admin/packages/:id/edit', requireAdmin, uploadPackage.single('image'), async (req, res, next) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return res.redirect('/admin/packages');
    const b = req.body;
    let itinerary = pkg.itinerary || [];
    try { itinerary = JSON.parse(b.itinerary || '[]'); } catch(e) {}
    const update = {
      title: b.title,
      region: b.region,
      difficulty: b.difficulty,
      duration: b.duration,
      price: Number(b.price) || 0,
      rating: Number(b.rating) || 4.5,
      minAge: b.minAge || '',
      location: b.location,
      summary: b.summary,
      inclusions: b.inclusions,
      exclusions: b.exclusions || '',
      itinerary,
      featured: b.featured === 'on',
      published: b.published === 'on'
    };
    if (req.file) update.image = `/uploads/packages/${req.file.filename}`;
    await Package.findByIdAndUpdate(req.params.id, update);
    res.redirect('/admin/packages');
  } catch (err) { next(err); }
});

app.post('/admin/packages/:id/delete', requireAdmin, async (req, res, next) => {
  try {
    await Package.findByIdAndDelete(req.params.id);
    res.redirect('/admin/packages');
  } catch (err) { next(err); }
});

// ---- Hero / Gallery / Logo image management ----
app.get('/admin/images', requireAdmin, async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    res.render('admin/images', { page: 'admin', settings });
  } catch (err) { next(err); }
});

app.post('/admin/images/hero', requireAdmin, uploadHero.single('image'), async (req, res, next) => {
  try {
    if (req.file) {
      await Settings.findOneAndUpdate({}, { $push: { heroImages: `/uploads/hero/${req.file.filename}` } });
    }
    res.redirect('/admin/images');
  } catch (err) { next(err); }
});

app.post('/admin/images/hero/:index/delete', requireAdmin, async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    settings.heroImages.splice(Number(req.params.index), 1);
    await settings.save();
    res.redirect('/admin/images');
  } catch (err) { next(err); }
});

app.post('/admin/images/gallery', requireAdmin, uploadGallery.single('image'), async (req, res, next) => {
  try {
    if (req.file) {
      await Settings.findOneAndUpdate({}, { $push: { gallery: `/uploads/gallery/${req.file.filename}` } });
    }
    res.redirect('/admin/images');
  } catch (err) { next(err); }
});

app.post('/admin/images/gallery/:index/delete', requireAdmin, async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    settings.gallery.splice(Number(req.params.index), 1);
    await settings.save();
    res.redirect('/admin/images');
  } catch (err) { next(err); }
});

app.post('/admin/images/logo', requireAdmin, uploadLogo.single('logo'), async (req, res, next) => {
  try {
    if (req.file) {
      await Settings.findOneAndUpdate({}, { logoImage: `/uploads/logo/${req.file.filename}` });
    }
    res.redirect('/admin/images');
  } catch (err) { next(err); }
});

// ---- Enquiries ----
app.get('/admin/enquiries', requireAdmin, async (req, res, next) => {
  try {
    const enquiries = await Enquiry.find().sort({ createdAt: -1 });
    res.render('admin/enquiries', { page: 'admin', enquiries });
  } catch (err) { next(err); }
});

app.post('/admin/enquiries/:id/status', requireAdmin, async (req, res, next) => {
  try {
    await Enquiry.findByIdAndUpdate(req.params.id, { status: req.body.status });
    res.redirect('/admin/enquiries');
  } catch (err) { next(err); }
});

app.post('/admin/enquiries/:id/delete', requireAdmin, async (req, res, next) => {
  try {
    await Enquiry.findByIdAndDelete(req.params.id);
    res.redirect('/admin/enquiries');
  } catch (err) { next(err); }
});

// ---- Contact messages ----
app.get('/admin/contacts', requireAdmin, async (req, res, next) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.render('admin/contacts', { page: 'admin', contacts });
  } catch (err) { next(err); }
});

app.post('/admin/contacts/:id/delete', requireAdmin, async (req, res, next) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.redirect('/admin/contacts');
  } catch (err) { next(err); }
});

// ---- Settings (site contact details, stats, text) ----
app.get('/admin/settings', requireAdmin, async (req, res, next) => {
  try {
    const settings = await Settings.findOne();
    res.render('admin/settings', { page: 'admin', settings, saved: req.query.saved === '1' });
  } catch (err) { next(err); }
});

app.post('/admin/settings', requireAdmin, async (req, res, next) => {
  try {
    const b = req.body;
    await Settings.findOneAndUpdate({}, {
      siteName: b.siteName,
      tagline: b.tagline,
      subTagline: b.subTagline,
      'contact.address': b.address,
      'contact.phone': b.phone,
      'contact.email': b.email,
      'contact.mapEmbed': b.mapEmbed,
      'stats.routes': Number(b.statRoutes) || 0,
      'stats.travellers': Number(b.statTravellers) || 0,
      'stats.teams': Number(b.statTeams) || 0,
      'stats.satisfaction': Number(b.statSatisfaction) || 0
    });
    res.redirect('/admin/settings?saved=1');
  } catch (err) { next(err); }
});

app.post('/admin/settings/password', requireAdmin, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const admin = await Admin.findOne();
    if (!bcrypt.compareSync(currentPassword || '', admin.passwordHash)) {
      const settings = await Settings.findOne();
      return res.render('admin/settings', { page: 'admin', settings, saved: false, pwError: 'Current password is incorrect' });
    }
    admin.passwordHash = bcrypt.hashSync(newPassword, 10);
    await admin.save();
    res.redirect('/admin/settings?saved=1');
  } catch (err) { next(err); }
});

app.use((req, res) => {
  res.status(404).render('404', { page: '' });
});

// =====================================================
// START SERVER — connect to MongoDB then listen
// =====================================================
const startServer = () => {
  return mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB');
      return app;
    });
};

// Only listen when run directly (not when imported by Vercel)
if (require.main === module) {
  startServer().then(() => {
    app.listen(PORT, () => {
      console.log(`Oktrek-style travel site running at http://localhost:${PORT}`);
      console.log(`Admin panel: http://localhost:${PORT}/admin/login`);
    });
  }).catch(err => {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  });
}

module.exports = { app, startServer };
