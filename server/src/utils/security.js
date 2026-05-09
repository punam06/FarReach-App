const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || '15m';
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || '30d';
const OTP_SECRET = process.env.OTP_SECRET;
const REFRESH_TOKEN_HASH_SECRET = process.env.REFRESH_TOKEN_HASH_SECRET;
const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!OTP_SECRET) throw new Error('Missing OTP_SECRET');
if (!REFRESH_TOKEN_HASH_SECRET) throw new Error('Missing REFRESH_TOKEN_HASH_SECRET');
if (!JWT_ACCESS_SECRET) throw new Error('Missing JWT_ACCESS_SECRET');
if (!JWT_REFRESH_SECRET) throw new Error('Missing JWT_REFRESH_SECRET');

function hashOtp(otp) {
  return crypto.createHash('sha256').update(`${otp}:${OTP_SECRET}`).digest('hex');
}

function generateOtp() {
  return String(crypto.randomInt(100000, 1000000));
}

function hashToken(token) {
  return crypto.createHash('sha256').update(`${token}:${REFRESH_TOKEN_HASH_SECRET}`).digest('hex');
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role_name || user.role || 'user', type: 'access' },
    JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_TTL }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role_name || user.role || 'user', type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TTL }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, JWT_ACCESS_SECRET);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, JWT_REFRESH_SECRET);
}

module.exports = {
  hashOtp,
  generateOtp,
  hashToken,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken
};
