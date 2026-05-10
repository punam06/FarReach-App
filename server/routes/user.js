const express = require('express');
const pool = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

router.get('/saved-spots', authenticateToken, async (req, res) => {
  try {
    const [spots] = await pool.query(
      `SELECT s.*, d.name as district_name, div.name as division_name, ss.created_at as saved_at
       FROM saved_spots ss JOIN spots s ON ss.spot_id = s.id
       LEFT JOIN districts d ON s.district_id = d.id
       LEFT JOIN divisions div ON s.division_id = div.id
       WHERE ss.user_id = ? ORDER BY ss.created_at DESC`, [req.user.id]
    );
    res.json({ spots });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch saved spots.' }); }
});

router.post('/saved-spots/:spotId', authenticateToken, async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT id FROM saved_spots WHERE user_id = ? AND spot_id = ?', [req.user.id, req.params.spotId]);
    if (existing.length > 0) return res.status(400).json({ error: 'Spot already saved.' });
    await pool.query('INSERT INTO saved_spots (user_id, spot_id) VALUES (?, ?)', [req.user.id, req.params.spotId]);
    res.json({ message: 'Spot saved successfully.' });
  } catch (err) { res.status(500).json({ error: 'Failed to save spot.' }); }
});

router.delete('/saved-spots/:spotId', authenticateToken, async (req, res) => {
  try {
    await pool.query('DELETE FROM saved_spots WHERE user_id = ? AND spot_id = ?', [req.user.id, req.params.spotId]);
    res.json({ message: 'Spot removed from saved.' });
  } catch (err) { res.status(500).json({ error: 'Failed to remove spot.' }); }
});

router.get('/reviews', authenticateToken, async (req, res) => {
  try {
    const [reviews] = await pool.query(
      `SELECT r.*, s.name as spot_name, s.image as spot_image
       FROM reviews r JOIN spots s ON r.spot_id = s.id
       WHERE r.user_id = ? ORDER BY r.created_at DESC`, [req.user.id]
    );
    res.json({ reviews });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch reviews.' }); }
});

router.post('/reviews', authenticateToken, async (req, res) => {
  try {
    const { spot_id, rating, text } = req.body;
    if (!rating) return res.status(400).json({ error: 'Rating is required.' });
    if (spot_id) {
      const [existing] = await pool.query('SELECT id FROM reviews WHERE user_id = ? AND spot_id = ?', [req.user.id, spot_id]);
      if (existing.length > 0) return res.status(400).json({ error: 'You already reviewed this spot.' });
    }
    await pool.query('INSERT INTO reviews (user_id, spot_id, rating, text) VALUES (?, ?, ?, ?)', [req.user.id, spot_id || null, rating, text || '']);
    res.json({ message: 'Review submitted successfully.' });
  } catch (err) { res.status(500).json({ error: 'Failed to submit review.' }); }
});

router.put('/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const { rating, text } = req.body;
    const [reviews] = await pool.query('SELECT * FROM reviews WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (reviews.length === 0) return res.status(404).json({ error: 'Review not found.' });
    await pool.query('UPDATE reviews SET rating = ?, text = ? WHERE id = ?', [rating || reviews[0].rating, text !== undefined ? text : reviews[0].text, req.params.id]);
    res.json({ message: 'Review updated.' });
  } catch (err) { res.status(500).json({ error: 'Failed to update review.' }); }
});

router.delete('/reviews/:id', authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM reviews WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Review not found.' });
    res.json({ message: 'Review deleted.' });
  } catch (err) { res.status(500).json({ error: 'Failed to delete review.' }); }
});

router.get('/guides', authenticateToken, async (req, res) => {
  try {
    const [guides] = await pool.query(
      `SELECT g.*, s.name as spot_name, s.image as spot_image
       FROM guides g JOIN spots s ON g.spot_id = s.id
       WHERE g.spot_id IN (SELECT spot_id FROM saved_spots WHERE user_id = ?)
       ORDER BY g.rating DESC`, [req.user.id]
    );
    res.json({ guides });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch guides.' }); }
});

router.get('/bookings', authenticateToken, async (req, res) => {
  try {
    const [bookings] = await pool.query(
      `SELECT * FROM bookings WHERE user_id = ? ORDER BY created_at DESC`, [req.user.id]
    );
    res.json({ bookings });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch bookings.' }); }
});

router.post('/bookings', authenticateToken, async (req, res) => {
  try {
    const { type, target_name, price, booking_date } = req.body;
    if (!type || !target_name) return res.status(400).json({ error: 'Type and target name are required.' });
    
    await pool.query(
      'INSERT INTO bookings (user_id, type, target_name, price, booking_date) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, type, target_name, price || 0, booking_date || null]
    );
    res.json({ message: 'Booking confirmed successfully!' });
  } catch (err) { 
    console.error('Booking error:', err);
    res.status(500).json({ error: 'Failed to process booking.' }); 
  }
});

router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const [savedCount] = await pool.query('SELECT COUNT(*) as count FROM saved_spots WHERE user_id = ?', [req.user.id]);
    const [reviewCount] = await pool.query('SELECT COUNT(*) as count FROM reviews WHERE user_id = ?', [req.user.id]);
    const [recentReviews] = await pool.query(
      `SELECT r.*, s.name as spot_name, s.image as spot_image
       FROM reviews r JOIN spots s ON r.spot_id = s.id
       WHERE r.user_id = ? ORDER BY r.created_at DESC LIMIT 5`, [req.user.id]
    );
    const [recentSaved] = await pool.query(
      `SELECT s.*, d.name as district_name, div.name as division_name
       FROM saved_spots ss JOIN spots s ON ss.spot_id = s.id
       LEFT JOIN districts d ON s.district_id = d.id
       LEFT JOIN divisions div ON s.division_id = div.id
       WHERE ss.user_id = ? ORDER BY ss.created_at DESC LIMIT 5`, [req.user.id]
    );
    res.json({ savedCount: savedCount[0].count, reviewCount: reviewCount[0].count, recentReviews, recentSaved });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch dashboard data.' }); }
});

module.exports = router;