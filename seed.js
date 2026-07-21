/**
 * seed.js — Import existing db.json data into MongoDB.
 * Run: node seed.js
 * 
 * This script reads data/db.json and seeds MongoDB with the contents.
 * Safe to run multiple times — it clears existing data before seeding.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const { Admin, Settings, Package, Enquiry, Contact, Counter } = require('./models');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/oktrek';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    Admin.deleteMany({}),
    Settings.deleteMany({}),
    Package.deleteMany({}),
    Enquiry.deleteMany({}),
    Contact.deleteMany({}),
    Counter.deleteMany({})
  ]);
  console.log('Cleared existing collections');

  // Read db.json
  const dbPath = path.join(__dirname, 'data', 'db.json');
  if (!fs.existsSync(dbPath)) {
    console.log('No data/db.json found. Creating default data...');
    // Use the default data from store.js
    const { read } = require('./utils/store');
    const data = read();
    await insertData(data);
  } else {
    const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    await insertData(data);
  }

  console.log('Seed complete!');
  await mongoose.disconnect();
  console.log('Disconnected from MongoDB');
}

async function insertData(data) {
  // Insert admin
  await Admin.create({
    username: data.admin.username,
    passwordHash: data.admin.passwordHash
  });
  console.log('  ✓ Admin seeded');

  // Insert settings
  const s = data.settings;
  await Settings.create({
    siteName: s.siteName,
    tagline: s.tagline,
    subTagline: s.subTagline,
    heroImages: s.heroImages || [],
    aboutImage: s.aboutImage || '/images/about-1.jpg',
    introBg: s.introBg || '/images/bg_2.jpg',
    logoText: s.logoText || 'Oktrek',
    logoImage: s.logoImage || '',
    contact: {
      address: s.contact?.address || '',
      phone: s.contact?.phone || '',
      email: s.contact?.email || '',
      mapEmbed: s.contact?.mapEmbed || ''
    },
    stats: {
      routes: s.stats?.routes || 0,
      travellers: s.stats?.travellers || 0,
      teams: s.stats?.teams || 0,
      satisfaction: s.stats?.satisfaction || 0
    },
    gallery: s.gallery || []
  });
  console.log('  ✓ Settings seeded');

  // Insert packages
  if (data.packages && data.packages.length) {
    const packages = data.packages.map(p => ({
      title: p.title,
      region: p.region,
      difficulty: p.difficulty,
      duration: p.duration,
      minAge: p.minAge || '',
      price: p.price || 0,
      rating: p.rating || 4.5,
      location: p.location || '',
      image: p.image || '/images/destination-1.jpg',
      gallery: p.gallery || [],
      summary: p.summary || '',
      itinerary: p.itinerary || [],
      inclusions: p.inclusions || '',
      exclusions: p.exclusions || '',
      featured: p.featured || false,
      published: p.published !== false
    }));
    await Package.insertMany(packages);
    console.log(`  ✓ ${packages.length} packages seeded`);
  }

  // Insert enquiries
  if (data.enquiries && data.enquiries.length) {
    await Enquiry.insertMany(data.enquiries);
    console.log(`  ✓ ${data.enquiries.length} enquiries seeded`);
  }

  // Insert contacts
  if (data.contacts && data.contacts.length) {
    await Contact.insertMany(data.contacts);
    console.log(`  ✓ ${data.contacts.length} contacts seeded`);
  }

  // Set counters
  await Counter.insertMany([
    { name: 'package', seq: data.nextPackageId || 1 },
    { name: 'enquiry', seq: data.nextEnquiryId || 1 },
    { name: 'contact', seq: data.nextContactId || 1 }
  ]);
  console.log('  ✓ Counters seeded');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
