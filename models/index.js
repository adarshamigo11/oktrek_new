const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ---- Admin (singleton) ----
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true },
  passwordHash: { type: String, required: true }
});
const Admin = mongoose.model('Admin', adminSchema);

// ---- Settings (singleton) ----
const settingsSchema = new mongoose.Schema({
  siteName: { type: String, default: 'Oktrek' },
  tagline: { type: String, default: 'Conquer The Heights' },
  subTagline: { type: String, default: 'Where Every Step Tells a Story' },
  heroImages: [{ type: String }],
  aboutImage: { type: String, default: '/images/about-1.jpg' },
  introBg: { type: String, default: '/images/bg_2.jpg' },
  logoText: { type: String, default: 'Oktrek' },
  logoImage: { type: String, default: '' },
  contact: {
    address: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    mapEmbed: { type: String, default: '' }
  },
  stats: {
    routes: { type: Number, default: 0 },
    travellers: { type: Number, default: 0 },
    teams: { type: Number, default: 0 },
    satisfaction: { type: Number, default: 0 }
  },
  gallery: [{ type: String }]
});
const Settings = mongoose.model('Settings', settingsSchema);

// ---- Package ----
const itineraryItemSchema = new mongoose.Schema({
  day: Number,
  title: String,
  details: String
}, { _id: false });

const packageSchema = new mongoose.Schema({
  title: { type: String, required: true },
  region: { type: String, required: true },
  difficulty: { type: String, required: true },
  duration: { type: String, required: true },
  minAge: { type: String, default: '' },
  price: { type: Number, default: 0 },
  rating: { type: Number, default: 4.5 },
  location: { type: String, default: '' },
  image: { type: String, default: '/images/destination-1.jpg' },
  gallery: [{ type: String }],
  summary: { type: String, default: '' },
  itinerary: [itineraryItemSchema],
  inclusions: { type: String, default: '' },
  exclusions: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  published: { type: Boolean, default: true }
});
const Package = mongoose.model('Package', packageSchema);

// ---- Enquiry ----
const enquirySchema = new mongoose.Schema({
  packageId: { type: String },
  packageTitle: { type: String, default: '' },
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  travellers: { type: String, default: '' },
  preferredDate: { type: String, default: '' },
  pickupCity: { type: String, default: '' },
  message: { type: String, default: '' },
  status: { type: String, default: 'new' },
  createdAt: { type: Date, default: Date.now }
});
const Enquiry = mongoose.model('Enquiry', enquirySchema);

// ---- Contact ----
const contactSchema = new mongoose.Schema({
  name: { type: String, default: '' },
  email: { type: String, default: '' },
  subject: { type: String, default: '' },
  message: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// ---- Counter (for auto-incrementing IDs) ----
const counterSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  seq: { type: Number, default: 1 }
});
const Counter = mongoose.model('Counter', counterSchema);

async function getNextSeq(name) {
  const counter = await Counter.findOneAndUpdate(
    { name },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
}

module.exports = { Admin, Settings, Package, Enquiry, Contact, Counter, getNextSeq };
