require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { ensureDatabaseExists, initializeDatabase } = require('./config/schema');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logLevel = res.statusCode >= 400 ? 'WARN' : 'INFO';
    console.log(`[${logLevel}] ${req.method} ${req.path} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '..')));
app.use('/spot-pictures', express.static(path.join(__dirname, '..', 'spot-pictures')));

// Dashboard authentication middleware
const { authenticateToken } = require('./middleware/auth');
function dashboardAuth(req, res, next) {
  const token = req.query.token || req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) {
    return res.redirect('/login.html');
  }
  next();
}

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/spots', require('./routes/spots'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/public'));

// Page routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/user-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'user-dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'admin-dashboard.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'register.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', new Date().toISOString(), err.message);
  console.error('Stack:', err.stack);
  
  // Database errors
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({ error: 'Database connection lost' });
  }
  if (err.code === 'ER_CON_COUNT_ERROR') {
    return res.status(503).json({ error: 'Database error' });
  }
  if (err.code === 'ER_ACCESS_DENIED_ERROR') {
    return res.status(500).json({ error: 'Database authentication failed' });
  }
  
  // Validation errors
  if (err.status >= 400 && err.status < 500) {
    return res.status(err.status).json({ error: err.message || 'Invalid request' });
  }
  
  // Server errors
  res.status(500).json({ error: process.env.NODE_ENV === 'production' ? 'Server error' : err.message });
});

async function start() {
  try {
    await ensureDatabaseExists();
    await initializeDatabase();
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[${new Date().toISOString()}] Server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[SERVER] Shutting down...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
});

start();