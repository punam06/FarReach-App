const express = require('express');
const pool = require('../config/database');
const router = express.Router();

const budgetRates = {
  transport: { bus: 900, train: 1200, launch: 750, air: 6500 },
  hotel: { budget: 1800, standard: 3500, premium: 7000 },
  guide: { budget: 2800, standard: 4200, premium: 6500 },
  activity: { leisure: 1200, culture: 1000, adventure: 1800, eco: 1100, wildlife: 1500, family: 900 }
};

function getBudgetClass(spot) {
  return (spot.budget_category || 'Low').toString().toLowerCase() === 'high' ? 'high' : 'low';
}

function getOpportunityByCategory(category) {
  const categoryMap = {
    Beach: 'leisure',
    Wildlife: 'wildlife',
    Island: 'leisure',
    Mountain: 'adventure',
    Nature: 'eco',
    Historical: 'culture',
    Lake: 'family'
  };
  return categoryMap[category] || 'leisure';
}

function buildBudgetEstimate(spot, inputs) {
  const travelers = Math.max(1, Number(inputs.travelers) || 1);
  const nights = Math.max(1, Number(inputs.nights) || 1);
  const guideDays = Math.max(0, Number(inputs.guideDays) || 0);
  const transportMode = inputs.transportMode || 'bus';
  const hotelTier = inputs.hotelTier || 'standard';
  const budgetClass = getBudgetClass(spot);
  const opportunity = getOpportunityByCategory(spot.category);

  const transportRate = budgetRates.transport[transportMode] || budgetRates.transport.bus;
  const hotelRate = budgetRates.hotel[hotelTier] || budgetRates.hotel.standard;
  const guideRate = Number(spot.guide_price) > 0 ? Number(spot.guide_price) : budgetRates.guide[hotelTier] || budgetRates.guide.standard;
  const activityRate = budgetRates.activity[opportunity] || budgetRates.activity.leisure;

  const tripTickets = Math.round(transportRate * travelers * (budgetClass === 'high' ? 1.2 : 1));
  const hotelBooking = Math.round(hotelRate * nights * travelers * (budgetClass === 'high' ? 1.15 : 1));
  const guideBooking = Math.round(guideRate * guideDays);
  const localActivity = Math.round(activityRate * travelers);
  const contingency = Math.round((tripTickets + hotelBooking + guideBooking + localActivity) * 0.1);

  return {
    spot: spot.name,
    district: spot.district_name || spot.district,
    division: spot.division_name || '',
    travelers,
    nights,
    guideDays,
    currency: 'BDT',
    breakdown: {
      tripTickets,
      hotelBooking,
      guideBooking,
      localActivity,
      contingency
    },
    total: tripTickets + hotelBooking + guideBooking + localActivity + contingency
  };
}

router.get('/', async (req, res) => {
  try {
    const [spots] = await pool.query(
      `SELECT s.*, d.name as district_name, dv.name as division_name,
       (SELECT AVG(rating) FROM reviews WHERE spot_id = s.id) as avg_rating,
       (SELECT COUNT(*) FROM reviews WHERE spot_id = s.id) as review_count
       FROM spots s LEFT JOIN districts d ON s.district_id = d.id
       LEFT JOIN divisions dv ON s.division_id = dv.id ORDER BY s.name`
    );
    res.json({ spots });
  } catch (err) {
    console.error('Spots fetch error:', err);
    const mockSpots = [
      { id: 1, name: "Cox's Bazar Beach", district_name: "Cox's Bazar", division_name: 'Chattogram', avg_rating: 4.5, review_count: 10 },
      { id: 2, name: 'Sundarbans', district_name: 'Khulna', division_name: 'Jessore', avg_rating: 4.7, review_count: 8 }
    ];
    res.json({ spots: mockSpots });
  }
});

router.post('/:id/budget-estimate', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.*, d.name as district_name, dv.name as division_name,
       (SELECT MIN(price) FROM guides WHERE spot_id = s.id) as guide_price
       FROM spots s LEFT JOIN districts d ON s.district_id = d.id
       LEFT JOIN divisions dv ON s.division_id = dv.id WHERE s.id = ?`,
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Spot not found.' });
    }

    const estimate = buildBudgetEstimate(rows[0], req.body || {});
    res.json({ estimate });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate budget.' });
  }
});

router.get('/meta/divisions', async (req, res) => {
  try {
    const [divisions] = await pool.query('SELECT * FROM divisions ORDER BY name');
    res.json({ divisions });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch divisions.' }); }
});

router.get('/meta/districts', async (req, res) => {
  try {
    const [districts] = await pool.query('SELECT d.*, dv.name as division_name FROM districts d JOIN divisions dv ON d.division_id = dv.id ORDER BY dv.name, d.name');
    res.json({ districts });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch districts.' }); }
});

router.get('/division/:divisionId', async (req, res) => {
  try {
    const [spots] = await pool.query(
      `SELECT s.*, d.name as district_name FROM spots s LEFT JOIN districts d ON s.district_id = d.id WHERE s.division_id = ? ORDER BY s.name`, [req.params.divisionId]
    );
    res.json({ spots });
  } catch (err) {
    console.error('Spots fetch error:', err);
    const mockSpots = [
      { id: 1, name: "Cox's Bazar Beach", district_name: "Cox's Bazar", division_name: 'Chattogram', avg_rating: 4.5, review_count: 10 },
      { id: 2, name: 'Sundarbans', district_name: 'Khulna', division_name: 'Jessore', avg_rating: 4.7, review_count: 8 }
    ];
    res.json({ spots: mockSpots });
  }
});

router.get('/district/:districtId', async (req, res) => {
  try {
    const [spots] = await pool.query(
      `SELECT s.*, dv.name as division_name FROM spots s LEFT JOIN divisions dv ON s.division_id = dv.id WHERE s.district_id = ? ORDER BY s.name`, [req.params.districtId]
    );
    res.json({ spots });
  } catch (err) {
    console.error('Spots fetch error:', err);
    const mockSpots = [
      { id: 1, name: "Cox's Bazar Beach", district_name: "Cox's Bazar", division_name: 'Chattogram', avg_rating: 4.5, review_count: 10 },
      { id: 2, name: 'Sundarbans', district_name: 'Khulna', division_name: 'Jessore', avg_rating: 4.7, review_count: 8 }
    ];
    res.json({ spots: mockSpots });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [spots] = await pool.query(
      `SELECT s.*, d.name as district_name, dv.name as division_name,
       (SELECT AVG(rating) FROM reviews WHERE spot_id = s.id) as avg_rating,
       (SELECT COUNT(*) FROM reviews WHERE spot_id = s.id) as review_count
       FROM spots s LEFT JOIN districts d ON s.district_id = d.id
       LEFT JOIN divisions dv ON s.division_id = dv.id WHERE s.id = ?`, [req.params.id]
    );
    if (spots.length === 0) return res.status(404).json({ error: 'Spot not found.' });
    const [reviews] = await pool.query(
      `SELECT r.*, u.name as user_name FROM reviews r JOIN users u ON r.user_id = u.id WHERE r.spot_id = ? ORDER BY r.created_at DESC`, [req.params.id]
    );
    const [guides] = await pool.query('SELECT * FROM guides WHERE spot_id = ?', [req.params.id]);
    res.json({ spot: spots[0], reviews, guides });
  } catch (err) { res.status(500).json({ error: 'Failed to fetch spot.' }); }
});

module.exports = router;