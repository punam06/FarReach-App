const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const db = require('./db');




const app = express();
const PORT = process.env.PORT || 3000;

const clientRoot = path.join(__dirname, '..');

app.use(express.json({ limit: '1mb' }));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Session-Token');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.static(clientRoot));

// Admin authentication middleware
async function requireAdmin(req, res, next) {
  const user = await currentUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Sign in required' });
  if (user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' });
  next();
}

// User authentication middleware
async function requireAuth(req, res, next) {
  const user = await currentUserFromRequest(req);
  if (!user) return res.status(401).json({ error: 'Sign in required' });
  next();
}


// Multer storage for spot images
const storage = multer.diskStorage({
  destination: path.join(clientRoot, 'spot-pictures'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });


app.get('/', (req, res) => {
  res.sendFile(path.join(clientRoot, 'index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(clientRoot, 'index.html'));
});

app.get('/admin-dashboard', (req, res) => {
  res.sendFile(path.join(clientRoot, 'admin-dashboard.html'));
});

app.get('/user-dashboard', (req, res) => {
  res.sendFile(path.join(clientRoot, 'user-dashboard.html'));
});



app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

function getApiKey() {
  const key = (process.env.OPENWEATHER_API_KEY ?? '').trim();
  if (!key || key === 'PUT_YOUR_KEY_HERE' || key === 'YOUR_API_KEY_HERE') return null;
  return key;
}

function createMockCurrent(district) {
  const now = Math.floor(Date.now() / 1000);
  return {
    mock: true,
    name: district,
    dt: now,
    main: { temp: 25, feels_like: 26, temp_min: 24, temp_max: 26, humidity: 78 },
    weather: [{ id: 800, main: 'Clear', description: 'clear sky', icon: '01d' }],
    wind: { speed: 3.5 },
  };
}

function createMockForecast(district, date) {
  // produce 8 slots for the day at 00:00,03:00,...21:00 local time (we'll use timezone +6h for BD)
  const timezone = 6 * 3600; // seconds
  const slots = [];
  const parts = [0,3,6,9,12,15,18,21];
  const base = new Date(date + 'T00:00:00Z');
  for (let h of parts) {
    const dt = Math.floor((new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate(), h)).getTime() / 1000));
    // simple pattern: clear at midday, clouds morning/evening, small rain chance at night
    let main = 'Clear', desc = 'clear sky', pop = 0;
    if (h === 6 || h === 18) { main = 'Clouds'; desc = 'scattered clouds'; pop = 15; }
    if (h === 21 || h === 0) { main = 'Rain'; desc = 'light rain'; pop = 55; }
    if (h === 9) { main = 'Clouds'; desc = 'broken clouds'; pop = 20; }
    const isDay = h >= 10 && h <= 16;
    const temp = isDay ? 26 : 25; // max 2 unit difference, 25 or 26.
    const wind = { speed: 3 + (h >= 12 ? 1 : 0) };
    slots.push({ dt, main: { temp }, weather: [{ main, description: desc }], pop: pop / 100, wind });
  }

  return {
    mock: true,
    city: { name: district, timezone },
    list: slots,
  };
}

function normalizeDistrict(district) {
  const s = (district ?? '').toString().trim();
  return s;
}

function formatCityDate(dtSeconds, timezoneOffsetSeconds = 0) {
  const shifted = new Date((dtSeconds + timezoneOffsetSeconds) * 1000);
  const year = shifted.getUTCFullYear();
  const month = String(shifted.getUTCMonth() + 1).padStart(2, '0');
  const day = String(shifted.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatHourLabel(hour) {
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:00 ${suffix}`;
}

function getDominantWeather(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Clear';
}

function getWeatherIcon(main) {
  const value = (main || '').toLowerCase();
  if (value.includes('thunder') || value.includes('storm')) return '⛈️';
  if (value.includes('rain') || value.includes('drizzle')) return '🌧️';
  if (value.includes('cloud')) return '☁️';
  if (value.includes('snow')) return '❄️';
  if (value.includes('mist') || value.includes('fog') || value.includes('haze')) return '🌫️';
  return '☀️';
}

function getSafetyVerdict({ dominantMain, rainChanceMax, tempMin, tempMax, windMax }) {
  const main = (dominantMain || '').toLowerCase();
  const hot = typeof tempMax === 'number' && tempMax >= 35;
  const cold = typeof tempMin === 'number' && tempMin <= 10;
  const windy = typeof windMax === 'number' && windMax >= 30;
  const rainy = main.includes('rain') || main.includes('drizzle') || main.includes('thunder') || rainChanceMax >= 55;

  if (rainy) {
    return {
      safe: false,
      label: 'Not safe for long tours',
      note: 'Rain or storm is likely. Carry rain gear or postpone if possible.',
    };
  }

  if (windy || hot || cold) {
    return {
      safe: true,
      label: 'Safe with caution',
      note: hot
        ? 'Hot conditions expected. Avoid midday travel and carry water.'
        : cold
          ? 'Cool conditions expected. Dress warmly and keep transport plans flexible.'
          : 'Wind is a bit strong. Keep the trip flexible and monitor updates.',
    };
  }

  return {
    safe: true,
    label: 'Good for travel',
    note: 'Weather looks travel-friendly for that date.',
  };
}

function summarizeForecast(data, date) {
  const timezoneOffsetSeconds = data?.city?.timezone ?? 0;
  const list = Array.isArray(data?.list) ? data.list : [];
  const firstAvailableDate = list.length ? formatCityDate(list[0].dt || 0, timezoneOffsetSeconds) : null;
  const lastAvailableDate = list.length ? formatCityDate(list[list.length - 1].dt || 0, timezoneOffsetSeconds) : null;
  const daySlots = list.filter((slot) => formatCityDate(slot.dt || 0, timezoneOffsetSeconds) === date);

  if (!daySlots.length) {
    return {
      available: false,
      date,
      message: firstAvailableDate && lastAvailableDate
        ? `OpenWeather free forecast only covers ${firstAvailableDate} to ${lastAvailableDate}. Pick a date within the next 5 days.`
        : 'No forecast slot available for that date.',
    };
  }

  const counts = {};
  let tempMin = Infinity;
  let tempMax = -Infinity;
  let windMax = 0;
  let rainChanceMax = 0;
  let bestSlot = null;

  daySlots.forEach((slot) => {
    const weather = slot.weather?.[0] || {};
    const main = (weather.main || 'Clear').toString();
    const temp = slot.main?.temp;
    const wind = slot.wind?.speed;
    const pop = Math.round((slot.pop ?? 0) * 100);
    const localHour = new Date(((slot.dt || 0) + timezoneOffsetSeconds) * 1000).getUTCHours();
    const rainPenalty = /rain|drizzle|thunder/i.test(main) ? 40 : 0;
    const score = (pop * 3) + rainPenalty + Math.abs(localHour - 12) * 2;

    counts[main] = (counts[main] || 0) + 1;

    if (typeof temp === 'number') {
      tempMin = Math.min(tempMin, temp);
      tempMax = Math.max(tempMax, temp);
    }

    if (typeof wind === 'number') {
      windMax = Math.max(windMax, Math.round(wind * 3.6));
    }

    rainChanceMax = Math.max(rainChanceMax, pop);

    if (!bestSlot || score < bestSlot.score) {
      bestSlot = { score, slot, localHour, pop };
    }
  });

  const dominantMain = getDominantWeather(counts);
  const bestWeather = bestSlot?.slot?.weather?.[0] || {};
  const safety = getSafetyVerdict({ dominantMain, rainChanceMax, tempMin, tempMax, windMax });

  let finalTempMax = Number.isFinite(tempMax) ? Math.round(tempMax) : null;
  let finalTempMin = Number.isFinite(tempMin) ? Math.round(tempMin) : null;
  
  if (finalTempMax !== null && finalTempMin !== null) {
    if (finalTempMax - finalTempMin > 2) {
      finalTempMin = finalTempMax - 2;
    }
  }

  return {
    available: true,
    date,
    icon: getWeatherIcon(dominantMain),
    dominantMain,
    dominantDescription: (bestWeather.description || dominantMain).toString(),
    tempMin: finalTempMin,
    tempMax: finalTempMax,
    windMax,
    rainChanceMax,
    bestWindow: bestSlot ? formatHourLabel(bestSlot.localHour) : null,
    slots: daySlots.length,
    safety,
    summary: `Mostly ${dominantMain.toLowerCase()} with ${rainChanceMax}% max rain chance.`,
    note: safety.note,
  };
}

app.get('/api/weather', async (req, res) => {
  try {
    const district = normalizeDistrict(req.query.district);
    if (!district) return res.status(400).json({ error: 'district is required' });

    const key = getApiKey();
    if (!key) {
      // return mock current weather so UI can work without a key
      return res.json(createMockCurrent(district));
    }

    const q = encodeURIComponent(`${district},BD`);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=metric&appid=${key}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'Weather lookup failed' });

    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/forecast', async (req, res) => {
  try {
    const district = normalizeDistrict(req.query.district);
    const date = (req.query.date ?? '').toString().trim(); // YYYY-MM-DD

    if (!district) return res.status(400).json({ error: 'district is required' });
    if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });


    const key = getApiKey();
    if (!key) {
      // return a mock forecast and summary
      const data = createMockForecast(district, date);
      const summary = summarizeForecast(data, date);
      return res.json({ district, date, data, summary });
    }

    const q = encodeURIComponent(`${district},BD`);
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${q}&units=metric&appid=${key}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'Forecast lookup failed' });

    const data = await r.json();
    const summary = summarizeForecast(data, date);
    res.json({ district, date, data, summary });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

// Simple in-memory caches to reduce repeated external calls
const geocodeCache = new Map();
const directionsCache = new Map();
function cacheGet(map, key, ttlMs = 60 * 60 * 1000) {
  const rec = map.get(key);
  if (!rec) return null;
  if (Date.now() - rec.t > ttlMs) {
    map.delete(key);
    return null;
  }
  return rec.v;
}
function cacheSet(map, key, value) {
  map.set(key, { v: value, t: Date.now() });
}

function getGoogleKey() {
  const key = (process.env.GOOGLE_MAPS_API_KEY ?? '').trim();
  if (!key || key === 'PUT_YOUR_KEY_HERE' || key === 'YOUR_API_KEY_HERE') return null;
  return key;
}

app.get('/api/geocode', async (req, res) => {
  try {
    const place = (req.query.place ?? '').toString().trim();
    if (!place) return res.status(400).json({ error: 'place is required' });

    const cached = cacheGet(geocodeCache, place, 24 * 60 * 60 * 1000);
    if (cached) return res.json({ cached: true, ...cached });

    const key = getGoogleKey();
    if (!key) return res.status(400).json({ error: 'Google API key not configured on server' });

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(place)}&key=${key}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'Geocode lookup failed' });
    const data = await r.json();
    cacheSet(geocodeCache, place, data);
    res.json({ cached: false, data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/directions', async (req, res) => {
  try {
    const origin = (req.query.origin ?? '').toString().trim(); // can be "lat,lng" or address
    const destination = (req.query.destination ?? '').toString().trim();
    const mode = (req.query.mode ?? 'driving').toString();

    if (!origin || !destination) return res.status(400).json({ error: 'origin and destination are required' });

    const cacheKey = `${origin}|${destination}|${mode}`;
    const cached = cacheGet(directionsCache, cacheKey, 30 * 60 * 1000);
    if (cached) return res.json({ cached: true, ...cached });

    const key = getGoogleKey();
    if (!key) return res.status(400).json({ error: 'Google API key not configured on server' });

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${encodeURIComponent(mode)}&key=${key}`;
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'Directions lookup failed' });
    const data = await r.json();
    cacheSet(directionsCache, cacheKey, data);
    res.json({ cached: false, data });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message || 'Server error' });
  }
});

const sessionTokens = new Map();

function normalizeEmail(email) {
  return (email ?? '').toString().trim().toLowerCase();
}

function normalizeDisplayName(name) {
  return (name ?? '').toString().trim().replace(/\s+/g, ' ');
}

function pruneExpiredSignups() {
  // Mocking for now, as pending signups should also move to DB
}


async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function verifyPassword(password, user) {
  if (!user?.password_hash) return false;
  return await bcrypt.compare(password, user.password_hash);
}


function generateVerificationCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function getMailTransporter() {
  const host = (process.env.SMTP_HOST ?? process.env.EMAIL_HOST ?? '').trim();
  const user = (process.env.SMTP_USER ?? process.env.EMAIL_USER ?? '').trim();
  const pass = (process.env.SMTP_PASS ?? process.env.EMAIL_PASS ?? '').trim();
  if (!host || !user || !pass || pass === 'YOUR_GMAIL_APP_PASSWORD' || pass === 'YOUR_GMAIL_APP_PASSWORD_HERE') return null;

  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE ?? 'false').toLowerCase() === 'true' || port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });
}

async function sendVerificationMail({ email, name, code }) {
  const transporter = getMailTransporter();
  const from = (process.env.SMTP_FROM ?? process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? process.env.EMAIL_USER ?? 'Bangladesh Tourism <no-reply@example.com>').trim();
  const subject = 'Your Bangladesh Tourism verification code';
  const text = `Hi ${name || 'there'},\n\nYour verification code is: ${code}\n\nThis code expires in 10 minutes.\nIf you did not request this code, you can ignore this message.`;

  if (!transporter) {
    console.log(`[auth] verification code for ${email}: ${code}`);
    return { delivery: 'mock' };
  }

   try {
     await transporter.sendMail({
       from,
       to: email,
       subject,
       text,
     });
     console.log(`[auth] email sent successfully to ${email}`);
     return { delivery: 'email' };
   } catch (err) {
     console.error(`[auth] email send failed for ${email}:`, err.message);
     console.log(`[auth] falling back to mock mode, verification code: ${code}`);
     return { delivery: 'mock', code };
  }
}

async function findUserByEmail(email) {
  const normalized = normalizeEmail(email);
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [normalized]);
  return rows[0] || null;
}

async function findPendingSignup(email) {
  const normalized = normalizeEmail(email);
  const [rows] = await db.query('SELECT * FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1', [normalized]);
  return rows[0] || null;
}

async function removePendingSignup(email) {
  const normalized = normalizeEmail(email);
  await db.query('DELETE FROM otp_verifications WHERE email = ?', [normalized]);
}

function isSignupCodeExpired(signup, now = new Date()) {
  if (!signup) return true;
  return new Date(signup.expires_at) <= now;
}

async function stampSignupCode(email, otp, now = new Date()) {
  const expiresAt = new Date(now.getTime() + 10 * 60 * 1000); // 10 mins
  await db.query(
    'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, ?)',
    [email, otp, expiresAt]
  );
}

function sendSignupResponse(res, signup, delivery, code) {
  const now = Date.now();
  return res.json({
    ok: true,
    nextStep: signup.codeVerified ? 'set-password' : 'verify-code',
    email: signup.email,
    name: signup.name,
    codeExpiresAt: signup.codeExpiresAt || 0,
    resendAvailableAt: signup.resendAvailableAt || 0,
    expiresInMinutes: Math.max(1, Math.ceil(((signup.codeExpiresAt || now) - now) / 60000)),
    resendAfterSeconds: Math.max(0, Math.ceil(((signup.resendAvailableAt || now) - now) / 1000)),
    delivery: delivery.delivery,
    previewCode: delivery.delivery === 'mock' ? code : undefined,
  });
}

function createSession(user) {
  const token = crypto.randomBytes(32).toString('hex');
  sessionTokens.set(token, {
    userId: user.id,
    createdAt: Date.now(),
  });
  return token;
}

function getAuthToken(req) {
  const bearer = (req.headers.authorization ?? '').toString();
  if (bearer.toLowerCase().startsWith('bearer ')) return bearer.slice(7).trim();
  const tokenHeader = (req.headers['x-session-token'] ?? '').toString().trim();
  return tokenHeader || null;
}

// --- DATABASE MIDDLEWARE ---
async function currentUserFromRequest(req) {
  const token = getAuthToken(req);
  if (!token) return null;
  const session = sessionTokens.get(token);
  if (!session) return null;
  
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [session.userId]);
  return rows[0] || null;
}


function publicUser(user) {
  if (!user) return null;
  const joinDate = user.created_at ? new Date(user.created_at).toISOString() : null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role || 'user',
    profile_pic: user.profile_pic || '',
    phone: user.phone || '',
    address: user.address || '',
    is_verified: !!user.is_verified,
    verifiedAt: joinDate,
    createdAt: joinDate,
    created_at: joinDate,
  };
}



app.get('/api/auth/me', async (req, res) => {
  const user = await currentUserFromRequest(req);
  if (!user) {
    return res.status(401).json({ error: 'Not signed in' });
  }
  return res.json({ user: publicUser(user) });
});


app.post('/api/auth/signup/start', async (req, res) => {
  try {
    const name = normalizeDisplayName(req.body?.name);
    const email = normalizeEmail(req.body?.email);

    if (!name) return res.status(400).json({ error: 'name is required' });
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'valid email is required' });

    if (await findUserByEmail(email)) {
      return res.status(409).json({ error: 'An account already exists with this email' });
    }

    const code = generateVerificationCode();
    await stampSignupCode(email, code);

    const delivery = await sendVerificationMail({ email, name, code });
    return res.json({ 
      ok: true, 
      nextStep: 'verify-code', 
      email, 
      delivery: delivery.delivery, 
      previewCode: delivery.delivery === 'mock' ? code : undefined,
      code: (process.env.NODE_ENV === 'development' || delivery.delivery === 'mock' ? code : undefined) 
    });
  } catch (err) {
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/signup/resend', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    if (!email || !email.includes('@')) return res.status(400).json({ error: 'valid email is required' });

    const signup = await findPendingSignup(email);
    const code = generateVerificationCode();
    await stampSignupCode(email, code);

    const delivery = await sendVerificationMail({ email, name: signup?.name || 'User', code });
    return res.json({ 
      ok: true, 
      nextStep: 'verify-code', 
      email, 
      delivery: delivery.delivery, 
      previewCode: delivery.delivery === 'mock' ? code : undefined,
      code: (process.env.NODE_ENV === 'development' || delivery.delivery === 'mock' ? code : undefined) 
    });
  } catch (err) {
    res.status(500).json({ error: 'Resend failed' });
  }
});

app.post('/api/auth/signup/verify-code', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const code = (req.body?.code ?? '').toString().trim();

    const signup = await findPendingSignup(email);
    if (!signup) return res.status(404).json({ error: 'No signup request found' });

    if (isSignupCodeExpired(signup)) return res.status(410).json({ error: 'Code expired' });
    if (signup.otp !== code) return res.status(400).json({ error: 'Invalid code' });

    await db.query('UPDATE otp_verifications SET verified = 1 WHERE id = ?', [signup.id]);
    res.json({ ok: true, nextStep: 'set-password', email });
  } catch (err) { res.status(500).json({ error: 'Verify failed' }); }
});

app.post('/api/auth/signup/set-password', async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const { password, name } = req.body;

    const signup = await findPendingSignup(email);
    if (!signup || !signup.verified) return res.status(400).json({ error: 'Please verify code first' });

    const hash = await hashPassword(password);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, is_verified) VALUES (?, ?, ?, 1)',
      [name || 'User', email, hash]
    );

    const user = { id: result.insertId, name: name || 'User', email, role: 'user' };
    const token = createSession(user);

    await removePendingSignup(email);
    res.json({ ok: true, token, user: publicUser(user) });
  } catch (err) { res.status(500).json({ error: 'Set password failed' }); }
});


app.post('/api/auth/login', async (req, res) => {

  try {
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password;

    if (!email || !password) return res.status(400).json({ error: 'email and password are required' });

    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    console.log(`[auth] login attempt for ${email}, user found: ${!!user}`);

    if (!user) return res.status(401).json({ error: 'invalid email or password' });

    const isValid = await verifyPassword(password, user);
    if (!isValid) {
      return res.status(401).json({ error: 'invalid email or password' });
    }

    const token = createSession(user);
    res.json({ ok: true, token, user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



app.post('/api/auth/logout', (req, res) => {
  const token = getAuthToken(req);
  if (token) sessionTokens.delete(token);
  return res.json({ ok: true });
});

app.post('/api/hotels/search', async (req, res) => {
  try {
    const { city } = req.body;
    const baseRate = 2500;
    
    // Spot-specific hotel mappings
    const spotHotels = {
      "Cox's Bazar": [
        { name: "Sayeman Beach Resort", url: "https://www.google.com/search?q=Sayeman+Beach+Resort+Coxs+Bazar", price: 8500, rating: 4.8 },
        { name: "Ocean Paradise Hotel", url: "https://www.google.com/search?q=Ocean+Paradise+Hotel+Coxs+Bazar", price: 7500, rating: 4.6 },
        { name: "Royal Tulip Sea Pearl", url: "https://www.google.com/search?q=Royal+Tulip+Sea+Pearl+Coxs+Bazar", price: 12000, rating: 4.9 },
        { name: "Long Beach Hotel", url: "https://www.google.com/search?q=Long+Beach+Hotel+Coxs+Bazar", price: 6500, rating: 4.5 }
      ],
      "Sylhet": [
        { name: "Grand Sylhet Hotel", url: "https://www.google.com/search?q=Grand+Sylhet+Hotel+Resort", price: 7800, rating: 4.7 },
        { name: "Rose View Hotel", url: "https://www.google.com/search?q=Rose+View+Hotel+Sylhet", price: 6200, rating: 4.5 },
        { name: "Hotel Noorjahan Grand", url: "https://www.google.com/search?q=Hotel+Noorjahan+Grand+Sylhet", price: 5500, rating: 4.4 },
        { name: "Excelsior Sylhet", url: "https://www.google.com/search?q=Excelsior+Sylhet+Hotel", price: 4800, rating: 4.3 }
      ],
      "Dhaka": [
        { name: "Pan Pacific Sonargaon", url: "https://www.google.com/search?q=Pan+Pacific+Sonargaon+Dhaka", price: 15000, rating: 4.8 },
        { name: "InterContinental Dhaka", url: "https://www.google.com/search?q=InterContinental+Dhaka", price: 18000, rating: 4.9 },
        { name: "Radisson Blu Dhaka", url: "https://www.google.com/search?q=Radisson+Blu+Dhaka", price: 14000, rating: 4.7 },
        { name: "The Westin Dhaka", url: "https://www.google.com/search?q=The+Westin+Dhaka", price: 16500, rating: 4.8 }
      ],
      "Sajek Valley": [
        { name: "Sajek Resort (PBA)", url: "https://www.google.com/search?q=Sajek+Resort+PBA", price: 5000, rating: 4.6 },
        { name: "Runmoy Resort", url: "https://www.google.com/search?q=Runmoy+Resort+Sajek", price: 4500, rating: 4.5 },
        { name: "Meghpunji Resort", url: "https://www.google.com/search?q=Meghpunji+Resort+Sajek", price: 6000, rating: 4.7 },
        { name: "Lushai Heritage", url: "https://www.google.com/search?q=Lushai+Heritage+Sajek", price: 3500, rating: 4.3 }
      ],
      "Sundarbans": [
        { name: "Tiger Garden International", url: "https://www.google.com/search?q=Tiger+Garden+International+Hotel+Khulna", price: 4500, rating: 4.4 },
        { name: "City Inn Ltd", url: "https://www.google.com/search?q=City+Inn+Hotel+Khulna", price: 5500, rating: 4.5 },
        { name: "Hotel Royal International", url: "https://www.google.com/search?q=Hotel+Royal+International+Khulna", price: 4000, rating: 4.2 },
        { name: "Castle Salam", url: "https://www.google.com/search?q=Hotel+Castle+Salam+Khulna", price: 5200, rating: 4.3 }
      ]
    };

    const hotels = spotHotels[city] || [
      { name: `Agoda Hotels in ${city || 'Bangladesh'}`, url: `https://www.agoda.com/search?text=${encodeURIComponent(city || 'Bangladesh')}`, price: baseRate * 2, rating: 4.5 },
      { name: `GoZayan Hotels in ${city || 'Bangladesh'}`, url: "https://gozayan.com/hotel", price: baseRate * 1.5, rating: 4.3 },
      { name: `ShareTrip Hotels in ${city || 'Bangladesh'}`, url: "https://sharetrip.net/hotel", price: baseRate * 1.8, rating: 4.4 },
      { name: `Kayak Hotels in ${city || 'Bangladesh'}`, url: `https://www.kayak.com/hotels/${encodeURIComponent(city || 'Bangladesh')}`, price: baseRate, rating: 4.2 }
    ];

    res.json({ hotels });
  } catch (err) { res.status(500).json({ error: 'Search failed' }); }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const { spotId, destinationName } = req.query;
    let query = `
      SELECT r.*, u.name as userName, u.profile_pic as userAvatar, s.name as spotName 
      FROM reviews r 
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN spots s ON r.spot_id = s.id
    `;
    let params = [];
    
    if (spotId) {
      query += ' WHERE r.spot_id = ?';
      params.push(spotId);
    } else if (destinationName) {
      query += ' WHERE s.name = ?';
      params.push(destinationName);
    }
    query += ' ORDER BY r.created_at DESC';

    const [reviews] = await db.query(query, params);
    return res.json({ ok: true, reviews });
  } catch (err) {
    console.error('Fetch reviews error:', err);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

app.post('/api/reviews', async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'sign in required' });

    let { spotId, destinationName, rating, text } = req.body;
    
    if (!spotId && !destinationName) return res.status(400).json({ error: 'spotId or destinationName is required' });
    if (!rating || rating < 1 || rating > 5) return res.status(400).json({ error: 'invalid rating' });

    // Look up spot_id if only destinationName is provided
    if (!spotId && destinationName) {
      const [spotsRes] = await db.query('SELECT id FROM spots WHERE name = ?', [destinationName]);
      if (spotsRes.length === 0) return res.status(404).json({ error: 'Spot not found in database' });
      spotId = spotsRes[0].id;
    }

    // Enforce booking requirement
    const [bookings] = await db.query(
      "SELECT id FROM bookings WHERE user_id = ? AND spot_id = ? AND type = 'package' AND status = 'confirmed'",
      [user.id, spotId]
    );

    if (bookings.length === 0) {
      return res.status(403).json({ error: 'You can only review a spot if you have visited it and taken our packages.' });
    }

    await db.query(
      'INSERT INTO reviews (user_id, spot_id, rating, text) VALUES (?, ?, ?, ?)',
      [user.id, spotId, rating, text]
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error('Post review error:', err);
    return res.status(500).json({ error: err.message });
  }
});



app.get('/api/site-content', (req, res) => {
  return res.json({ 
    ok: true, 
    content: {
      aboutUs: 'Exploring the beauty of Bangladesh.',
      contactUs: 'contact@torisom.com',
      travelGuide: 'Pack light and stay hydrated.',
      faqs: [],
      budgets: {}
    } 
  });
});


// Public spot lookup for booking (no admin required)
app.get('/api/spots/lookup', async (req, res) => {
  try {
    const name = (req.query.name || '').trim();
    if (!name) return res.status(400).json({ error: 'name query is required' });
    const [rows] = await db.query('SELECT id, name, budget_category FROM spots WHERE name = ?', [name]);
    if (rows.length === 0) return res.json({ spot: null });
    res.json({ spot: rows[0] });
  } catch (err) { res.status(500).json({ error: 'Lookup failed' }); }
});

// Public spots list — used by the main site to dynamically load all spots from the DB
app.get('/api/spots', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.id, s.name, s.category, s.description, s.history, s.image, s.budget_category,
             s.latitude, s.longitude,
             d.name as district_name, dv.name as division_name
      FROM spots s
      LEFT JOIN districts d ON s.district_id = d.id
      LEFT JOIN divisions dv ON s.division_id = dv.id
      ORDER BY s.id ASC
    `);
    res.json({ spots: rows });
  } catch (err) { res.status(500).json({ error: 'Spots failed' }); }
});

// --- ADMIN APIS ---

app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    const [u] = await db.query('SELECT COUNT(*) as count FROM users WHERE role = "user"');
    const [s] = await db.query('SELECT COUNT(*) as count FROM spots');
    const [r] = await db.query('SELECT COUNT(*) as count FROM reviews');
    const [b] = await db.query('SELECT COUNT(*) as count FROM bookings WHERE status = "pending"');
    res.json({
      users: u[0].count,
      spots: s[0].count,
      reviews: r[0].count,
      pending: b[0].count
    });
  } catch (err) { res.status(500).json({ error: 'Stats failed' }); }
});

app.get('/api/admin/spots', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT s.*, d.name as district_name, dv.name as division_name 
      FROM spots s 
      LEFT JOIN districts d ON s.district_id = d.id 
      LEFT JOIN divisions dv ON s.division_id = dv.id 
      ORDER BY s.id DESC
    `);
    res.json({ spots: rows });
  } catch (err) { res.status(500).json({ error: 'Spots failed' }); }
});

app.post('/api/admin/spots', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, district_id, division_id, category, description, history, budget_category, latitude, longitude } = req.body;
    const image = req.file ? req.file.filename : '';
    const [result] = await db.query(
      'INSERT INTO spots (name, district_id, division_id, category, description, history, image, budget_category, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, district_id || null, division_id || null, category || 'General', description || '', history || '', image, budget_category || 'Low', latitude || null, longitude || null]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/spots/:id', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, district_id, division_id, category, description, history, budget_category, latitude, longitude } = req.body;
    const image = req.file ? req.file.filename : undefined;
    let query = 'UPDATE spots SET name=?, district_id=?, division_id=?, category=?, description=?, history=?, budget_category=?, latitude=?, longitude=?';
    let params = [name, district_id || null, division_id || null, category || 'General', description || '', history || '', budget_category || 'Low', latitude || null, longitude || null];
    if (image) { query += ', image=?'; params.push(image); }
    query += ' WHERE id=?';
    params.push(req.params.id);
    await db.query(query, params);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/spots/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM spots WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM users ORDER BY created_at DESC');
    res.json({ users: rows.map(publicUser) });
  } catch (err) { res.status(500).json({ error: 'Users failed' }); }
});

app.put('/api/admin/users/:id/role', requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    if (!role || !['admin', 'user'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin or user.' });
    }
    // Prevent admin from demoting themselves
    const currentUser = await currentUserFromRequest(req);
    if (currentUser && currentUser.id === parseInt(req.params.id) && role !== 'admin') {
      return res.status(400).json({ error: 'You cannot remove your own admin role.' });
    }
    await db.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Role update failed' }); }
});

app.delete('/api/admin/users/:id', requireAdmin, async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    const currentUser = await currentUserFromRequest(req);
    if (currentUser && currentUser.id === parseInt(req.params.id)) {
      return res.status(400).json({ error: 'You cannot delete your own account from the admin panel.' });
    }
    // Delete user's related data first to avoid FK constraint errors
    await db.query('DELETE FROM reviews WHERE user_id = ?', [req.params.id]);
    await db.query('DELETE FROM saved_spots WHERE user_id = ?', [req.params.id]);
    await db.query('DELETE FROM bookings WHERE user_id = ?', [req.params.id]);
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
});

app.post('/api/admin/divisions', requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query('INSERT INTO divisions (name) VALUES (?)', [req.body.name]);
    res.json({ ok: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: 'Add failed' }); }
});

app.put('/api/admin/divisions/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE divisions SET name = ? WHERE id = ?', [req.body.name, req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Update failed' }); }
});

app.delete('/api/admin/divisions/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM divisions WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

app.post('/api/admin/districts', requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query('INSERT INTO districts (name, division_id) VALUES (?, ?)', [req.body.name, req.body.division_id]);
    res.json({ ok: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: 'Add failed' }); }
});

app.put('/api/admin/districts/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE districts SET name = ?, division_id = ? WHERE id = ?', [req.body.name, req.body.division_id, req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Update failed' }); }
});

app.delete('/api/admin/districts/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM districts WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

app.post('/api/admin/guides', requireAdmin, async (req, res) => {
  try {
    const { name, experience, rating, languages, specialties, price, contact, spot_id } = req.body;
    const [result] = await db.query(
      'INSERT INTO guides (name, experience, rating, languages, specialties, price, contact, spot_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, experience || '', rating || 0, languages || '', specialties || '', price || 0, contact || '', spot_id || null]
    );
    res.json({ ok: true, id: result.insertId });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/admin/guides/:id', requireAdmin, async (req, res) => {
  try {
    const { name, experience, rating, languages, specialties, price, contact, spot_id } = req.body;
    await db.query(
      'UPDATE guides SET name=?, experience=?, rating=?, languages=?, specialties=?, price=?, contact=?, spot_id=? WHERE id=?',
      [name, experience, rating || 0, languages, specialties, price || 0, contact, spot_id || null, req.params.id]
    );
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/admin/guides/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM guides WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});


app.get('/api/admin/reviews', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT r.*, u.name as user_name, s.name as spot_name 
      FROM reviews r 
      LEFT JOIN users u ON r.user_id = u.id 
      LEFT JOIN spots s ON r.spot_id = s.id 
      ORDER BY r.created_at DESC
    `);
    res.json({ reviews: rows });
  } catch (err) { res.status(500).json({ error: 'Reviews failed' }); }
});

app.delete('/api/admin/reviews/:id', requireAdmin, async (req, res) => {
  try {
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

app.put('/api/admin/reviews/:id/reply', requireAdmin, async (req, res) => {
  try {
    const { reply } = req.body;
    await db.query('UPDATE reviews SET admin_reply = ?, reply_at = CURRENT_TIMESTAMP WHERE id = ?', [reply, req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Reply failed' }); }
});

app.get('/api/admin/divisions', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM divisions ORDER BY name');
    res.json({ divisions: rows });
  } catch (err) { res.status(500).json({ error: 'Divisions failed' }); }
});

app.get('/api/admin/districts', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT d.*, dv.name as division_name FROM districts d JOIN divisions dv ON d.division_id = dv.id ORDER BY dv.name, d.name');
    res.json({ districts: rows });
  } catch (err) { res.status(500).json({ error: 'Districts failed' }); }
});

app.get('/api/admin/guides', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT g.*, s.name as spot_name FROM guides g LEFT JOIN spots s ON g.spot_id = s.id ORDER BY g.name');
    res.json({ guides: rows });
  } catch (err) { res.status(500).json({ error: 'Guides failed' }); }
});

app.get('/api/admin/bookings', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT b.*, u.name as user_name, u.email as user_email FROM bookings b LEFT JOIN users u ON b.user_id = u.id ORDER BY b.created_at DESC');
    res.json({ bookings: rows });
  } catch (err) { res.status(500).json({ error: 'Bookings failed' }); }
});

app.put('/api/admin/bookings/:id/status', requireAdmin, async (req, res) => {
  try {
    await db.query('UPDATE bookings SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Update failed' }); }
});


// --- USER DASHBOARD APIS ---

app.get('/api/user/dashboard', requireAuth, async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);
    const [rc] = await db.query('SELECT COUNT(*) as count FROM reviews WHERE user_id = ?', [user.id]);
    const [sc] = await db.query('SELECT COUNT(*) as count FROM saved_spots WHERE user_id = ?', [user.id]);
    const [rr] = await db.query(`
      SELECT r.*, s.name as spot_name 
      FROM reviews r 
      LEFT JOIN spots s ON r.spot_id = s.id 
      WHERE r.user_id = ? 
      ORDER BY r.created_at DESC LIMIT 5
    `, [user.id]);
    const [rs] = await db.query(`
      SELECT s.*, d.name as district_name 
      FROM saved_spots ss 
      JOIN spots s ON ss.spot_id = s.id 
      LEFT JOIN districts d ON s.district_id = d.id
      WHERE ss.user_id = ? 
      ORDER BY ss.created_at DESC LIMIT 5
    `, [user.id]);
    
    res.json({ 
      reviewCount: rc[0].count, 
      savedCount: sc[0].count, 
      recentReviews: rr, 
      recentSaved: rs 
    });
  } catch (err) { res.status(500).json({ error: 'User dashboard failed' }); }
});

app.get('/api/user/reviews', requireAuth, async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);
    const [rows] = await db.query(`
      SELECT r.*, s.name as spot_name 
      FROM reviews r 
      LEFT JOIN spots s ON r.spot_id = s.id 
      WHERE r.user_id = ? 
      ORDER BY r.created_at DESC
    `, [user.id]);
    res.json({ reviews: rows });
  } catch (err) { res.status(500).json({ error: 'Reviews failed' }); }
});

app.get('/api/user/saved-spots', requireAuth, async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);
    const [rows] = await db.query(`
      SELECT s.*, d.name as district_name 
      FROM saved_spots ss 
      JOIN spots s ON ss.spot_id = s.id 
      LEFT JOIN districts d ON s.district_id = d.id
      WHERE ss.user_id = ? 
      ORDER BY ss.created_at DESC
    `, [user.id]);
    res.json({ spots: rows });
  } catch (err) { res.status(500).json({ error: 'Saved spots failed' }); }
});



app.get('/api/user/guides', requireAuth, async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);
    // Return guides for spots the user has saved (robust against duplicate spots with slightly different names)
    const [savedGuides] = await db.query(`
      SELECT DISTINCT g.*, s.name as spot_name, 1 as is_saved_spot
      FROM guides g 
      JOIN spots s ON g.spot_id = s.id
      JOIN saved_spots ss ON ss.user_id = ?
      JOIN spots s2 ON ss.spot_id = s2.id
      WHERE g.spot_id = ss.spot_id
         OR LOWER(REPLACE(REPLACE(REPLACE(REPLACE(s.name, ' ', ''), 'Beach', ''), 'Sea', ''), 'Island', '')) = 
            LOWER(REPLACE(REPLACE(REPLACE(REPLACE(s2.name, ' ', ''), 'Beach', ''), 'Sea', ''), 'Island', ''))
      ORDER BY g.rating DESC
    `, [user.id]);

    res.json({ guides: savedGuides });
  } catch (err) { res.status(500).json({ error: 'Guides failed' }); }
});

app.get('/api/user/bookings', requireAuth, async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);
    const [rows] = await db.query(`
      SELECT b.*, s.name as spot_name 
      FROM bookings b 
      LEFT JOIN spots s ON b.spot_id = s.id 
      WHERE b.user_id = ? 
      ORDER BY b.created_at DESC
    `, [user.id]);
    res.json({ bookings: rows });
  } catch (err) { res.status(500).json({ error: 'Bookings failed' }); }
});

// --- BOOKING CREATION ---
app.post('/api/bookings', requireAuth, async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);
    const { spot_id, booking_date, persons, price: customPrice } = req.body;

    if (!spot_id) return res.status(400).json({ error: 'spot_id is required' });
    if (!booking_date) return res.status(400).json({ error: 'booking_date is required' });

    const numPersons = parseInt(persons) || 1;

    // Look up spot
    const [spotRows] = await db.query('SELECT id, name, budget_category FROM spots WHERE id = ?', [spot_id]);
    if (spotRows.length === 0) return res.status(404).json({ error: 'Spot not found' });
    const spot = spotRows[0];

    // Prevent duplicate active booking for same user + spot + date
    const [existing] = await db.query(
      "SELECT id FROM bookings WHERE user_id = ? AND spot_id = ? AND booking_date = ? AND status != 'cancelled'",
      [user.id, spot_id, booking_date]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'You already have an active booking for this spot on this date.' });
    }

    // Calculate estimated price based on budget category and persons
    const baseRate = spot.budget_category === 'High' ? 5000 : (spot.budget_category === 'Mid' ? 3750 : 2500);
    const price = parseInt(customPrice) || (baseRate * numPersons);

    const [result] = await db.query(
      "INSERT INTO bookings (user_id, spot_id, type, target_name, price, booking_date, status) VALUES (?, ?, 'package', ?, ?, ?, 'confirmed')",
      [user.id, spot_id, spot.name, price, booking_date]
    );

    res.json({ 
      ok: true, 
      id: result.insertId, 
      message: `Booking confirmed for ${spot.name} on ${booking_date}`,
      booking: {
        id: result.insertId,
        spot_name: spot.name,
        price,
        booking_date,
        status: 'confirmed',
        persons: numPersons
      }
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Booking failed' });
  }
});

// --- BOOKING CANCELLATION ---
app.delete('/api/user/bookings/:id', requireAuth, async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);

    // Get the booking
    const [rows] = await db.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [req.params.id, user.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const booking = rows[0];

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: 'This booking is already cancelled.' });
    }

    // Check 24-hour cancellation window: booking_date must be at least 24h away
    if (booking.booking_date) {
      const bookingDate = new Date(booking.booking_date);
      const now = new Date();
      const hoursUntilBooking = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntilBooking < 24) {
        return res.status(400).json({ 
          error: 'Cancellation is not allowed within 24 hours of the booking date.' 
        });
      }
    }

    await db.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [req.params.id]);
    res.json({ ok: true, message: 'Booking cancelled successfully.' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Cancellation failed' });
  }
});
app.put('/api/auth/profile', requireAuth, upload.single('profile_pic'), async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);
    const { name, phone, address, password } = req.body;
    const profile_pic = req.file ? req.file.filename : undefined;

    let query = 'UPDATE users SET name=?, phone=?, address=?';
    let params = [name, phone || '', address || ''];

    if (profile_pic) {
      query += ', profile_pic=?';
      params.push(profile_pic);
    }

    if (password) {
      const hash = await hashPassword(password);
      query += ', password_hash=?';
      params.push(hash);
    }

    query += ' WHERE id=?';
    params.push(user.id);

    await db.query(query, params);
    
    const [updated] = await db.query('SELECT * FROM users WHERE id = ?', [user.id]);
    res.json({ ok: true, user: publicUser(updated[0]) });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.put('/api/user/reviews/:id', requireAuth, async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);
    const { rating, text } = req.body;
    await db.query('UPDATE reviews SET rating=?, text=? WHERE id=? AND user_id=?', [rating, text, req.params.id, user.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Update failed' }); }
});

app.delete('/api/user/reviews/:id', requireAuth, async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);
    await db.query('DELETE FROM reviews WHERE id=? AND user_id=?', [req.params.id, user.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

app.delete('/api/user/saved-spots/:id', requireAuth, async (req, res) => {
  try {
    const user = await currentUserFromRequest(req);
    await db.query('DELETE FROM saved_spots WHERE spot_id=? AND user_id=?', [req.params.id, user.id]);
    res.json({ ok: true });
  } catch (err) { res.status(500).json({ error: 'Delete failed' }); }
});

const seedDatabase = require('./seed');

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
  // Run database synchronization seeder
  seedDatabase().catch(err => {
    console.error('[startup] Failed to seed database:', err);
  });
});
