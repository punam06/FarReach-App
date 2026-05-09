const { verifyAccessToken } = require('../utils/security');
const { query } = require('../db');

async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

    if (!token) return res.status(401).json({ error: 'Missing bearer token' });

    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') return res.status(401).json({ error: 'Invalid token type' });

    const users = await query(
      `SELECT u.id, u.email, u.is_active, r.name AS role
       FROM users u
       JOIN roles r ON r.id = u.role_id
       WHERE u.id = ?`,
      [payload.sub]
    );

    const user = users[0];
    if (!user || !user.is_active) return res.status(401).json({ error: 'User inactive or missing' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
}

function requireRole(roleName) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== roleName) return res.status(403).json({ error: 'Forbidden' });
    return next();
  };
}

module.exports = {
  authRequired,
  requireRole
};
