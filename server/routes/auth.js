const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');
const { authenticateToken, JWT_SECRET } = require('../middleware/auth');
const { ADMIN_EMAILS } = require('../config/schema');
const { generateOtp, hashOtp, sendOtpEmail, OTP_EXPIRY_MINUTES, OTP_TOKEN_EXPIRY_MINUTES } = require('../utils/otp');
const router = express.Router();

const OTP_RESEND_COOLDOWN_SECONDS = parseInt(process.env.OTP_RESEND_COOLDOWN_SECONDS || '60', 10);
const OTP_MAX_SENDS_PER_HOUR = parseInt(process.env.OTP_MAX_SENDS_PER_HOUR || '5', 10);
const OTP_MAX_VERIFY_ATTEMPTS = parseInt(process.env.OTP_MAX_VERIFY_ATTEMPTS || '5', 10);
const OTP_VERIFY_WINDOW_MINUTES = parseInt(process.env.OTP_VERIFY_WINDOW_MINUTES || '15', 10);
const OTP_VERIFY_BLOCK_MINUTES = parseInt(process.env.OTP_VERIFY_BLOCK_MINUTES || '15', 10);

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../spot-pictures'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

function issueAuthToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function issueVerificationToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, scope: 'verify_email' },
    JWT_SECRET,
    { expiresIn: `${OTP_TOKEN_EXPIRY_MINUTES}m` }
  );
}

function authenticateVerificationToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Verification token is required.' });
  }

  jwt.verify(token, JWT_SECRET, (err, payload) => {
    if (err || !payload || payload.scope !== 'verify_email') {
      return res.status(403).json({ error: 'Invalid or expired verification token.' });
    }
    req.verification = payload;
    next();
  });
}

async function checkOtpSendPolicy(email) {
  const [latestRows] = await pool.query(
    'SELECT TIMESTAMPDIFF(SECOND, created_at, NOW()) AS ageSeconds FROM otp_verifications WHERE email = ? ORDER BY created_at DESC LIMIT 1',
    [email]
  );

  if (latestRows.length > 0) {
    const age = Number(latestRows[0].ageSeconds || 0);
    if (age < OTP_RESEND_COOLDOWN_SECONDS) {
      return {
        allowed: false,
        status: 429,
        error: `Please wait ${OTP_RESEND_COOLDOWN_SECONDS - age} seconds before requesting a new OTP.`
      };
    }
  }

  const [countRows] = await pool.query(
    'SELECT COUNT(*) AS count FROM otp_verifications WHERE email = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR)',
    [email]
  );
  const recentCount = Number(countRows[0]?.count || 0);
  if (recentCount >= OTP_MAX_SENDS_PER_HOUR) {
    return {
      allowed: false,
      status: 429,
      error: 'Too many OTP requests. Please try again later.'
    };
  }

  return { allowed: true };
}

async function issueOtpForVerification(email, name) {
  const policy = await checkOtpSendPolicy(email);
  if (!policy.allowed) {
    const err = new Error(policy.error);
    err.status = policy.status;
    throw err;
  }

  const otp = generateOtp();
  const otpHash = hashOtp(otp);
  await pool.query('UPDATE otp_verifications SET verified = 1 WHERE email = ? AND verified = 0', [email]);
  await pool.query(
    'INSERT INTO otp_verifications (email, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL ? MINUTE))',
    [email, otpHash, OTP_EXPIRY_MINUTES]
  );

  // Send email in background to prevent request timeout if SMTP is slow/failing
  sendOtpEmail({ email, name, otp }).catch(err => {
    console.error('Background OTP email failure:', err);
  });
  return { delivered: true, mode: 'background' };
}

async function getVerifyAttemptState(email) {
  const [rows] = await pool.query(
    'SELECT failed_attempts, TIMESTAMPDIFF(SECOND, window_start, NOW()) AS windowAgeSeconds, TIMESTAMPDIFF(SECOND, NOW(), blocked_until) AS blockRemainingSeconds FROM otp_attempt_limits WHERE email = ? LIMIT 1',
    [email]
  );
  if (rows.length === 0) {
    return {
      failedAttempts: 0,
      windowAgeSeconds: null,
      blockRemainingSeconds: null
    };
  }

  return {
    failedAttempts: Number(rows[0].failed_attempts || 0),
    windowAgeSeconds: rows[0].windowAgeSeconds == null ? null : Number(rows[0].windowAgeSeconds),
    blockRemainingSeconds: rows[0].blockRemainingSeconds == null ? null : Number(rows[0].blockRemainingSeconds)
  };
}

async function registerFailedVerifyAttempt(email) {
  const state = await getVerifyAttemptState(email);
  const windowExpired = state.windowAgeSeconds == null || state.windowAgeSeconds > OTP_VERIFY_WINDOW_MINUTES * 60;
  const nextAttempts = windowExpired ? 1 : state.failedAttempts + 1;
  const shouldBlock = nextAttempts >= OTP_MAX_VERIFY_ATTEMPTS;

  await pool.query(
    `INSERT INTO otp_attempt_limits (email, failed_attempts, window_start, blocked_until)
     VALUES (?, ?, NOW(), ?)
     ON DUPLICATE KEY UPDATE
       failed_attempts = VALUES(failed_attempts),
       window_start = VALUES(window_start),
       blocked_until = VALUES(blocked_until)`,
    [
      email,
      nextAttempts,
      shouldBlock ? new Date(Date.now() + OTP_VERIFY_BLOCK_MINUTES * 60 * 1000) : null
    ]
  );

  return {
    blocked: shouldBlock,
    attemptsRemaining: Math.max(0, OTP_MAX_VERIFY_ATTEMPTS - nextAttempts)
  };
}

async function clearVerifyAttemptState(email) {
  await pool.query('DELETE FROM otp_attempt_limits WHERE email = ?', [email]);
}

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
    if (String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const normalizedEmail = email.toLowerCase().trim();
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already registered.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const role = ADMIN_EMAILS.includes(normalizedEmail) ? 'admin' : 'user';
    await pool.query('INSERT INTO users (name, email, password_hash, role, is_verified) VALUES (?, ?, ?, ?, 0)', [name.trim(), normalizedEmail, passwordHash, role]);

    const [rows] = await pool.query('SELECT id, name, email, role FROM users WHERE email = ?', [normalizedEmail]);
    const createdUser = rows[0];

    const delivery = await issueOtpForVerification(normalizedEmail, createdUser.name);
    const verificationToken = issueVerificationToken(createdUser);

    res.json({
      message: 'Registration successful. Verify your email with OTP.',
      otp_sent: true,
      verificationToken,
      email: normalizedEmail,
      deliveryMode: delivery.mode
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (users.length === 0) return res.status(400).json({ error: 'Invalid email or password.' });
    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid email or password.' });

    if (!user.is_verified) {
      const verificationToken = issueVerificationToken(user);
      let deliveryMode = 'existing';
      let message = 'Email not verified. Please verify OTP.';

      try {
        const delivery = await issueOtpForVerification(user.email, user.name);
        deliveryMode = delivery.mode;
      } catch (err) {
        if (err.status === 429) {
          message = `${message} ${err.message}`;
        } else {
          throw err;
        }
      }

      return res.status(403).json({
        error: message,
        verification_required: true,
        verificationToken,
        email: user.email,
        deliveryMode
      });
    }

    const token = issueAuthToken(user);
    res.json({ message: 'Login successful.', token, user: { id: user.id, name: user.name, email: user.email, role: user.role, is_verified: user.is_verified, profile_pic: user.profile_pic, phone: user.phone, address: user.address } });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

router.post('/verify-otp', authenticateVerificationToken, async (req, res) => {
  try {
    const { otp } = req.body;
    if (!otp) return res.status(400).json({ error: 'OTP is required.' });

    const state = await getVerifyAttemptState(req.verification.email);
    if (state.blockRemainingSeconds != null && state.blockRemainingSeconds > 0) {
      return res.status(429).json({
        error: `Too many failed attempts. Try again in ${state.blockRemainingSeconds} seconds.`
      });
    }

    const otpHash = hashOtp(otp);
    const [records] = await pool.query(
      'SELECT * FROM otp_verifications WHERE email = ? AND otp = ? AND expires_at > NOW() AND verified = 0 ORDER BY created_at DESC LIMIT 1',
      [req.verification.email, otpHash]
    );
    if (records.length === 0) {
      const failed = await registerFailedVerifyAttempt(req.verification.email);
      if (failed.blocked) {
        return res.status(429).json({
          error: `Too many failed attempts. You are blocked for ${OTP_VERIFY_BLOCK_MINUTES} minutes.`
        });
      }
      return res.status(400).json({
        error: `Invalid or expired OTP. ${failed.attemptsRemaining} attempts remaining.`
      });
    }

    await pool.query('UPDATE otp_verifications SET verified = 1 WHERE id = ?', [records[0].id]);
    await pool.query('UPDATE users SET is_verified = 1 WHERE id = ?', [req.verification.id]);
    await clearVerifyAttemptState(req.verification.email);

    const [users] = await pool.query('SELECT id, name, email, role, is_verified, profile_pic, phone, address FROM users WHERE id = ?', [req.verification.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });

    const token = issueAuthToken(users[0]);
    res.json({ message: 'Email verified successfully.', token, user: users[0] });
  } catch (err) {
    console.error('Verify OTP error:', err);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

router.post('/resend-otp', authenticateVerificationToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT name FROM users WHERE id = ?', [req.verification.id]);
    const displayName = users[0] ? users[0].name : 'Traveler';
    const delivery = await issueOtpForVerification(req.verification.email, displayName);

    res.json({ message: 'OTP resent successfully.', deliveryMode: delivery.mode });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ error: err.message });
    }
    console.error('Resend OTP error:', err);
    res.status(500).json({ error: 'Failed to resend OTP.' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, is_verified, profile_pic, phone, address, created_at FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ user: users[0] });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

router.put('/profile', authenticateToken, upload.single('profile_pic'), async (req, res) => {
  try {
    const { name, password, phone, address } = req.body;
    const profile_pic = req.file ? req.file.filename : undefined;
    
    const updates = [];
    const values = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
    if (address !== undefined) { updates.push('address = ?'); values.push(address); }
    if (profile_pic) { updates.push('profile_pic = ?'); values.push(profile_pic); }
    if (password) { const hash = await bcrypt.hash(password, 10); updates.push('password_hash = ?'); values.push(hash); }
    
    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update.' });
    values.push(req.user.id);
    await pool.query('UPDATE users SET ' + updates.join(', ') + ' WHERE id = ?', values);
    const [users] = await pool.query('SELECT id, name, email, role, is_verified, profile_pic, phone, address FROM users WHERE id = ?', [req.user.id]);
    res.json({ message: 'Profile updated.', user: users[0] });
  } catch (err) {
    console.error('Profile update failed:', err);
    res.status(500).json({ error: 'Profile update failed.' });
  }
});

module.exports = router;