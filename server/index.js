require('dotenv').config({ path: require('path').join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { query, transaction } = require('./src/db');
const { authRequired, requireRole } = require('./src/middleware/auth');
const {
  hashOtp,
  generateOtp,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken
} = require('./src/utils/security');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const RESERVED_ADMINS = new Set([
  'punam.papri@gmail.com',
  'rebekasultanaorce455@gmail.com'
]);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

function badRequest(res, msg) {
  return res.status(400).json({ error: msg });
}

function toBool(v) {
  if (v === true || v === 'true' || v === 1 || v === '1') return 1;
  if (v === false || v === 'false' || v === 0 || v === '0') return 0;
  return null;
}

function calculateNights(checkinDate, checkoutDate) {
  const inDate = new Date(checkinDate);
  const outDate = new Date(checkoutDate);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) return 0;
  return Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
}

async function getRoleIdByName(roleName) {
  const rows = await query('SELECT id FROM roles WHERE name = ? LIMIT 1', [roleName]);
  return rows[0]?.id || null;
}

async function writeActivity(userId, activityType, referenceId = null, metadata = null, conn = null) {
  const sql = `INSERT INTO activity_logs (user_id, activity_type, reference_id, metadata_json)
               VALUES (?, ?, ?, ?)`;
  const params = [userId, activityType, referenceId, metadata ? JSON.stringify(metadata) : null];
  if (conn) {
    await conn.execute(sql, params);
  } else {
    await query(sql, params);
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1');
    res.json({ ok: true, db: 'connected' });
  } catch (err) {
    res.status(500).json({ ok: false, db: 'disconnected', error: err.message });
  }
});

app.post('/api/auth/register', authLimiter, async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const email = (req.body.email || '').trim().toLowerCase();
    const phone = (req.body.phone || '').trim() || null;
    const password = req.body.password || '';

    if (!name || !email || !password) return badRequest(res, 'name, email and password are required');
    if (password.length < 8) return badRequest(res, 'password must be at least 8 chars');

    const users = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    if (users.length) return res.status(409).json({ error: 'email already exists' });

    const roleName = RESERVED_ADMINS.has(email) ? 'admin' : 'user';
    const roleId = await getRoleIdByName(roleName);
    if (!roleId) return res.status(500).json({ error: 'roles are not seeded' });

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await transaction(async (conn) => {
      const [insertUser] = await conn.execute(
        `INSERT INTO users (name, email, phone, password_hash, is_verified, is_active, role_id)
         VALUES (?, ?, ?, ?, 0, 1, ?)`,
        [name, email, phone, passwordHash, roleId]
      );

      const otp = generateOtp();
      const otpHash = hashOtp(otp);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await conn.execute(
        `INSERT INTO otp_verifications (user_id, otp_hash, purpose, expires_at)
         VALUES (?, ?, 'registration', ?)`,
        [insertUser.insertId, otpHash, expiresAt]
      );

      return { userId: insertUser.insertId, otp, expiresAt };
    });

    const includeOtp = String(process.env.INCLUDE_OTP_IN_RESPONSE || 'true') === 'true';

    res.status(201).json({
      message: 'Registered. Verify OTP to activate account.',
      userId: result.userId,
      ...(includeOtp ? { otp: result.otp } : {}),
      otpExpiresAt: result.expiresAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/auth/verify-otp', otpLimiter, async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const otp = (req.body.otp || '').trim();
    const purpose = (req.body.purpose || 'registration').trim();

    if (!email || !otp) return badRequest(res, 'email and otp are required');

    const users = await query('SELECT id FROM users WHERE email = ? LIMIT 1', [email]);
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'user not found' });

    const rows = await query(
      `SELECT id, otp_hash, expires_at, attempts, is_used
       FROM otp_verifications
       WHERE user_id = ? AND purpose = ?
       ORDER BY id DESC
       LIMIT 1`,
      [user.id, purpose]
    );

    const otpRow = rows[0];
    if (!otpRow) return res.status(404).json({ error: 'otp not found' });
    if (otpRow.is_used) return badRequest(res, 'otp already used');
    if (new Date(otpRow.expires_at).getTime() < Date.now()) return badRequest(res, 'otp expired');

    if (otpRow.attempts >= 5) return res.status(429).json({ error: 'max otp attempts reached' });

    const incoming = hashOtp(otp);
    if (incoming !== otpRow.otp_hash) {
      await query('UPDATE otp_verifications SET attempts = attempts + 1 WHERE id = ?', [otpRow.id]);
      return badRequest(res, 'invalid otp');
    }

    await transaction(async (conn) => {
      await conn.execute(
        'UPDATE otp_verifications SET is_used = 1, verified_at = NOW() WHERE id = ?',
        [otpRow.id]
      );
      await conn.execute('UPDATE users SET is_verified = 1 WHERE id = ?', [user.id]);
    });

    res.json({ message: 'OTP verified successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/auth/resend-otp', otpLimiter, async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const purpose = (req.body.purpose || 'registration').trim();

    if (!email) return badRequest(res, 'email is required');

    const users = await query('SELECT id, is_verified FROM users WHERE email = ? LIMIT 1', [email]);
    const user = users[0];
    if (!user) return res.status(404).json({ error: 'user not found' });

    if (purpose === 'registration' && user.is_verified) {
      return badRequest(res, 'user already verified');
    }

    const cooldownRows = await query(
      `SELECT created_at
       FROM otp_verifications
       WHERE user_id = ? AND purpose = ?
       ORDER BY id DESC
       LIMIT 1`,
      [user.id, purpose]
    );

    if (cooldownRows.length) {
      const createdAtMs = new Date(cooldownRows[0].created_at).getTime();
      const diff = Date.now() - createdAtMs;
      if (diff < 60 * 1000) {
        return res.status(429).json({ error: 'wait before requesting another OTP' });
      }
    }

    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await query(
      `INSERT INTO otp_verifications (user_id, otp_hash, purpose, expires_at)
       VALUES (?, ?, ?, ?)`,
      [user.id, otpHash, purpose, expiresAt]
    );

    const includeOtp = String(process.env.INCLUDE_OTP_IN_RESPONSE || 'true') === 'true';

    res.json({
      message: 'OTP resent',
      ...(includeOtp ? { otp } : {}),
      otpExpiresAt: expiresAt
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/auth/login', authLimiter, async (req, res) => {
  try {
    const email = (req.body.email || '').trim().toLowerCase();
    const password = req.body.password || '';

    if (!email || !password) return badRequest(res, 'email and password are required');

    const rows = await query(
      `SELECT u.id, u.email, u.password_hash, u.is_verified, u.is_active, r.name AS role_name
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.email = ?
       LIMIT 1`,
      [email]
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'invalid credentials' });
    if (!user.is_active) return res.status(403).json({ error: 'user is inactive' });
    if (!user.is_verified) return res.status(403).json({ error: 'user not verified' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: 'invalid credentials' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    const refreshHash = hashToken(refreshToken);
    const refreshExpiryDays = Number(process.env.REFRESH_TOKEN_DAYS || 30);
    const expiresAt = new Date(Date.now() + refreshExpiryDays * 24 * 60 * 60 * 1000);

    await transaction(async (conn) => {
      await conn.execute('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);
      await conn.execute(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [user.id, refreshHash, expiresAt]
      );
    });

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, email: user.email, role: user.role_name }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || '';
    if (!refreshToken) return badRequest(res, 'refreshToken is required');

    const payload = verifyRefreshToken(refreshToken);
    if (payload.type !== 'refresh') return badRequest(res, 'invalid token type');

    const tokenHash = hashToken(refreshToken);

    const rows = await query(
      `SELECT rt.id, rt.user_id, rt.expires_at, rt.revoked_at, u.is_active, r.name AS role_name
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       JOIN roles r ON r.id = u.role_id
       WHERE rt.token_hash = ?
       LIMIT 1`,
      [tokenHash]
    );

    const row = rows[0];
    if (!row || row.revoked_at || new Date(row.expires_at).getTime() < Date.now() || !row.is_active) {
      return res.status(401).json({ error: 'invalid refresh token' });
    }

    const accessToken = signAccessToken({ id: row.user_id, role_name: row.role_name });
    res.json({ accessToken });
  } catch (err) {
    res.status(401).json({ error: 'invalid refresh token' });
  }
});

app.post('/api/auth/logout', async (req, res) => {
  try {
    const refreshToken = req.body.refreshToken || '';
    if (!refreshToken) return badRequest(res, 'refreshToken is required');

    const tokenHash = hashToken(refreshToken);
    await query('UPDATE refresh_tokens SET revoked_at = NOW() WHERE token_hash = ?', [tokenHash]);

    res.json({ message: 'Logged out' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/spots', async (req, res) => {
  try {
    const district = (req.query.district || '').trim();
    const category = (req.query.category || '').trim();
    const search = (req.query.search || '').trim();

    const clauses = ['s.is_active = 1', 's.deleted_at IS NULL'];
    const params = [];

    if (district) {
      clauses.push('d.name = ?');
      params.push(district);
    }
    if (category) {
      clauses.push('c.name = ?');
      params.push(category);
    }
    if (search) {
      clauses.push('(s.name LIKE ? OR d.name LIKE ? OR s.description LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like, like);
    }

    const rows = await query(
      `SELECT s.id, s.name, s.description, s.history, s.image_url,
              d.id AS district_id, d.name AS district,
              c.id AS category_id, c.name AS category
       FROM spots s
       JOIN districts d ON d.id = s.district_id
       JOIN categories c ON c.id = s.category_id
       WHERE ${clauses.join(' AND ')}
       ORDER BY s.name ASC`,
      params
    );

    res.json({ spots: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/reviews', async (req, res) => {
  try {
    const spotId = req.query.spotId ? Number(req.query.spotId) : null;
    const userId = req.query.userId ? Number(req.query.userId) : null;

    const clauses = ['rv.deleted_at IS NULL', 'rv.is_approved = 1'];
    const params = [];

    if (spotId) {
      clauses.push('rv.spot_id = ?');
      params.push(spotId);
    }
    if (userId) {
      clauses.push('rv.user_id = ?');
      params.push(userId);
    }

    const rows = await query(
      `SELECT rv.id, rv.rating, rv.review_text, rv.created_at,
              rv.user_id, u.name AS user_name, u.email AS user_email,
              rv.spot_id, s.name AS spot_name
       FROM reviews rv
       JOIN users u ON u.id = rv.user_id
       LEFT JOIN spots s ON s.id = rv.spot_id
       WHERE ${clauses.join(' AND ')}
       ORDER BY rv.created_at DESC`,
      params
    );

    res.json({ reviews: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/reviews', authRequired, async (req, res) => {
  try {
    const spotId = req.body.spotId ? Number(req.body.spotId) : null;
    const rating = Number(req.body.rating);
    const reviewText = (req.body.reviewText || '').trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return badRequest(res, 'rating must be 1..5');
    if (!reviewText) return badRequest(res, 'reviewText is required');

    if (spotId) {
      const spots = await query('SELECT id FROM spots WHERE id = ? AND is_active = 1 AND deleted_at IS NULL LIMIT 1', [spotId]);
      if (!spots.length) return res.status(404).json({ error: 'spot not found' });
    }

    const result = await transaction(async (conn) => {
      const [ins] = await conn.execute(
        `INSERT INTO reviews (user_id, spot_id, rating, review_text, is_approved)
         VALUES (?, ?, ?, ?, 1)`,
        [req.user.id, spotId, rating, reviewText]
      );

      await writeActivity(req.user.id, 'review', ins.insertId, { spotId, rating }, conn);
      return ins.insertId;
    });

    res.status(201).json({ id: result, message: 'review submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/hotels', async (req, res) => {
  try {
    const district = (req.query.district || '').trim();
    const type = (req.query.type || '').trim();
    const search = (req.query.search || '').trim();

    const clauses = ['h.is_active = 1', 'h.deleted_at IS NULL'];
    const params = [];

    if (district) {
      clauses.push('d.name = ?');
      params.push(district);
    }
    if (type) {
      clauses.push('h.hotel_type = ?');
      params.push(type);
    }
    if (search) {
      clauses.push('(h.name LIKE ? OR d.name LIKE ?)');
      const like = `%${search}%`;
      params.push(like, like);
    }

    const hotels = await query(
      `SELECT h.id, h.name, h.hotel_type, h.price_per_night, h.rating_avg,
              d.name AS district
       FROM hotels h
       JOIN districts d ON d.id = h.district_id
       WHERE ${clauses.join(' AND ')}
       ORDER BY h.name ASC`,
      params
    );

    if (!hotels.length) return res.json({ hotels: [] });

    const hotelIds = hotels.map((h) => h.id);
    const placeholders = hotelIds.map(() => '?').join(',');
    const features = await query(
      `SELECT hotel_id, feature FROM hotel_features WHERE hotel_id IN (${placeholders})`,
      hotelIds
    );

    const featureMap = new Map();
    for (const f of features) {
      if (!featureMap.has(f.hotel_id)) featureMap.set(f.hotel_id, []);
      featureMap.get(f.hotel_id).push(f.feature);
    }

    res.json({
      hotels: hotels.map((h) => ({
        ...h,
        features: featureMap.get(h.id) || []
      }))
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/hotels/search', async (req, res) => {
  try {
    const city = (req.body.city || '').trim();
    const hotelType = (req.body.hotelType || '').trim();
    const features = (req.body.features || '').trim();
    const checkin = req.body.checkin;
    const checkout = req.body.checkout;
    const people = Number(req.body.people || 2);

    if (!city) return badRequest(res, 'city is required');
    if (!checkin || !checkout) return badRequest(res, 'check-in and check-out dates are required');

    const nights = calculateNights(checkin, checkout);
    if (nights <= 0) return badRequest(res, 'checkout must be after checkin');

    const rows = await query(
      `SELECT h.id, h.name, h.hotel_type AS type, h.rating_avg AS rating,
              h.price_per_night, d.name AS city
       FROM hotels h
       JOIN districts d ON d.id = h.district_id
       WHERE h.is_active = 1 AND h.deleted_at IS NULL
         AND d.name LIKE ?
         AND (? = '' OR h.hotel_type LIKE ?)
       ORDER BY h.rating_avg DESC, h.price_per_night ASC`,
      [`%${city}%`, hotelType, `%${hotelType}%`]
    );

    const hotelIds = rows.map((r) => r.id);
    const featureRows = hotelIds.length
      ? await query(`SELECT hotel_id, feature FROM hotel_features WHERE hotel_id IN (${hotelIds.map(() => '?').join(',')})`, hotelIds)
      : [];

    const featureMap = new Map();
    for (const row of featureRows) {
      if (!featureMap.has(row.hotel_id)) featureMap.set(row.hotel_id, []);
      featureMap.get(row.hotel_id).push(row.feature);
    }

    const requestedFeatures = features ? features.split(',').map((f) => f.trim().toLowerCase()).filter(Boolean) : [];

    const results = rows
      .map((h) => {
        const hotelFeatures = featureMap.get(h.id) || [];
        const normalized = hotelFeatures.map((f) => f.toLowerCase());
        const matched = requestedFeatures.every((f) => normalized.some((hf) => hf.includes(f)));
        const vat = Math.round(Number(h.price_per_night) * 0.15);
        const service = Math.round(Number(h.price_per_night) * 0.10);
        return {
          ...h,
          features: hotelFeatures,
          hasCorporateRate: Number(h.price_per_night) >= 7000,
          hasBankDiscount: Number(h.price_per_night) >= 6000,
          vat: vat * nights,
          service: service * nights,
          subtotal: Number(h.price_per_night) * nights,
          totalPrice: (Number(h.price_per_night) + vat + service) * nights,
          nights,
          portals: [
            { name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(h.city + ', Bangladesh')}` },
            { name: 'Hotel.com.bd', url: 'https://hotel.com.bd' },
            { name: 'Parjatan (Official)', url: 'https://hotels.gov.bd' }
          ],
          _featureMatched: requestedFeatures.length ? matched : true
        };
      })
      .filter((h) => h._featureMatched)
      .map(({ _featureMatched, ...rest }) => rest);

    res.json({ hotels: results, searchParams: { hotelType, city, people, features, checkin, checkout, nights } });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/hotel-bookings', authRequired, async (req, res) => {
  try {
    const hotelId = Number(req.body.hotelId);
    const checkinDate = req.body.checkinDate;
    const checkoutDate = req.body.checkoutDate;
    const guests = Number(req.body.guests || 1);

    if (!hotelId || !checkinDate || !checkoutDate) return badRequest(res, 'hotelId, checkinDate, checkoutDate are required');
    if (guests < 1) return badRequest(res, 'guests must be >= 1');

    const nights = calculateNights(checkinDate, checkoutDate);
    if (nights <= 0) return badRequest(res, 'checkoutDate must be after checkinDate');

    const hotels = await query('SELECT id, price_per_night FROM hotels WHERE id = ? AND is_active = 1 AND deleted_at IS NULL LIMIT 1', [hotelId]);
    const hotel = hotels[0];
    if (!hotel) return res.status(404).json({ error: 'hotel not found' });

    const perNight = Number(hotel.price_per_night);
    const subtotal = perNight * nights;
    const vatAmount = Math.round(perNight * 0.15) * nights;
    const serviceAmount = Math.round(perNight * 0.10) * nights;
    const totalAmount = subtotal + vatAmount + serviceAmount;

    const bookingId = await transaction(async (conn) => {
      const [ins] = await conn.execute(
        `INSERT INTO hotel_bookings
         (user_id, hotel_id, checkin_date, checkout_date, guests, subtotal, vat_amount, service_amount, total_amount, booking_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
        [req.user.id, hotelId, checkinDate, checkoutDate, guests, subtotal, vatAmount, serviceAmount, totalAmount]
      );

      await writeActivity(req.user.id, 'hotel_booking', ins.insertId, { hotelId, totalAmount }, conn);
      return ins.insertId;
    });

    res.status(201).json({
      message: 'hotel booking created',
      bookingId,
      charges: { subtotal, vatAmount, serviceAmount, totalAmount, nights }
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/guides', async (req, res) => {
  try {
    const district = (req.query.district || '').trim();
    const language = (req.query.language || '').trim();
    const specialty = (req.query.specialty || '').trim();

    const clauses = ['g.deleted_at IS NULL', 'g.is_available = 1'];
    const params = [];

    if (district) {
      clauses.push('d.name = ?');
      params.push(district);
    }

    const guides = await query(
      `SELECT g.id, g.name, g.experience_years, g.price_per_day, g.rating_avg, d.name AS district
       FROM guides g
       JOIN districts d ON d.id = g.district_id
       WHERE ${clauses.join(' AND ')}
       ORDER BY g.rating_avg DESC`,
      params
    );

    if (!guides.length) return res.json({ guides: [] });

    const guideIds = guides.map((g) => g.id);
    const idList = guideIds.map(() => '?').join(',');

    const [languages, specialties] = await Promise.all([
      query(`SELECT guide_id, language FROM guide_languages WHERE guide_id IN (${idList})`, guideIds),
      query(`SELECT guide_id, specialty FROM guide_specialties WHERE guide_id IN (${idList})`, guideIds)
    ]);

    const langMap = new Map();
    for (const l of languages) {
      if (!langMap.has(l.guide_id)) langMap.set(l.guide_id, []);
      langMap.get(l.guide_id).push(l.language);
    }

    const specMap = new Map();
    for (const s of specialties) {
      if (!specMap.has(s.guide_id)) specMap.set(s.guide_id, []);
      specMap.get(s.guide_id).push(s.specialty);
    }

    let result = guides.map((g) => ({
      ...g,
      languages: langMap.get(g.id) || [],
      specialties: specMap.get(g.id) || []
    }));

    if (language) result = result.filter((g) => g.languages.some((l) => l.toLowerCase() === language.toLowerCase()));
    if (specialty) result = result.filter((g) => g.specialties.some((s) => s.toLowerCase().includes(specialty.toLowerCase())));

    res.json({ guides: result });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/guide-bookings', authRequired, async (req, res) => {
  try {
    const guideId = Number(req.body.guideId);
    const bookingDate = req.body.bookingDate;
    const daysCount = Number(req.body.daysCount || 1);

    if (!guideId || !bookingDate) return badRequest(res, 'guideId and bookingDate are required');
    if (daysCount < 1) return badRequest(res, 'daysCount must be >= 1');

    const guides = await query('SELECT id, price_per_day, is_available FROM guides WHERE id = ? AND deleted_at IS NULL LIMIT 1', [guideId]);
    const guide = guides[0];
    if (!guide) return res.status(404).json({ error: 'guide not found' });
    if (!guide.is_available) return res.status(409).json({ error: 'guide unavailable' });

    const totalAmount = Number(guide.price_per_day) * daysCount;

    const bookingId = await transaction(async (conn) => {
      const [ins] = await conn.execute(
        `INSERT INTO guide_bookings (user_id, guide_id, booking_date, days_count, total_amount, booking_status)
         VALUES (?, ?, ?, ?, ?, 'confirmed')`,
        [req.user.id, guideId, bookingDate, daysCount, totalAmount]
      );

      await writeActivity(req.user.id, 'guide_booking', ins.insertId, { guideId, totalAmount }, conn);
      return ins.insertId;
    });

    res.status(201).json({ message: 'guide booking created', bookingId, totalAmount });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/history', authRequired, async (req, res) => {
  try {
    const rows = await query(
      `SELECT id, activity_type, reference_id, metadata_json, created_at
       FROM activity_logs
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json({ history: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/admin/users', authRequired, requireRole('admin'), async (_req, res) => {
  try {
    const rows = await query(
      `SELECT u.id, u.name, u.email, u.phone, u.is_verified, u.is_active, u.last_login_at,
              r.id AS role_id, r.name AS role_name, u.created_at
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.deleted_at IS NULL
       ORDER BY u.created_at DESC`
    );

    res.json({ users: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.patch('/api/admin/users/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!userId) return badRequest(res, 'invalid user id');

    const updates = [];
    const params = [];

    const isActive = toBool(req.body.isActive);
    if (isActive !== null) {
      updates.push('is_active = ?');
      params.push(isActive);
    }

    if (req.body.roleId) {
      updates.push('role_id = ?');
      params.push(Number(req.body.roleId));
    }

    if (!updates.length) return badRequest(res, 'nothing to update');

    params.push(userId);
    await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

    res.json({ message: 'user updated' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/admin/reviews', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const approved = toBool(req.query.approved);
    const clauses = ['rv.deleted_at IS NULL'];
    const params = [];

    if (approved !== null) {
      clauses.push('rv.is_approved = ?');
      params.push(approved);
    }

    const rows = await query(
      `SELECT rv.id, rv.rating, rv.review_text, rv.is_approved, rv.created_at,
              u.email AS user_email, s.name AS spot_name
       FROM reviews rv
       JOIN users u ON u.id = rv.user_id
       LEFT JOIN spots s ON s.id = rv.spot_id
       WHERE ${clauses.join(' AND ')}
       ORDER BY rv.created_at DESC`,
      params
    );

    res.json({ reviews: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.patch('/api/admin/reviews/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const isApproved = toBool(req.body.isApproved);
    if (!id || isApproved === null) return badRequest(res, 'id and isApproved are required');

    await query('UPDATE reviews SET is_approved = ? WHERE id = ?', [isApproved, id]);
    res.json({ message: 'review updated' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/admin/analytics', authRequired, requireRole('admin'), async (_req, res) => {
  try {
    const [[userCount], [hotelBookings], [guideBookings], [reviewCount]] = await Promise.all([
      query('SELECT COUNT(*) AS count FROM users WHERE deleted_at IS NULL'),
      query('SELECT COUNT(*) AS count FROM hotel_bookings'),
      query('SELECT COUNT(*) AS count FROM guide_bookings'),
      query('SELECT COUNT(*) AS count FROM reviews WHERE deleted_at IS NULL')
    ]);

    res.json({
      users: userCount.count,
      hotelBookings: hotelBookings.count,
      guideBookings: guideBookings.count,
      reviews: reviewCount.count
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/admin/districts', authRequired, requireRole('admin'), async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM districts ORDER BY name');
    res.json({ districts: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/admin/districts', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    const division = (req.body.division || '').trim() || null;
    if (!name) return badRequest(res, 'name is required');

    const ins = await query('INSERT INTO districts (name, division) VALUES (?, ?)', [name, division]);
    res.status(201).json({ id: ins.insertId, message: 'district created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'district already exists' });
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.put('/api/admin/districts/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const name = (req.body.name || '').trim();
    const division = (req.body.division || '').trim() || null;
    if (!id || !name) return badRequest(res, 'id and name are required');

    await query('UPDATE districts SET name = ?, division = ? WHERE id = ?', [name, division, id]);
    res.json({ message: 'district updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'district already exists' });
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.delete('/api/admin/districts/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return badRequest(res, 'invalid id');
    await query('DELETE FROM districts WHERE id = ?', [id]);
    res.json({ message: 'district deleted' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'district is referenced by other records' });
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/admin/categories', authRequired, requireRole('admin'), async (_req, res) => {
  try {
    const rows = await query('SELECT * FROM categories ORDER BY name');
    res.json({ categories: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/admin/categories', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const name = (req.body.name || '').trim();
    if (!name) return badRequest(res, 'name is required');

    const ins = await query('INSERT INTO categories (name) VALUES (?)', [name]);
    res.status(201).json({ id: ins.insertId, message: 'category created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'category already exists' });
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.put('/api/admin/categories/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const name = (req.body.name || '').trim();
    if (!id || !name) return badRequest(res, 'id and name are required');

    await query('UPDATE categories SET name = ? WHERE id = ?', [name, id]);
    res.json({ message: 'category updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'category already exists' });
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.delete('/api/admin/categories/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return badRequest(res, 'invalid id');
    await query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'category deleted' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') return res.status(409).json({ error: 'category is referenced by other records' });
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/admin/spots', authRequired, requireRole('admin'), async (_req, res) => {
  try {
    const rows = await query(
      `SELECT s.*, d.name AS district, c.name AS category
       FROM spots s
       JOIN districts d ON d.id = s.district_id
       JOIN categories c ON c.id = s.category_id
       WHERE s.deleted_at IS NULL
       ORDER BY s.created_at DESC`
    );
    res.json({ spots: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/admin/spots', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { name, districtId, categoryId, description, history, imageUrl, isActive } = req.body;
    if (!name || !districtId || !categoryId || !description) return badRequest(res, 'name, districtId, categoryId, description are required');

    const ins = await query(
      `INSERT INTO spots (name, district_id, category_id, description, history, image_url, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), Number(districtId), Number(categoryId), description.trim(), history || null, imageUrl || null, toBool(isActive) ?? 1]
    );

    res.status(201).json({ id: ins.insertId, message: 'spot created' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'spot already exists in district' });
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.put('/api/admin/spots/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, districtId, categoryId, description, history, imageUrl, isActive } = req.body;
    if (!id || !name || !districtId || !categoryId || !description) return badRequest(res, 'id, name, districtId, categoryId, description are required');

    await query(
      `UPDATE spots
       SET name = ?, district_id = ?, category_id = ?, description = ?, history = ?, image_url = ?, is_active = ?
       WHERE id = ?`,
      [name.trim(), Number(districtId), Number(categoryId), description.trim(), history || null, imageUrl || null, toBool(isActive) ?? 1, id]
    );

    res.json({ message: 'spot updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'spot already exists in district' });
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.delete('/api/admin/spots/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return badRequest(res, 'invalid id');
    await query('UPDATE spots SET deleted_at = NOW() WHERE id = ?', [id]);
    res.json({ message: 'spot deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/admin/hotels', authRequired, requireRole('admin'), async (_req, res) => {
  try {
    const rows = await query(
      `SELECT h.*, d.name AS district
       FROM hotels h
       JOIN districts d ON d.id = h.district_id
       WHERE h.deleted_at IS NULL
       ORDER BY h.created_at DESC`
    );
    res.json({ hotels: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/admin/hotels', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { name, districtId, hotelType, pricePerNight, ratingAvg, isActive } = req.body;
    if (!name || !districtId || !hotelType || !pricePerNight) return badRequest(res, 'name, districtId, hotelType, pricePerNight are required');

    const ins = await query(
      `INSERT INTO hotels (name, district_id, hotel_type, price_per_night, rating_avg, is_active)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), Number(districtId), hotelType.trim(), Number(pricePerNight), Number(ratingAvg || 0), toBool(isActive) ?? 1]
    );

    res.status(201).json({ id: ins.insertId, message: 'hotel created' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.put('/api/admin/hotels/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, districtId, hotelType, pricePerNight, ratingAvg, isActive } = req.body;
    if (!id || !name || !districtId || !hotelType || !pricePerNight) return badRequest(res, 'id, name, districtId, hotelType, pricePerNight are required');

    await query(
      `UPDATE hotels
       SET name = ?, district_id = ?, hotel_type = ?, price_per_night = ?, rating_avg = ?, is_active = ?
       WHERE id = ?`,
      [name.trim(), Number(districtId), hotelType.trim(), Number(pricePerNight), Number(ratingAvg || 0), toBool(isActive) ?? 1, id]
    );

    res.json({ message: 'hotel updated' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.delete('/api/admin/hotels/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return badRequest(res, 'invalid id');
    await query('UPDATE hotels SET deleted_at = NOW() WHERE id = ?', [id]);
    res.json({ message: 'hotel deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/admin/guides', authRequired, requireRole('admin'), async (_req, res) => {
  try {
    const rows = await query(
      `SELECT g.*, d.name AS district
       FROM guides g
       JOIN districts d ON d.id = g.district_id
       WHERE g.deleted_at IS NULL
       ORDER BY g.created_at DESC`
    );
    res.json({ guides: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/admin/guides', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { name, districtId, experienceYears, pricePerDay, ratingAvg, isAvailable } = req.body;
    if (!name || !districtId || !pricePerDay) return badRequest(res, 'name, districtId and pricePerDay are required');

    const ins = await query(
      `INSERT INTO guides (name, district_id, experience_years, price_per_day, rating_avg, is_available)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name.trim(), Number(districtId), Number(experienceYears || 0), Number(pricePerDay), Number(ratingAvg || 0), toBool(isAvailable) ?? 1]
    );

    res.status(201).json({ id: ins.insertId, message: 'guide created' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.put('/api/admin/guides/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { name, districtId, experienceYears, pricePerDay, ratingAvg, isAvailable } = req.body;
    if (!id || !name || !districtId || !pricePerDay) return badRequest(res, 'id, name, districtId and pricePerDay are required');

    await query(
      `UPDATE guides
       SET name = ?, district_id = ?, experience_years = ?, price_per_day = ?, rating_avg = ?, is_available = ?
       WHERE id = ?`,
      [name.trim(), Number(districtId), Number(experienceYears || 0), Number(pricePerDay), Number(ratingAvg || 0), toBool(isAvailable) ?? 1, id]
    );

    res.json({ message: 'guide updated' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.delete('/api/admin/guides/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return badRequest(res, 'invalid id');
    await query('UPDATE guides SET deleted_at = NOW() WHERE id = ?', [id]);
    res.json({ message: 'guide deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/admin/routes', authRequired, requireRole('admin'), async (_req, res) => {
  try {
    const rows = await query(
      `SELECT r.*, d1.name AS origin_district, d2.name AS destination_district
       FROM routes r
       JOIN districts d1 ON d1.id = r.origin_district_id
       JOIN districts d2 ON d2.id = r.destination_district_id
       ORDER BY r.id DESC`
    );
    res.json({ routes: rows });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.post('/api/admin/routes', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const { originDistrictId, destinationDistrictId, transportType, providerName, durationText, priceText } = req.body;
    if (!originDistrictId || !destinationDistrictId || !transportType || !providerName || !durationText || !priceText) {
      return badRequest(res, 'originDistrictId, destinationDistrictId, transportType, providerName, durationText, priceText are required');
    }

    const ins = await query(
      `INSERT INTO routes
       (origin_district_id, destination_district_id, transport_type, provider_name, duration_text, price_text)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [Number(originDistrictId), Number(destinationDistrictId), transportType.trim(), providerName.trim(), durationText.trim(), priceText.trim()]
    );

    res.status(201).json({ id: ins.insertId, message: 'route created' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.put('/api/admin/routes/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { originDistrictId, destinationDistrictId, transportType, providerName, durationText, priceText } = req.body;
    if (!id || !originDistrictId || !destinationDistrictId || !transportType || !providerName || !durationText || !priceText) {
      return badRequest(res, 'id and all route fields are required');
    }

    await query(
      `UPDATE routes
       SET origin_district_id = ?, destination_district_id = ?, transport_type = ?, provider_name = ?, duration_text = ?, price_text = ?
       WHERE id = ?`,
      [Number(originDistrictId), Number(destinationDistrictId), transportType.trim(), providerName.trim(), durationText.trim(), priceText.trim(), id]
    );

    res.json({ message: 'route updated' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.delete('/api/admin/routes/:id', authRequired, requireRole('admin'), async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return badRequest(res, 'invalid id');

    await query('DELETE FROM routes WHERE id = ?', [id]);
    res.json({ message: 'route deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

function normalizeDistrict(district) {
  return (district ?? '').toString().trim();
}

app.get('/api/weather', async (req, res) => {
  try {
    const district = normalizeDistrict(req.query.district);
    if (!district) return badRequest(res, 'district is required');

    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error('Missing OPENWEATHER_API_KEY');

    const q = encodeURIComponent(`${district},BD`);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=metric&appid=${key}`;
    const r = await fetch(url);

    if (!r.ok) return res.status(502).json({ error: 'Weather lookup failed' });

    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/forecast', async (req, res) => {
  try {
    const district = normalizeDistrict(req.query.district);
    const date = (req.query.date ?? '').toString().trim();

    if (!district) return badRequest(res, 'district is required');
    if (!date) return badRequest(res, 'date is required (YYYY-MM-DD)');

    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error('Missing OPENWEATHER_API_KEY');

    const q = encodeURIComponent(`${district},BD`);
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${q}&units=metric&appid=${key}`;

    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'Forecast lookup failed' });

    const data = await r.json();
    res.json({ district, date, data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});
