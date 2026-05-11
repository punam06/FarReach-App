const express = require('express');
const pool = require('../config/database');
const router = express.Router();

function normalizeDistrict(district) {
  return (district || '').toString().trim();
}

// Mock helpers for development when OpenWeather API key is missing
function mockWeatherData(district) {
  const conditions = ['clear sky', 'few clouds', 'scattered clouds', 'overcast clouds', 'light rain'];
  const mains = ['Clear', 'Clouds', 'Clouds', 'Clouds', 'Rain'];
  const idx = Math.floor(Math.random() * conditions.length);
  
  return {
    coord: { lon: 90.3563, lat: 23.8103 }, // Default to Dhaka coords
    weather: [{ 
      id: 800 + idx, 
      main: mains[idx], 
      description: conditions[idx], 
      icon: `0${idx}d` 
    }],
    main: { 
      temp: 25 + Math.random() * 8, 
      feels_like: 26 + Math.random() * 7, 
      temp_min: 22 + Math.random() * 5,
      temp_max: 28 + Math.random() * 8,
      pressure: 1010 + Math.random() * 5,
      humidity: 50 + Math.random() * 30 
    },
    visibility: 9000 + Math.random() * 1000,
    wind: { speed: 2 + Math.random() * 4, deg: Math.random() * 360 },
    clouds: { all: Math.random() * 100 },
    dt: Math.floor(Date.now() / 1000),
    timezone: 21600,
    name: district || 'Unknown',
    sys: { country: 'BD' },
    message: 'OpenWeather API key not configured – using mock weather data.'
  };
}

function mockForecastData(district) {
  const now = new Date();
  const list = [];
  // Generate forecast data for the next 5 days with 3-hour intervals (40 entries total)
  for (let day = 0; day < 5; day++) {
    for (let interval = 0; interval < 8; interval++) {
      const forecastDate = new Date(now.getTime() + (day * 24 + interval * 3) * 3600000);
      const dtUnix = Math.floor(forecastDate.getTime() / 1000); // Unix timestamp in seconds
      const isoStr = forecastDate.toISOString();
      const dt_txt = isoStr.slice(0, 10) + ' ' + isoStr.slice(11, 19); // Format: "YYYY-MM-DD HH:MM:SS"
      
      list.push({
        dt: dtUnix,
        dt_txt: dt_txt,
        main: { 
          temp: 20 + Math.random() * 10, 
          feels_like: 18 + Math.random() * 12, 
          humidity: 45 + Math.random() * 35 
        },
        weather: [{ 
          main: 'Clear', 
          description: 'clear sky', 
          icon: '01d' 
        }],
        wind: { speed: 2 + Math.random() * 5 },
        pop: Math.random() * 0.4 // Probability of precipitation (0-40%)
      });
    }
  }
  return {
    list,
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
      SELECT r.id, r.spot_id, r.rating, r.text, r.created_at, u.name as user_name, u.email as user_email
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    res.json({ reviews });
  } catch (err) {
    console.error('Public reviews error:', err);
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
    googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || 'not-configured',
    openWeatherApiKey: process.env.OPENWEATHER_API_KEY ? 'configured' : 'not-configured'
  });
});

module.exports = router;
