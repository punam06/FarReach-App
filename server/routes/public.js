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

router.get('/weather', async (req, res) => {
  try {
    const district = normalizeDistrict(req.query.district);
    if (!district) return res.status(400).json({ error: 'district is required' });

    const key = process.env.OPENWEATHER_API_KEY;
    if (!key) {
    // Return mock forecast data for development when API key is missing
    return res.json({ district, date, data: mockForecastData(district) });
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

    const nights = Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / (1000 * 60 * 60 * 24)));
    const basePrice = ((people || 2) * 1500) + (((hotelType || '').includes('Luxury') || (hotelType || '').includes('Boutique')) ? 3000 : 1000);
    const vatRate = 0.15;
    const serviceRate = 0.10;

    const hotels = [
      {
        name: `${hotelType || 'Hotel'} ${city}`,
        type: hotelType || 'Standard',
        rating: 4.5,
        features: features ? features.split(',').map((f) => f.trim()) : ['WiFi', 'AC'],
        pricePerNight: basePrice,
        hasCorporateRate: Math.random() > 0.5,
        hasBankDiscount: Math.random() > 0.7,
        portals: [
          { name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${city}, Bangladesh`)}` },
          { name: 'Hotel.com.bd', url: 'https://hotel.com.bd' },
          { name: 'Carefly', url: 'https://careflybd.com/hotel-booking/' },
          { name: 'Parjatan (Official)', url: 'https://hotels.gov.bd' }
        ]
      },
      {
        name: `Grand ${city} Resort`,
        type: hotelType || 'Resort',
        rating: 4.2,
        features: ['WiFi', 'Pool', 'Restaurant', ...(features ? features.split(',').map((f) => f.trim()) : [])],
        pricePerNight: Math.round(basePrice * 1.3),
        hasCorporateRate: true,
        hasBankDiscount: false,
        portals: [
          { name: 'Booking.com', url: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(`${city}, Bangladesh`)}` },
          { name: 'Hotel.com.bd', url: 'https://hotel.com.bd' }
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

module.exports = router;
