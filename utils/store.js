const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

function defaultData() {
  return {
    admin: {
      username: 'admin',
      // default password: changeme123  (change this after first login!)
      passwordHash: bcrypt.hashSync('changeme123', 10)
    },
    settings: {
      siteName: 'Oktrek',
      tagline: 'Conquer The Heights',
      subTagline: 'Where Every Step Tells a Story',
      heroImages: [
        '/images/bg_5.jpg',
        '/images/bg_1.jpg',
        '/images/bg_2.jpg',
        '/images/bg_4.jpg'
      ],
      aboutImage: '/images/about-1.jpg',
      introBg: '/images/bg_2.jpg',
      logoText: 'Oktrek',
      logoImage: '', // leave empty until user uploads their logo
      contact: {
        address: 'Mall Road, Manali, Himachal Pradesh, India',
        phone: '+91 98765 43210',
        email: 'info@oktrek.com',
        mapEmbed: ''
      },
      stats: {
        routes: 45,
        travellers: 3200,
        teams: 18,
        satisfaction: 98
      },
      gallery: [
        '/images/destination-1.jpg',
        '/images/destination-2.jpg',
        '/images/destination-3.jpg',
        '/images/destination-4.jpg',
        '/images/destination-5.jpg',
        '/images/destination-6.jpg'
      ]
    },
    packages: [
      {
        id: 1,
        title: 'Kedarnath Do Dham Yatra',
        region: 'Uttarakhand',
        duration: '6 Days / 5 Nights',
        difficulty: 'Moderate',
        minAge: '7 years',
        price: 15999,
        rating: 5.0,
        location: 'Haridwar, Uttarakhand',
        image: '/images/destination-4.jpg',
        gallery: [],
        summary: 'A guided Do Dham circuit covering Kedarnath and Badrinath with hotel stays, all transfers from Haridwar, and an experienced yatra coordinator throughout.',
        itinerary: [
          { day: 1, title: 'Haridwar to Guptkashi', details: 'Morning pickup, drive via Devprayag confluence, overnight Guptkashi.' },
          { day: 2, title: 'Kedarnath trek', details: 'Drive to Sonprayag, 16 km trek or optional helicopter, evening darshan.' },
          { day: 3, title: 'Kedarnath to Guptkashi', details: 'Morning aarti, descend, rest at hotel.' },
          { day: 4, title: 'Guptkashi to Badrinath', details: 'Drive via Chopta and Joshimath, evening Badrinath darshan.' },
          { day: 5, title: 'Badrinath to Rudraprayag', details: 'Mana village visit, drive down.' },
          { day: 6, title: 'Return to Haridwar', details: 'Drop by evening.' }
        ],
        inclusions: 'Hotel stays (twin sharing), Breakfast and dinner, Tempo Traveller transfers, Yatra coordinator, All permits',
        exclusions: 'Helicopter tickets, Lunch, Pony/palki charges, Personal expenses',
        featured: true,
        published: true
      },
      {
        id: 2,
        title: 'Complete Char Dham Yatra',
        region: 'Uttarakhand',
        duration: '10 Days / 9 Nights',
        difficulty: 'Moderate',
        minAge: '7 years',
        price: 32999,
        rating: 4.8,
        location: 'Yamunotri, Gangotri, Kedarnath, Badrinath',
        image: '/images/destination-5.jpg',
        gallery: [],
        summary: 'The full circuit: Yamunotri, Gangotri, Kedarnath, and Badrinath in one carefully paced itinerary with buffer days for weather.',
        itinerary: [
          { day: 1, title: 'Haridwar to Barkot', details: 'Drive via Mussoorie, Kempty Falls.' },
          { day: 2, title: 'Yamunotri', details: '6 km trek from Janki Chatti, return to Barkot.' },
          { day: 3, title: 'Barkot to Uttarkashi', details: 'Vishwanath temple evening visit.' },
          { day: 4, title: 'Gangotri', details: 'Darshan and Bhagirathi ghats, return Uttarkashi.' },
          { day: 5, title: 'Uttarkashi to Guptkashi', details: 'Long scenic drive.' },
          { day: 6, title: 'Kedarnath', details: 'Trek/heli, darshan, night at Kedarnath.' },
          { day: 7, title: 'Descend to Guptkashi', details: 'Rest.' },
          { day: 8, title: 'Guptkashi to Badrinath', details: 'Evening darshan.' },
          { day: 9, title: 'Badrinath to Rudraprayag', details: 'Mana village.' },
          { day: 10, title: 'Return Haridwar', details: 'Drop.' }
        ],
        inclusions: 'All hotels, MAP meals, Transfers, Coordinator, Permits',
        exclusions: 'Helicopter, Lunch, Pony/palki, Insurance',
        featured: true,
        published: true
      },
      {
        id: 3,
        title: 'Kedarkantha Winter Trek',
        region: 'Uttarakhand',
        duration: '5 Days / 4 Nights',
        difficulty: 'Challenging',
        minAge: '12 years',
        price: 8999,
        rating: 4.8,
        location: 'Sankri, Uttarkashi, Uttarakhand',
        image: '/images/destination-1.jpg',
        gallery: [],
        summary: 'The classic winter summit at 12,500 ft with pine forests, frozen Juda ka Talab, and a sunrise summit push. Certified trek leaders and full camping gear provided.',
        itinerary: [
          { day: 1, title: 'Dehradun to Sankri', details: 'Shared cab, 8 hr drive, briefing.' },
          { day: 2, title: 'Sankri to Juda ka Talab', details: '4 km ascent through pine forest, camp.' },
          { day: 3, title: 'To Kedarkantha base', details: 'Snow walk, base camp at 11,250 ft.' },
          { day: 4, title: 'Summit day', details: '3 am start, summit 12,500 ft, descend to Sankri.' },
          { day: 5, title: 'Return Dehradun', details: 'Drop by evening.' }
        ],
        inclusions: 'Camping and meals, Trek leader + support staff, Gaiters, microspikes, Forest permits',
        exclusions: 'Transport to Sankri (bookable add-on), Personal gear, Insurance',
        featured: true,
        published: true
      },
      {
        id: 4,
        title: 'Manali & Solang Valley Getaway',
        region: 'Himachal Pradesh',
        duration: '5 Days / 4 Nights',
        difficulty: 'Easy',
        minAge: 'No restriction',
        price: 11499,
        rating: 4.7,
        location: 'Manali, Himachal Pradesh',
        image: '/images/destination-3.jpg',
        gallery: [],
        summary: 'Family-friendly Manali with Solang adventure day, Hadimba temple, old Manali cafes, and an optional Atal Tunnel excursion to Sissu.',
        itinerary: [
          { day: 1, title: 'Arrive Manali', details: 'Check-in, Mall Road evening.' },
          { day: 2, title: 'Solang Valley', details: 'Ropeway, ATV, paragliding options.' },
          { day: 3, title: 'Atal Tunnel and Sissu', details: 'Lahaul day excursion.' },
          { day: 4, title: 'Local Manali', details: 'Hadimba, Vashisht hot springs, old Manali.' },
          { day: 5, title: 'Departure', details: 'Checkout and drop.' }
        ],
        inclusions: 'Hotel with breakfast, Private cab, Sightseeing as listed',
        exclusions: 'Adventure activity tickets, Lunch and dinner, Entry fees',
        featured: true,
        published: true
      },
      {
        id: 5,
        title: 'Kasol & Kheerganga Trek',
        region: 'Himachal Pradesh',
        duration: '4 Days / 3 Nights',
        difficulty: 'Moderate',
        minAge: '14 years',
        price: 6999,
        rating: 4.6,
        location: 'Kasol, Parvati Valley, Himachal Pradesh',
        image: '/images/destination-2.jpg',
        gallery: [],
        summary: 'Parvati valley circuit: Kasol cafe culture, Chalal village walk, Manikaran gurudwara, and the overnight Kheerganga trek with hot springs at the top.',
        itinerary: [
          { day: 1, title: 'Arrive Kasol', details: 'Riverside camps, Chalal walk.' },
          { day: 2, title: 'Kheerganga trek', details: '12 km via Rudra Nag, camp at top.' },
          { day: 3, title: 'Descend, Manikaran', details: 'Hot springs, gurudwara, Kasol night.' },
          { day: 4, title: 'Departure', details: 'Morning bus.' }
        ],
        inclusions: 'Camps both nights, Breakfast + dinner, Trek guide',
        exclusions: 'Transport to Kasol, Lunch, Personal expenses',
        featured: true,
        published: true
      },
      {
        id: 6,
        title: 'Badrinath Express Darshan',
        region: 'Uttarakhand',
        duration: '4 Days / 3 Nights',
        difficulty: 'Easy',
        minAge: 'No restriction',
        price: 9499,
        rating: 0,
        location: 'Badrinath, Uttarakhand',
        image: '/images/destination-6.jpg',
        gallery: [],
        summary: 'A compact ek-dham darshan for time-bound yatris: Haridwar to Badrinath and back with Mana village and Devprayag stops.',
        itinerary: [],
        inclusions: '',
        exclusions: '',
        featured: false,
        published: false
      },
      {
        id: 7,
        title: 'Spiti Valley Expedition',
        region: 'Himachal Pradesh',
        duration: '8 Days / 7 Nights',
        difficulty: 'Moderate',
        minAge: '12 years',
        price: 15999,
        rating: 4.9,
        location: 'Delhi to Spiti Valley, Himachal Pradesh',
        image: '/images/destination-7.jpg',
        gallery: [],
        summary: 'Discover the raw beauty of Spiti Valley \u2014 a cold desert mountain valley nestled between India and Tibet. Journey through ancient monasteries, fossil-rich landscapes, and some of the highest motorable passes in the world.',
        itinerary: [
          { day: 1, title: 'Delhi to Shimla', details: 'Early morning departure from Delhi. Drive through the Shivalik foothills to Shimla. Evening at leisure on The Mall Road. Overnight in Shimla.' },
          { day: 2, title: 'Shimla to Narkanda', details: 'Short drive to Narkanda (2,700m). Acclimatization walk through apple orchards. Visit Hatu Peak for panoramic Himalayan views. Overnight in Narkanda.' },
          { day: 3, title: 'Narkanda to Chitkul', details: 'Drive through the beautiful Baspa Valley to Chitkul, the last village near the Indo-Tibet border. Explore the ancient temples and enjoy the pristine Kinnaur landscape. Overnight in Chitkul.' },
          { day: 4, title: 'Chitkul to Kalpa', details: 'Scenic drive to Kalpa with views of the Kinnaur Kailash range. Visit the Narayan-Nagini temple and the famous Suicide Point viewpoint. Overnight in Kalpa.' },
          { day: 5, title: 'Kalpa to Tabo', details: 'Cross into Spiti via the dramatic Khab bridge where the Spiti and Sutlej rivers meet. Visit Tabo Monastery \u2014 one of the oldest continuously operating Buddhist monasteries (1,000+ years). Overnight in Tabo.' },
          { day: 6, title: 'Tabo to Kaza via Kunzum Pass', details: 'Drive through the stark Spiti landscape to Kunzum Pass (4,590m) \u2014 the gateway to Spiti. Stop at Chandratal Lake (Moon Lake) en route. Descend to Kaza, the sub-divisional headquarters. Overnight in Kaza.' },
          { day: 7, title: 'Kaza \u2014 Key Monastery & Kibber', details: 'Visit Key Monastery (1,000+ years old) perched on a hilltop. Drive to Kibber, one of the highest motorable villages in the world. Spot snow leopards (seasonal) and blue sheep. Return to Kaza for overnight stay.' },
          { day: 8, title: 'Kaza to Delhi (via Shimla)', details: 'Begin the return journey. Long drive back through the dramatic Spiti and Kinnaur valleys to Shimla, then onward to Delhi. Tour concludes.' }
        ],
        inclusions: 'Accommodation in guesthouses/hotels on twin-sharing basis, All meals (breakfast, lunch, dinner) during the trip, Transport in a dedicated vehicle (SUV/Tempo Traveller), Driver allowance, fuel, toll taxes, and parking, Inner Line Permits for Spiti Valley, Experienced trip leader/guide, Basic first-aid kit and oxygen cylinder',
        exclusions: 'Personal expenses (tips, laundry, phone calls), Travel insurance, Emergency evacuation costs, Anything not mentioned in inclusions, Camera fees at monasteries',
        featured: true,
        published: true
      }
    ],
    enquiries: [],
    contacts: [],
    nextPackageId: 8,
    nextEnquiryId: 1,
    nextContactId: 1
  };
}

function ensureDb() {
  if (!fs.existsSync(path.dirname(DB_PATH))) {
    fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify(defaultData(), null, 2));
  }
}

function read() {
  ensureDb();
  const raw = fs.readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(raw);
}

function write(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { read, write };
