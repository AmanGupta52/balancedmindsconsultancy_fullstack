# Balanced Minds Consultancy

Full-stack website for a counselling & coaching practice: service pages, expert directory, session booking with payments, video sessions, and admin / expert dashboards.

**Stack:** React 19 (Create React App) · Express 5 · MongoDB (Mongoose) · Razorpay · ZEGOCLOUD · NewsAPI

## Project structure

```
client/                      React app (deploy to Netlify/Vercel; build dir: client, output: build)
  public/                    index.html, logo, favicon, _redirects (SPA routing)
  src/
    api/                     axios instance (token + 401 handling)
    config/site.js           brand + contact details (single place to edit)
    context/                 Auth, Toast, AuthModal providers
    data/                    services, team, FAQs, image URLs
    hooks/                   useFetch, useReveal, useDocumentTitle
    utils/                   formatting + wellness-check scoring (+ tests)
    styles/                  design tokens, base, components, layout, pages, dashboard
    components/              layout/, ui/, auth/, booking/, feedback/, notifications/, map/, assessment/
    pages/                   Home, About, Services, ServiceDetail, Experts, Contact, News, Profile, Video, Legal, 404
    pages/admin, moderator   dashboards
server/                      Express API (deploy to Render/Railway; root dir: server)
  src/
    config/                  env validation, DB
    middleware/              auth (JWT + role), error handler
    models/                  User, Admin, Expert, Booking, Feedback, Otp, ContactMessage
    routes/                  auth, experts, bookings, payment, feedback, news, video, contact, admin
    services/                mailer, otp, pricing/coupons, ZEGO token
    scripts/seedAdmin.js     creates the first admin
```

## Run locally

```bash
npm run install:all
cp server/.env.example server/.env      # fill in MONGO_URI and JWT_SECRET at minimum
cp client/.env.example client/.env
npm run seed:admin                      # after setting ADMIN_EMAIL / ADMIN_PASSWORD in server/.env
npm run dev:server                      # http://localhost:5000
npm run dev:client                      # http://localhost:3000
```

Without email credentials, OTP codes are printed in the server console (development only).

## Roles

| Role | How it is created | What it can do |
|---|---|---|
| Customer | Registers on the site (email OTP) | Book sessions, see status/joining link, edit profile |
| Moderator (expert) | Admin → Experts → role "moderator" | Accept/decline/complete own bookings, mark UPI payments received |
| Admin | `npm run seed:admin`, then invite from the dashboard | Everything, incl. users, experts, feedback, messages |

## Deployment changes vs. the old layout

* The frontend moved to `client/` and the backend to `server/`. Update your hosting settings: Netlify base directory `client` (build `npm run build`, publish `client/build`); Render root directory `server` (start `npm start`).
* Set `REACT_APP_API_BASE` (client) to your API URL, and `CLIENT_URLS` / `FRONTEND_URL` (server) to your site URL.
* Old URLs (`/Counselling`, `/career`, ...) redirect to `/services/<slug>`.
* Video calls now use a server-generated ZEGO token, so **`REACT_APP_ZEGO_SERVER_SECRET` must no longer exist in the client**. Set `ZEGO_APP_ID` and `ZEGO_SERVER_SECRET` on the server.
* Coupons moved to the server: set `COUPONS=AMAN:100` (CODE:PERCENT) to keep the old free-session code.

## Security checklist (important)

The uploaded project contained `.env` files with live credentials (database, e-mail, Razorpay, ZEGO, news key), and the old `.gitignore` did not exclude them. If they were ever pushed to GitHub, treat them as leaked and **rotate all of them**, then purge them from git history.
