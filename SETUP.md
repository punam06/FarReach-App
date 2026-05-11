# Tourism App - Setup & Deployment Guide

## Overview
This is a full-stack tourism exploration application built with Node.js/Express backend and vanilla JavaScript frontend. The app allows users to explore 100+ tourist spots in Bangladesh, save favorites, write reviews, and book guides/hotels.

## 📋 Prerequisites

### System Requirements
- Node.js 14+ (with npm)
- MySQL 5.7+
- 512MB RAM minimum
- 1GB disk space

### External Services (Optional)
- OpenWeather API key for weather features (get free key: https://openweathermap.org/api)
- Gmail or SMTP server credentials for email notifications

## 🚀 Quick Start (Development)

### 1. Install Dependencies
```bash
cd server
npm install
cd ..
```

### 2. Setup Database
- Create a MySQL database (or let the app auto-create it):
```bash
mysql -u root
CREATE DATABASE IF NOT EXISTS torisom_db;
```

### 3. Configure Environment
```bash
# Copy example to actual env file
cp server/.env.example server/.env

# Edit server/.env with your settings:
# - DB credentials
# - JWT_SECRET (change to random value)
# - OPENWEATHER_API_KEY (if using weather)
# - SMTP credentials (for email, optional)
```

### 4. Start Server
```bash
cd server
npm start
# Server runs at http://localhost:3000
```

### 5. Access Application
- **Frontend**: http://localhost:3000
- **Admin Dashboard**: http://localhost:3000/admin-dashboard (if admin user)
- **User Dashboard**: http://localhost:3000/user-dashboard (after login)

## 🔑 Key Features Implemented

### Authentication & Authorization
- ✅ User registration with email OTP verification
- ✅ Secure login/logout with JWT tokens
- ✅ Role-based access control (user/admin)
- ✅ Profile management with avatar upload
- ✅ Password reset via email OTP

### User Features
- ✅ Browse 100+ tourist spots
- ✅ Filter by division, budget, difficulty
- ✅ Save favorite spots
- ✅ Write and edit reviews (1-5 stars)
- ✅ View guide recommendations
- ✅ Make hotel/guide bookings

### Admin Features
- ✅ Dashboard with statistics
- ✅ Manage tourist spots (CRUD)
- ✅ Manage divisions & districts
- ✅ Manage professional guides
- ✅ User management & role assignment
- ✅ Review moderation
- ✅ Booking management

### Public Features
- ✅ Browse spots without login
- ✅ Search and filter functionality
- ✅ Weather forecast for districts
- ✅ Hotel & guide search/booking
- ✅ Public reviews display

## ⚙️ Environment Variables

### Required (.env)
```
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=torisom_db

# Security
JWT_SECRET=your_random_secure_key_at_least_32_chars

# OTP Settings
OTP_EXPIRY_MINUTES=10
OTP_TOKEN_EXPIRY_MINUTES=20
```

### Optional (.env)
```
# Weather
OPENWEATHER_API_KEY=your_api_key

# Email (leave empty to skip email, OTP logs to console)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=noreply@app.com
```

## 📁 Project Structure

```
tourismappnew-2/
├── server/
│   ├── config/
│   │   ├── database.js      # MySQL connection pool
│   │   └── schema.js        # Database initialization
│   ├── middleware/
│   │   └── auth.js          # JWT verification & role checking
│   ├── routes/
│   │   ├── auth.js          # Registration, login, OTP, profile
│   │   ├── public.js        # Public endpoints (weather, spots, reviews)
│   │   ├── user.js          # User dashboard, saved spots, reviews
│   │   ├── admin.js         # Admin management endpoints
│   │   └── spots.js         # Spot detail endpoints
│   ├── utils/
│   │   └── otp.js           # OTP generation, hashing, email
│   ├── index.js             # Express app setup
│   ├── package.json         # Dependencies
│   ├── .env                 # Environment variables
│   └── .env.example         # Example env file
│
├── index.html               # Main landing page
├── login.html               # Login & OTP verification page
├── register.html            # User registration page
├── user-dashboard.html      # User dashboard
├── admin-dashboard.html     # Admin dashboard
├── user-dashboard.html      # User profile/settings
├── script.js                # Main frontend logic
├── auth-integration.js      # Auth UI integration
├── styles.css               # Landing page styles
├── dashboard.css            # Dashboard styles
├── spot-pictures/           # Tourist spot images
└── README.md                # This file
```

## 🔐 Security Best Practices

### Production Checklist
- [ ] Change `JWT_SECRET` to a secure random value (32+ characters)
- [ ] Set `NODE_ENV=production`
- [ ] Use strong database password
- [ ] Configure real SMTP server for emails
- [ ] Enable HTTPS/SSL certificates
- [ ] Set `API_CORS_ORIGIN` to your domain only
- [ ] Use environment-specific secrets management
- [ ] Enable database backups
- [ ] Rate limiting on auth endpoints
- [ ] Regular security audits

### Password Requirements
- Minimum 6 characters
- Hashed with bcrypt (cost factor: 10)
- Never stored in plain text

### OTP Security
- 6-digit numeric codes
- Hashed with SHA256 before storage
- Expire after 10 minutes
- Max 5 attempts per 15 minutes
- Rate limited to 5 requests/hour per email

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  profile_pic VARCHAR(500),
  phone VARCHAR(20),
  address TEXT,
  is_verified TINYINT(1),
  role ENUM('user', 'admin'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Spots Table
```sql
CREATE TABLE spots (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  district_id INT,
  division_id INT,
  category VARCHAR(100),
  description TEXT,
  history TEXT,
  image VARCHAR(500),
  budget_category ENUM('Low', 'High'),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (district_id) REFERENCES districts(id),
  FOREIGN KEY (division_id) REFERENCES divisions(id)
);
```

### Key Tables
- **users** - User accounts
- **divisions** - 8 divisions of Bangladesh
- **districts** - Districts within divisions
- **spots** - Tourist attractions
- **reviews** - User reviews & ratings
- **saved_spots** - User's favorite spots
- **guides** - Professional guide information
- **bookings** - Hotel/guide reservations
- **otp_verifications** - OTP verification records

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/verify-otp` - Verify email with OTP
- `POST /api/auth/resend-otp` - Request new OTP
- `PUT /api/auth/profile` - Update user profile

### Public
- `GET /api/health` - Server status
- `GET /api/spots` - All tourist spots
- `GET /api/weather?district=...` - Weather data
- `GET /api/forecast?district=...&date=...` - Weather forecast
- `GET /api/reviews/public` - All public reviews

### User Dashboard
- `GET /api/user/dashboard` - Dashboard stats
- `GET /api/user/profile` - User profile
- `GET /api/user/saved-spots` - Saved spots
- `POST /api/user/saved-spots/{id}` - Save spot
- `DELETE /api/user/saved-spots/{id}` - Unsave spot
- `GET /api/user/reviews` - User reviews
- `POST /api/user/reviews` - Create review
- `GET /api/user/guides` - Guides for saved spots
- `GET /api/user/bookings` - User bookings

### Admin Dashboard
- `GET /api/admin/stats` - Platform statistics
- `GET /api/admin/spots` - All spots
- `POST /api/admin/spots` - Create spot
- `PUT /api/admin/spots/{id}` - Update spot
- `DELETE /api/admin/spots/{id}` - Delete spot
- `GET /api/admin/users` - All users
- `GET /api/admin/reviews` - All reviews
- `GET /api/admin/guides` - All guides
- `GET /api/admin/bookings` - All bookings

## 🐛 Troubleshooting

### "Cannot connect to database"
```bash
# Check MySQL is running
mysql -u root
# Verify DB_HOST and credentials in .env
# Run: mysql -h localhost -u root -p
```

### "Port 3000 already in use"
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
# Or use different port: PORT=3001 npm start
```

### "Weather not loading"
- Leave `OPENWEATHER_API_KEY` empty for mock data (development)
- Or get free key from https://openweathermap.org/api

### "Emails not sending"
- Without SMTP config, OTPs are logged to console
- Configure Gmail: Use app-specific password, not regular password
- Test SMTP with: `npm install -g smtp-tester`

### "Login redirects to login page"
- Check token in localStorage: `localStorage.getItem('token')`
- Verify JWT_SECRET is same in frontend and backend
- Check browser console for error messages

## 📈 Performance Tips

### Database
- Use indexes on frequently searched columns
- Regular VACUUM and ANALYZE for MySQL
- Connection pooling (already configured)

### Frontend
- Compress images in spot-pictures/
- Lazy load images
- Cache API responses
- Minify JavaScript/CSS

### Server
- Enable GZIP compression
- Use CDN for static files
- Database query optimization
- Redis caching for popular spots

## 🚢 Deployment to Production

### Option 1: Heroku
```bash
# Install Heroku CLI
npm install -g heroku

# Login and create app
heroku login
heroku create your-app-name

# Set environment variables
heroku config:set JWT_SECRET=your_secure_key
heroku config:set DB_HOST=your-mysql-host
# ... set all env vars

# Deploy
git push heroku main
```

### Option 2: AWS EC2
```bash
# Launch Ubuntu instance
# Install Node.js, MySQL
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt-get install -y nodejs mysql-server

# Clone and setup
git clone your-repo
cd tourismappnew-2/server
npm install
# Configure .env
npm start

# Use PM2 for process management
npm install -g pm2
pm2 start index.js --name "tourismapp"
pm2 startup
pm2 save
```

### Option 3: Docker
```dockerfile
# Create Dockerfile
FROM node:16
WORKDIR /app
COPY server/ ./server/
COPY . .
WORKDIR /app/server
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

## 📝 Admin User Setup

Users with these emails are automatically admin:
- punam.papri@gmail.com
- rebekasultanaorce455@gmail.com

To add more admins, update `ADMIN_EMAILS` in `server/config/schema.js`:

```javascript
const ADMIN_EMAILS = [
  'punam.papri@gmail.com',
  'rebekasultanaorce455@gmail.com',
  'your_admin_email@example.com'  // Add here
];
```

## 📞 Support & Documentation

- **Issues**: Check console logs (`npm start` output)
- **Database**: Direct MySQL access for troubleshooting
- **API Testing**: Use Postman or curl
- **Frontend Issues**: Check browser DevTools console

## 📄 License

This project is developed for educational purposes.

---

**Last Updated**: May 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
