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
    const [[{ spots }]] = await pool.query('SELECT COUNT(*) as spots FROM spots');
    const [[{ users }]] = await pool.query('SELECT COUNT(*) as users FROM users WHERE role = "user"');
    const [[{ reviews }]] = await pool.query('SELECT COUNT(*) as reviews FROM reviews');
    const [[{ pending }]] = await pool.query('SELECT COUNT(*) as pending FROM bookings WHERE status = "pending"');
    res.json({ spots, users, reviews, pending });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch stats.' }); }
});

router.get('/spots', async (req, res) => {
  console.log('Fetching spots for admin');
  try {
    const [spots] = await pool.query(
      `SELECT s.*, d.name as district_name, dv.name as division_name 
       FROM spots s 
       LEFT JOIN districts d ON s.district_id = d.id 
       LEFT JOIN divisions dv ON s.division_id = dv.id 
       ORDER BY s.id DESC`
    );
    res.json({ spots: spots });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch spots.' }); }
});

router.post('/spots', upload.single('image'), async (req, res) => {
  try {
    const { name, district_id, division_id, category, description, history, budget_category } = req.body;
    console.log('Creating spot with body:', req.body);
    const image = req.file ? req.file.filename : '';
    const [result] = await pool.query(
      'INSERT INTO spots (name, district_id, division_id, category, description, history, image, budget_category) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, district_id || null, division_id || null, category || 'General', description || '', history || '', image, budget_category || 'Low']
    );
    res.json({ message: 'Spot added.', id: result.insertId });
  } catch (err) { 
    console.error('Error creating spot:', err);
    res.status(500).json({ error: 'Failed to create spot: ' + err.message }); 
  }
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
  } catch (err) { 
    console.error('Error updating spot:', err);
    res.status(500).json({ error: 'Failed to update spot: ' + err.message }); 
  }
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
      'SELECT d.*, dv.name as division_name FROM districts d JOIN divisions dv ON d.division_id = dv.id ORDER BY dv.name, d.name'
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
    console.log('Creating guide with body:', req.body);
    if (!name) return res.status(400).json({ error: 'Name is required.' });
    const [result] = await pool.query(
      'INSERT INTO guides (name, experience, rating, languages, specialties, price, contact, spot_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [name, experience || '', rating || 0, languages || '', specialties || '', price || 0, contact || '', spot_id || null]
    );
    res.json({ message: 'Guide added.', id: result.insertId });
  } catch (err) { 
    console.error('Error adding guide:', err);
    res.status(500).json({ error: 'Failed to add guide: ' + err.message }); 
  }
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
    const [users] = await pool.query('SELECT id, name, email, role, is_verified, created_at FROM users ORDER BY created_at DESC');
    res.json({ users });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch users.' }); }
});

router.get('/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT r.*, u.name as user_name, u.email as user_email, s.name as spot_name 
       FROM reviews r 
       LEFT JOIN users u ON r.user_id = u.id 
       LEFT JOIN spots s ON r.spot_id = s.id 
       ORDER BY r.created_at DESC`
    );
    console.log('Admin: Returning', reviews.length, 'reviews');
    if (reviews.length > 0) console.log('Sample review data:', JSON.stringify(reviews[0]));
    res.json({ reviews });
  } catch (err) {
    console.error('Admin reviews error:', err);
    res.status(500).json({ error: 'Failed to fetch reviews.' });
  }
});

router.delete('/reviews/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete review.' }); }
});

router.get('/bookings', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT b.*, u.name as user_name, u.email as user_email
       FROM bookings b
       LEFT JOIN users u ON b.user_id = u.id
       ORDER BY b.created_at DESC`
    );
    console.log('Admin: Fetched', rows.length, 'bookings');
    res.json({ bookings: rows });
  } catch (err) {
    console.error('Admin bookings error:', err);
    res.status(500).json({ error: 'Failed to fetch bookings.' });
  }
});

router.put('/bookings/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Booking status updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed to update booking status.' }); }
});

module.exports = router;