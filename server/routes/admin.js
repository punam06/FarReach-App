const express = require('express');
const multer = require('multer');
const path = require('path');
const pool = require('../config/database');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const router = express.Router();

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../spot-pictures'),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname));
  }
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.use(authenticateToken, requireAdmin);

router.get('/stats', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    const [spots] = await pool.query('SELECT COUNT(*) as count FROM spots');
    const [reviews] = await pool.query('SELECT COUNT(*) as count FROM reviews');
    const [guides] = await pool.query('SELECT COUNT(*) as count FROM guides');
    const [pending] = await pool.query('SELECT COUNT(*) as count FROM users WHERE is_verified = 0');
    res.json({ totalUsers: users[0].count, totalSpots: spots[0].count, totalReviews: reviews[0].count, totalGuides: guides[0].count, pendingApprovals: pending[0].count });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch stats.' }); }
});

router.get('/spots', async (req, res) => {
  try {
    const [spots] = await pool.query(
      `SELECT s.*, d.name as district_name, div.name as division_name
       FROM spots s LEFT JOIN districts d ON s.district_id = d.id
       LEFT JOIN divisions div ON s.division_id = div.id ORDER BY s.created_at DESC`
    );
    res.json({ spots });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch spots.' }); }
});

router.post('/spots', upload.single('image'), async (req, res) => {
  try {
    const { name, district_id, division_id, category, description, history, budget_category } = req.body;
    const image = req.file ? req.file.filename : '';
    const [result] = await pool.query(
      'INSERT INTO spots (name, district_id, division_id, category, description, history, image, budget_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, district_id || null, division_id || null, category || 'General', description || '', history || '', image, budget_category || 'Low']
    );
    res.json({ message: 'Spot created.', id: result.insertId });
  } catch (err) { console.error(err); res.status(500).json({ error: 'Failed to create spot.' }); }
});

router.put('/spots/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, district_id, division_id, category, description, history, budget_category } = req.body;
    const image = req.file ? req.file.filename : undefined;
    const updates = ['name = ?', 'district_id = ?', 'division_id = ?', 'category = ?', 'description = ?', 'history = ?', 'budget_category = ?'];
    const values = [name, district_id || null, division_id || null, category || 'General', description || '', history || '', budget_category || 'Low'];
    if (image) { updates.push('image = ?'); values.push(image); }
    values.push(req.params.id);
    await pool.query('UPDATE spots SET ' + updates.join(', ') + ' WHERE id = ?', values);
    res.json({ message: 'Spot updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed to update spot.' }); }
});

router.delete('/spots/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM spots WHERE id = ?', [req.params.id]);
    res.json({ message: 'Spot deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete spot.' }); }
});

router.get('/divisions', async (req, res) => {
  try {
    const [divisions] = await pool.query('SELECT * FROM divisions ORDER BY name');
    res.json({ divisions });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch divisions.' }); }
});

router.post('/divisions', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    const [result] = await pool.query('INSERT INTO divisions (name) VALUES (?)', [name]);
    res.json({ message: 'Division added.', id: result.insertId });
  } catch (err) { res.status(500).json({ error: 'Failed to add division.' }); }
});

router.put('/divisions/:id', async (req, res) => {
  try {
    const { name } = req.body;
    await pool.query('UPDATE divisions SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ message: 'Division updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed to update division.' }); }
});

router.delete('/divisions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM divisions WHERE id = ?', [req.params.id]);
    res.json({ message: 'Division deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete division.' }); }
});

router.get('/districts', async (req, res) => {
  try {
    const [districts] = await pool.query(
      'SELECT d.*, div.name as division_name FROM districts d JOIN divisions div ON d.division_id = div.id ORDER BY div.name, d.name'
    );
    res.json({ districts });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch districts.' }); }
});

router.post('/districts', async (req, res) => {
  try {
    const { name, division_id } = req.body;
    if (!name || !division_id) return res.status(400).json({ error: 'Name and division are required.' });
    const [result] = await pool.query('INSERT INTO districts (name, division_id) VALUES (?, ?)', [name, division_id]);
    res.json({ message: 'District added.', id: result.insertId });
  } catch (err) { res.status(500).json({ error: 'Failed to add district.' }); }
});

router.put('/districts/:id', async (req, res) => {
  try {
    const { name, division_id } = req.body;
    await pool.query('UPDATE districts SET name = ?, division_id = ? WHERE id = ?', [name, division_id, req.params.id]);
    res.json({ message: 'District updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed to update district.' }); }
});

router.delete('/districts/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM districts WHERE id = ?', [req.params.id]);
    res.json({ message: 'District deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete district.' }); }
});

router.get('/guides', async (req, res) => {
  try {
    const [guides] = await pool.query(
      `SELECT g.*, s.name as spot_name FROM guides g LEFT JOIN spots s ON g.spot_id = s.id ORDER BY g.name`
    );
    res.json({ guides });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch guides.' }); }
});

router.post('/guides', async (req, res) => {
  try {
    const { name, experience, rating, languages, specialties, price, contact, spot_id } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    const [result] = await pool.query(
      'INSERT INTO guides (name, experience, rating, languages, specialties, price, contact, spot_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, experience || '', rating || 0, languages || '', specialties || '', price || 0, contact || '', spot_id || null]
    );
    res.json({ message: 'Guide added.', id: result.insertId });
  } catch (err) { res.status(500).json({ error: 'Failed to add guide.' }); }
});

router.put('/guides/:id', async (req, res) => {
  try {
    const { name, experience, rating, languages, specialties, price, contact, spot_id } = req.body;
    await pool.query(
      'UPDATE guides SET name=?, experience=?, rating=?, languages=?, specialties=?, price=?, contact=?, spot_id=? WHERE id=?',
      [name, experience, rating || 0, languages, specialties, price || 0, contact, spot_id || null, req.params.id]
    );
    res.json({ message: 'Guide updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed to update guide.' }); }
});

router.delete('/guides/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM guides WHERE id = ?', [req.params.id]);
    res.json({ message: 'Guide deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete guide.' }); }
});

router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, name, email, role, is_verified, phone, address, profile_pic, created_at FROM users ORDER BY created_at DESC');
    res.json({ users });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch users.' }); }
});

router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) return res.status(400).json({ error: 'Invalid role.' });
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ message: 'User role updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed to update role.' }); }
});

router.delete('/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete user.' }); }
});

router.get('/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT r.*, u.name as user_name, u.email as user_email, s.name as spot_name
       FROM reviews r JOIN users u ON r.user_id = u.id JOIN spots s ON r.spot_id = s.id
       ORDER BY r.created_at DESC`
    );
    res.json({ reviews });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch reviews.' }); }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete review.' }); }
});

router.get('/bookings', async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT b.*, u.name as user_name, u.email as user_email 
       FROM bookings b JOIN users u ON b.user_id = u.id 
       ORDER BY b.created_at DESC`
    );
    res.json({ bookings });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch bookings.' }); }
});

router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status.' });
    }
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Booking status updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed to update booking status.' }); }
});

module.exports = router;