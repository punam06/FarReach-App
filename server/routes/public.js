const express = require('express');

const router = express.Router();

function normalizeDistrict(district) {
  return (district || '').toString().trim();
}

// Mock helpers for development when OpenWeather API key is missing
function mockWeatherData(district) {
  return {
    weather: [{ description: 'clear sky', icon: '01d' }],
    main: { temp: 27, feels_like: 27, humidity: 60 },
    name: district || 'Unknown',
    sys: { country: 'BD' },
    message: 'OpenWeather API key not configured – using mock weather data.'
  };
}

function mockForecastData(district) {
  return {
    list: Array.from({ length: 5 }, (_, i) => ({
      dt_txt: `${new Date().toISOString().split('T')[0]} 12:00:00`,
      main: { temp: 27 + i, humidity: 60 },
      weather: [{ description: 'clear sky', icon: '01d' }]
    })),
    city: { name: district || 'Unknown', country: 'BD' },
    message: 'OpenWeather API key not configured – using mock forecast data.'
  };
}

router.get('/health', async (req, res) => {
  res.json({ ok: true, service: 'tourismapp-server' });
});

router.get('/spots', async (req, res) => {
  try {
    const [spots] = await pool.query(`
      SELECT s.*, d.name as district_name, dv.name as division_name 
      FROM spots s 
      LEFT JOIN districts d ON s.district_id = d.id 
      LEFT JOIN divisions dv ON s.division_id = dv.id 
      ORDER BY s.created_at DESC
    `);
    res.json({ spots });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch spots' });
  }
});

router.get('/reviews/public', async (req, res) => {
  try {
    const [reviews] = await pool.query(`
      SELECT r.id, r.spot_id, r.rating, r.text, r.created_at, u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.json({ reviews });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

router.get('/weather', async (req, res) => {
  try {
    const district = normalizeDistrict(req.query.district);
    if (!district) return res.status(400).json({ error: 'district is required' });

    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) {
      // Return mock weather data for development when API key is missing
      return res.json(mockWeatherData(district));
    }

    const q = encodeURIComponent(`${district},BD`);
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${q}&units=metric&appid=${key}`;

    const response = await fetch(url);
    if (!response.ok) return res.status(502).json({ error: 'Weather lookup failed' });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.get('/forecast', async (req, res) => {
  try {
    const district = normalizeDistrict(req.query.district);
    const date = (req.query.date || '').toString().trim();

    if (!district) return res.status(400).json({ error: 'district is required' });
    if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });

    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) {
    // Return mock forecast data for development when API key is missing
    return res.json({ district, date, data: mockForecastData(district) });
  }

    const q = encodeURIComponent(`${district},BD`);
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${q}&units=metric&appid=${key}`;

    const response = await fetch(url);
    if (!response.ok) return res.status(502).json({ error: 'Forecast lookup failed' });

    const data = await response.json();
    res.json({ district, date, data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.post('/hotels/search', async (req, res) => {
  try {
    const { hotelType, city, people, features, checkin, checkout } = req.body || {};

    if (!city) return res.status(400).json({ error: 'city is required' });
    if (!checkin || !checkout) return res.status(400).json({ error: 'check-in and check-out dates are required' });

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);
    const nights = Math.max(1, Math.ceil((checkoutDate - checkinDate) / (1000 * 60 * 60 * 24)));
    
    // Seasonal multiplier (High season: Dec-Feb, Mid: Oct-Nov, Mar)
    const month = checkinDate.getMonth();
    let seasonalMult = 1.0;
    if (month >= 11 || month <= 1) seasonalMult = 1.5; // Peak Winter
    else if (month === 9 || month === 10 || month === 2) seasonalMult = 1.2;

    // City-based base rates (Dhaka, Cox's Bazar, Sylhet are more expensive)
    const cityRates = {
      'Dhaka': 2500,
      "Cox's Bazar": 3000,
      'Sylhet': 2200,
      'Chittagong': 2000,
      'Khulna': 1800
    };
    const cityBase = cityRates[city] || 1500;
    
    // People factor
    const peopleFactor = Math.max(1, Math.ceil(people / 2)); // Assume 2 per room

    // Type multiplier
    const typeMult = (hotelType?.includes('Luxury')) ? 2.5 : (hotelType?.includes('Boutique') ? 1.8 : 1.0);

    const basePrice = Math.round(cityBase * peopleFactor * typeMult * seasonalMult);
    const vatRate = 0.15;
    const serviceRate = 0.10;

    const hotels = [
      {
        name: `${hotelType || 'Standard'} ${city} Central`,
        type: hotelType || 'Standard',
        rating: 4.5,
        features: features ? features.split(',').map((f) => f.trim()) : ['WiFi', 'AC', 'Room Service'],
        pricePerNight: basePrice,
        hasCorporateRate: Math.random() > 0.4,
        hasBankDiscount: Math.random() > 0.6,
        portals: [
          { name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${city}, Bangladesh`)}` },
          { name: 'GoZayan', url: 'https://gozayan.com' },
          { name: 'Hotel.com.bd', url: 'https://hotel.com.bd' }
        ]
      },
      {
        name: `Royal ${city} Palace`,
        type: 'Luxury Resort',
        rating: 4.8,
        features: ['Pool', 'Spa', 'Gym', 'Breakfast Included', ...(features ? features.split(',').map((f) => f.trim()) : [])],
        pricePerNight: Math.round(basePrice * 1.6),
        hasCorporateRate: true,
        hasBankDiscount: true,
        portals: [
          { name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${city}, Bangladesh`)}` },
          { name: 'ShareTrip', url: 'https://sharetrip.net' }
        ]
      },
      {
        name: `${city} Comfort Inn`,
        type: 'Budget',
        rating: 3.9,
        features: ['WiFi', 'AC', '24/7 Security'],
        pricePerNight: Math.round(basePrice * 0.6),
        hasCorporateRate: false,
        hasBankDiscount: false,
        portals: [
          { name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${city}, Bangladesh`)}` }
        ]
      }
    ];

    hotels.forEach((hotel) => {
      const vat = Math.round(hotel.pricePerNight * vatRate);
      const service = Math.round(hotel.pricePerNight * serviceRate);
      hotel.totalPrice = (hotel.pricePerNight + vat + service) * nights;
      hotel.vat = vat * nights;
      hotel.service = service * nights;
      hotel.subtotal = hotel.pricePerNight * nights;
      hotel.nights = nights;
    });

    res.json({ hotels, searchParams: { hotelType, city, people, features, checkin, checkout, nights } });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

router.get('/config', (req, res) => {
  res.json({
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'AIzaSyA06LZtXWwqLA9GsLjxYFxD9tF0DijV7AU'
  });
});

module.exports = router;
