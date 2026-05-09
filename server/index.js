require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');

const path = require('path');
const app = express();
// Serve the frontend files (index.html, script.js, styles.css) from the project root
app.use(express.static(path.join(__dirname, '..')));

// Simple CORS middleware to allow requests from any origin (VS Code Live Server, etc.)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
const PORT = process.env.PORT || 3000;

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

function normalizeDistrict(district) {
  const s = (district ?? '').toString().trim();
  return s;
}

app.get('/api/weather', async (req, res) => {
  try {
    const district = normalizeDistrict(req.query.district);
    if (!district) return res.status(400).json({ error: 'district is required' });

    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error('Missing OPENWEATHER_API_KEY');
    
    const q = encodeURIComponent(district + ',BD');
    const url = 'https://api.openweathermap.org/data/2.5/weather?q=' + q + '&units=metric&appid=' + key;
    
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'Weather lookup failed' });

    const data = await r.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.get('/api/forecast', async (req, res) => {
  try {
    const district = normalizeDistrict(req.query.district);
    const date = (req.query.date ?? '').toString().trim();

    if (!district) return res.status(400).json({ error: 'district is required' });
    if (!date) return res.status(400).json({ error: 'date is required (YYYY-MM-DD)' });

    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) throw new Error('Missing OPENWEATHER_API_KEY');
    
    const q = encodeURIComponent(district + ',BD');
    const url = 'https://api.openweathermap.org/data/2.5/forecast?q=' + q + '&units=metric&appid=' + key;
    
    const r = await fetch(url);
    if (!r.ok) return res.status(502).json({ error: 'Forecast lookup failed' });

    const data = await r.json();
    res.json({ district, date, data });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});

app.listen(PORT, () => {
  console.log('API server listening on http://localhost:' + PORT);
});
// Hotel search endpoint - returns BD hotel portals with search parameters
app.post('/api/hotels/search', express.json(), async (req, res) => {
  try {
    const { hotelType, city, people, features, checkin, checkout } = req.body;

    if (!city) return res.status(400).json({ error: 'city is required' });
    if (!checkin || !checkout) return res.status(400).json({ error: 'check-in and check-out dates are required' });

    // Calculate nights
    const nights = Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / (1000*60*60*24)));

    // Generate hotel results
    const basePrice = ((people || 2) * 1500) + (((hotelType?.includes('Luxury') || hotelType?.includes('Boutique')) ? 3000 : 1000));
    const vatRate = 0.15;
    const serviceRate = 0.10;

    const hotels = [
      {
        name: `${hotelType || 'Hotel'} ${city}`,
        type: hotelType || 'Standard',
        rating: 4.5,
        features: features ? features.split(',').map(f => f.trim()) : ['WiFi', 'AC'],
        pricePerNight: basePrice,
        hasCorporateRate: Math.random() > 0.5,
        hasBankDiscount: Math.random() > 0.7,
        portals: [
          { name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city + ', Bangladesh')}` },
          { name: 'Hotel.com.bd', url: 'https://hotel.com.bd' },
          { name: 'Carefly', url: 'https://careflybd.com/hotel-booking/' },
          { name: 'Parjatan (Official)', url: 'https://hotels.gov.bd' }
        ]
      },
      {
        name: `Grand ${city} Resort`,
        type: hotelType || 'Resort',
        rating: 4.2,
        features: ['WiFi', 'Pool', 'Restaurant', ...(features ? features.split(',').map(f => f.trim()) : [])],
        pricePerNight: Math.round(basePrice * 1.3),
        hasCorporateRate: true,
        hasBankDiscount: false,
        portals: [
          { name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(city + ', Bangladesh')}` },
          { name: 'Hotel.com.bd', url: 'https://hotel.com.bd' }
        ]
      }
    ];

    // Calculate totals with VAT (15%) and service charge (10%)
    hotels.forEach(h => {
      const vat = Math.round(h.pricePerNight * vatRate);
      const service = Math.round(h.pricePerNight * serviceRate);
      h.totalPrice = (h.pricePerNight + vat + service) * nights;
      h.vat = vat * nights;
      h.service = service * nights;
      h.subtotal = h.pricePerNight * nights;
      h.nights = nights;
    });

    res.json({ hotels, searchParams: { hotelType, city, people, features, checkin, checkout, nights } });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Server error' });
  }
});
