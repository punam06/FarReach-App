const jwt = require('jsonwebtoken');
const { ADMIN_EMAILS = [] } = require('../config/schema');
const JWT_SECRET = process.env.JWT_SECRET || 'torisom_secret_key_2024';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated.' });
  const isRoleAdmin = req.user.role === 'admin';
  const isWhitelistedEmail = ADMIN_EMAILS.includes(req.user.email);
  if (!isRoleAdmin && !isWhitelistedEmail) {
    return res.status(403).json({ error: 'Access denied. Admin privileges required.' });
  }
  next();
}

module.exports = { authenticateToken, requireAdmin, JWT_SECRET };