# FarReach-App

## Backend (DB-first with MySQL)

Backend lives in `/home/runner/work/FarReach-App/FarReach-App/server`.

### 1) Install dependencies

```bash
cd /home/runner/work/FarReach-App/FarReach-App/server
npm install
```

### 2) Configure environment

```bash
cp /home/runner/work/FarReach-App/FarReach-App/server/.env.example /home/runner/work/FarReach-App/FarReach-App/server/.env
```

Set your MySQL and secret values in `.env`.
Also set `RESERVED_ADMIN_EMAILS` if you want to change the default seeded admin email list.

### 3) Run DB migration and seed

```bash
cd /home/runner/work/FarReach-App/FarReach-App/server
npm run db:migrate
npm run db:seed
```

This creates and seeds:
- roles, users, otp_verifications, refresh_tokens
- districts, categories, spots
- guides, guide_languages, guide_specialties, guide_bookings
- hotels, hotel_features, hotel_bookings
- routes, reviews, activity_logs

Reserved admin emails seeded:
- `punam.papri@gmail.com`
- `rebekasultanaorce455@gmail.com`

### 4) Start server

```bash
cd /home/runner/work/FarReach-App/FarReach-App/server
npm run start
```

Server runs at `http://localhost:3000`.

---

## Implemented API Scope

### Auth + OTP
- `POST /api/auth/register`
- `POST /api/auth/verify-otp`
- `POST /api/auth/resend-otp`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`

### Domain
- `GET /api/spots`
- `GET /api/reviews`
- `POST /api/reviews` (auth)
- `GET /api/hotels`
- `POST /api/hotels/search`
- `POST /api/hotel-bookings` (auth)
- `GET /api/guides`
- `POST /api/guide-bookings` (auth)
- `GET /api/history` (auth)

### Admin (role: admin)
- Users: `GET /api/admin/users`, `PATCH /api/admin/users/:id`
- Reviews: `GET /api/admin/reviews`, `PATCH /api/admin/reviews/:id`
- Analytics: `GET /api/admin/analytics`
- Districts CRUD: `/api/admin/districts`
- Categories CRUD: `/api/admin/categories`
- Spots CRUD: `/api/admin/spots`
- Hotels CRUD: `/api/admin/hotels`
- Guides CRUD: `/api/admin/guides`
- Routes CRUD: `/api/admin/routes`

### Existing weather endpoints kept
- `GET /api/weather`
- `GET /api/forecast`

---

## Frontend Auth + Admin Usage

- Use **Sign Up** to register.
- Enter OTP in the modal to verify account.
- Then login with email/password.
- Reserved emails below are automatically assigned admin role on registration:
  - `punam.papri@gmail.com`
  - `rebekasultanaorce455@gmail.com`
- Logged in admins can access the **Admin Panel** section in the UI and load:
  - user list
  - admin analytics
