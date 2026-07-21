# Oktrek-style Mountain Trekking Website

A full-stack Node.js/Express travel website built on the "Pacific" Bootstrap template,
restyled for a Himalayan trekking/yatra brand (oktrek), with a 3D parallax hero,
dynamic trek packages, and a full admin panel.

## What's included

- Public site: Home, Treks & Packages (with filters), Package detail + enquiry form,
  About, Contact (with contact form)
- 3D parallax hero on the homepage (mouse-move layered depth + auto slideshow of hero images)
- Admin panel at `/admin`:
  - Dashboard
  - Packages: add / edit / delete, with image upload
  - Images: upload/remove hero (parallax) images, gallery images, and your logo
  - Enquiries: every "Send Inquiry" submission from a package page, with status tracking
  - Contact Messages: every submission from the Contact page
  - Settings: site name, tagline, contact details, stats, map embed, admin password

Data is stored in `data/db.json` (auto-created on first run) and uploaded images are
stored in `public/uploads/`. No external database needed.

## Running locally

```bash
npm install
npm start
```

Then visit:
- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login

**Default admin login:** `admin` / `changeme123`
**Change this immediately** from Admin → Settings → Change Admin Password after your first login.

## Deploying

This is a persistent Node.js server (not a static site), so it needs a host that runs
Node continuously with a writable filesystem, for example:
- Render.com, Railway.app, or a small VPS (DigitalOcean/Linode) — all straightforward
- Vercel/Netlify are NOT recommended as-is: they run serverless functions with a
  read-only/ephemeral filesystem, so uploaded images and the JSON database would not
  persist between requests

Steps for a typical host (Render/Railway):
1. Push this folder to a GitHub repo
2. Create a new "Web Service", connect the repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add a persistent disk/volume mounted at the project root if the platform supports it,
   so `data/` and `public/uploads/` survive restarts and deploys
6. Set the `SESSION_SECRET` environment variable to a random string
7. Once deployed, go to `yourdomain.com/admin`, log in, and change the admin password

To point your domain (`url.com`) at it, the admin panel will simply be `url.com/admin`
as requested — no extra routing needed since it's the same Express app.

## Adding your logo

Go to Admin → Images → Logo, upload the file. It will replace the text logo in the nav
automatically.

## About the package data

oktrek.vercel.app loads its live tour list via client-side JavaScript, so the exact
current packages/prices could not be scraped directly. I seeded six representative
Himalayan treks/yatras (Kedarkantha, Valley of Flowers, Hampta Pass, Kedarnath Yatra,
Chardham Yatra, Roopkund) matching the site's field structure (region, difficulty,
duration, price, rating, location). Edit, delete, or replace these anytime from
Admin → Packages — no code changes needed.

## Project structure

```
server.js              Express app + all routes
utils/store.js          JSON file "database" (packages, enquiries, contacts, settings)
middleware/auth.js       Admin session guard
views/                   EJS templates (public site + admin panel)
public/css, /js, /fonts  Original Pacific template assets
public/css/parallax3d.css, public/js/parallax3d.js   3D parallax hero
public/css/site-custom.css   Package cards, filters, admin panel styling
public/uploads/          Uploaded hero/package/gallery/logo images (created at runtime)
data/db.json             Auto-created on first run (packages, enquiries, contacts, settings)
```
