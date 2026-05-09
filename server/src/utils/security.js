const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const ACCESS_TTL = process.env.JWT_ACCESS_TTL || '15m';
const REFRESH_TTL = process.env.JWT_REFRESH_TTL || '30d';

function hashOtp(otp) {
  const secret = process.env.OTP_SECRET || 'dev-otp-secret';
  return crypto.createHash('sha256').update(`${otp}:${secret}`).digest('hex');
}

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashToken(token) {
  const secret = process.env.REFRESH_TOKEN_HASH_SECRET || 'dev-refresh-secret';
  return crypto.createHash('sha256').update(`${token}:${secret}`).digest('hex');
}

function signAccessToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role_name || user.role || 'user', type: 'access' },
    process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
    { expiresIn: ACCESS_TTL }
  );
}

function signRefreshToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role_name || user.role || 'user', type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
    { expiresIn: REFRESH_TTL }
  );
}

function verifyAccessToken(token) {
  return jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev-access-secret');
}

function verifyRefreshToken(token) {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret');
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
