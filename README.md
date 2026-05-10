# FarReach - Bangladesh Tourism Explorer 

Welcome to **Torisom**, a comprehensive tourism exploration and planning web application specifically designed for discovering the beauty of Bangladesh. Torisom helps travelers find top destinations, estimate trip budgets, check local weather forecasts, hire guides, and navigate hotel bookings all in one unified platform.

## 🎯 Project Purpose

The purpose of Torisom is to promote domestic tourism in Bangladesh by simplifying the travel planning process. It acts as an all-in-one hub where users can:
- **Discover:** Explore 100+ curated tourist attractions across the 8 divisions of Bangladesh.
- **Plan:** Use built-in budget calculators to estimate transport, hotel, and guide costs.
- **Prepare:** Check real-time weather and 5-day forecasts via OpenWeatherMap to ensure safe travels.
- **Navigate:** View interactive Google Maps of destinations and find transportation routes.
- **Connect:** Save favorite spots, leave reviews, and find certified local tour guides.

## ✨ Key Features

- **Secure Authentication:** OTP-based email verification for user sign-ups and secure login.
- **Role-based Dashboards:** 
  - **User Dashboard:** Manage saved spots, track reviews, and update profiles.
  - **Admin Dashboard:** Full CRUD management over tourist spots, guides, users, and overall analytics.
- **Smart Filtering:** Find destinations by division, budget (Low/High), road conditions, and trip type (Adventure, Family, Wildlife, etc.).
- **API Integrations:** Seamlessly fetches data from OpenWeatherMap API and Google Maps Embed API.
- **Responsive Design:** Beautiful, modern, and mobile-friendly UI built with HTML, Vanilla CSS, and JavaScript.

---

## ⚙️ Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (Version 18.x or higher)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/) (Running locally or remotely)
- Git (Optional, for cloning the repository)

---

## 🚀 Installation Guide

### Step 1: Clone or Download the Repository
If you have Git installed, run:
```bash
git clone https://github.com/punam06/FarReach-App.git
cd FarReach-App
```
*(If you don't have Git, download the ZIP file from the repository and extract it.)*

### Step 2: Install Dependencies (All Operating Systems)
Open your terminal (macOS/Linux) or Command Prompt/PowerShell (Windows), navigate to the `server` directory, and install the required Node modules:
```bash
cd server
npm install
```

### Step 3: Setup the Database
1. Make sure your MySQL server is running.
2. The application is configured to automatically create the database (`torisom_db`) and seed it with initial data upon the first run.
3. *Note:* Ensure your MySQL root user has no password. If it does, you will need to update the `.env` file in the next step.

### Step 4: Environment Variables (.env Configuration)
In the `server` directory, create a file named `.env` (or rename the provided `.env.example`).
Add the following configuration, adjusting the database credentials and API keys as needed:

```ini
# Server Config
PORT=3000
JWT_SECRET=your_secure_jwt_secret_key

# Database Config (Update if your MySQL uses a different user/password)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=torisom_db

# OTP and Email Config (Nodemailer setup)
OTP_EXPIRY_MINUTES=10
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=your_email@gmail.com

# External APIs
OPENWEATHER_API_KEY=your_openweathermap_api_key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 💻 How to Run the Application

### On Windows
1. Open Command Prompt or PowerShell.
2. Navigate to the project folder and into the `server` directory.
3. Start the server:
   ```cmd
   npm start
   ```
4. Open your web browser and go to: `http://localhost:3000`

### On macOS / Linux
1. Open your Terminal.
2. Navigate to the project directory:
   ```bash
   cd path/to/FarReach-App/server
   ```
3. Start the server:
   ```bash
   npm start
   ```
   *(For development with auto-reload, you can use `npm run dev`)*
4. Open your web browser and go to: `http://localhost:3000`

---

## 🛠 Project Structure

- `index.html`: The main landing page of the application.
- `script.js`: Core frontend logic, including dynamic spot rendering, filtering, and tab management.
- `styles.css`: Main stylesheet for the platform.
- `dashboard.css`: Unified styling for both Admin and User dashboards.
- `login.html` & `register.html`: Secure authentication pages with OTP support.
- `user-dashboard.html`: Personalized panel for travelers.
- `admin-dashboard.html`: Management interface for platform administrators.
- `server/`: Backend Node.js application.
  - `index.js`: Main entry point for the API server.
  - `config/`: Database and schema configurations.
  - `middleware/`: Authentication and role-based access control guards.
  - `routes/`: Modularized API endpoints (Auth, Admin, Public, Spots, User).

## 🔑 Default Admin Credentials

For testing and management purposes, the following administrative accounts are initialized in the database:
- **Email:** `punam.papri@gmail.com`
- **Email:** `rebekasultanaorce455@gmail.com`
- **Password:** `admin123`

---

## 👤 Handover Notes

1. **Database Consistency:** All queries have been optimized to handle MySQL reserved keywords (like `div`) and support nullable spot associations for general reviews.
2. **Dynamic Content:** The homepage and dashboards are fully synchronized with the MySQL database.
3. **Production Readiness:** The demo login system has been completely removed in favor of a secure, OTP-verified authentication flow.
4. **Spot Visibility:** The homepage now displays up to 20 tourist spots by default, ensuring a rich initial experience for all users.
5. **New Features:** Added Save Spot, Spot Reviews, and Admin Management fixes.

---

*This project was developed for the SDP (Software Development Project) Lab.*
