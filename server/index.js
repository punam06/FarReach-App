require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { ensureDatabaseExists, initializeDatabase } = require('./config/schema');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..')));
app.use('/spot-pictures', express.static(path.join(__dirname, '..', 'spot pictures')));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/spots', require('./routes/spots'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', require('./routes/public'));

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

async function start() {
  try {
    await ensureDatabaseExists();
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log('Server running on http://localhost:' + PORT);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();