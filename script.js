// ==== TOURIST SPOTS DATA ====
const spots = [
  { 
    id: 1, 
    name: 'Cox\'s Bazar Beach', 
    district: 'Cox\'s Bazar', 
    category: 'Beach', 
    description: 'The world\'s longest natural beach stretching 120 km along the Bay of Bengal.',
    history: 'Discovered in 1798 by British officer Captain Hiram Cox, this beach gets its name from him. It served as a trading hub for centuries and played a crucial role in the region\'s maritime history during the British colonial period.'
  },
  { 
    id: 2, 
    name: 'Sundarbans', 
    district: 'Khulna', 
    category: 'Wildlife', 
    description: 'Largest mangrove forest in the world, home to the Royal Bengal Tiger.',
    history: 'Declared a UNESCO World Heritage Site in 1997, the Sundarbans has been a vital ecosystem for over 4,000 years. Ancient Buddhist monasteries and temples dating back to the 12th century have been discovered within its dense mangrove forests.'
  },
  { 
    id: 3, 
    name: 'Saint Martin Island', 
    district: 'Cox\'s Bazar', 
    category: 'Island', 
    description: 'A small island with pristine beaches and coral reefs perfect for diving.',
    history: 'Originally known as "Narikel Jinjira" (Coconut Island), this coral island has been inhabited for over 200 years. The local Saint Martin community traces its roots to Arakanese settlers who arrived in the 18th century, bringing with them unique cultural traditions.'
  },
  { 
    id: 4, 
    name: 'Rangamati', 
    district: 'Rangamati', 
    category: 'Mountain', 
    description: 'Scenic hill tracts with beautiful waterfalls and tribal culture.',
    history: 'Established as a administrative center in 1860 by the British, Rangamati has been the heart of the Chittagong Hill Tracts. The region served as a crucial trade route between Bengal and Burma, with evidence of ancient settlements dating back to the 7th century.'
  },
  { 
    id: 5, 
    name: 'Bandarban', 
    district: 'Bandarban', 
    category: 'Mountain', 
    description: 'Adventure destination with trekking trails and indigenous villages.',
    history: 'Bandarban was historically a part of the Arakan Kingdom before coming under British control in 1824. The region has been home to various indigenous tribes for centuries, each maintaining their unique cultural practices and traditional governance systems.'
  },
  { 
    id: 6, 
    name: 'Sylhet Tea Gardens', 
    district: 'Sylhet', 
    category: 'Nature', 
    description: 'Vast green tea estates across rolling hills in the northeast region.',
    history: 'Tea cultivation began in Sylhet in 1849 when British planters discovered the ideal climate conditions. The first commercial tea garden was established at Malnicherra, and by the early 20th century, Sylhet became one of the world\'s finest tea-producing regions.'
  },
  { 
    id: 7, 
    name: 'Sreemangal', 
    district: 'Moulvibazar', 
    category: 'Nature', 
    description: 'Center of tea and rubber plantations with eco-tourism activities.',
    history: 'Known as the "Tea Capital" of Bangladesh, Sreemangal has been a center of tea cultivation since the British era. The region also played a significant role in the country\'s rubber industry development during the 20th century.'
  },
  { 
    id: 8, 
    name: 'Jaflong', 
    district: 'Sylhet', 
    category: 'Nature', 
    description: 'A picturesque location with stone mines and local flora.',
    history: 'Jaflong has been a significant trading post for centuries, serving as a gateway between the plains and the hill regions. The stone extraction industry here dates back to the Mughal period, when these stones were used in major architectural projects.'
  },
  { 
    id: 9, 
    name: 'Lawachara National Park', 
    district: 'Moulvibazar', 
    category: 'Wildlife', 
    description: 'Rainforest sanctuary with diverse bird species and hiking trails.',
    history: 'Established in 1996, Lawachara protects one of Bangladesh\'s last remaining remnant forests. The area has been a research site for decades, with studies documenting over 200 bird species and numerous endangered plant species.'
  },
  { 
    id: 10, 
    name: 'Kuakata Beach', 
    district: 'Patuakhali', 
    category: 'Beach', 
    description: 'Beautiful beach where you can see both sunrise and sunset over water.',
    history: 'Kuakata gets its name from "Kua" (well) dug by early Rakhine settlers. The beach has been a sacred site for centuries, with local legends telling of Buddhist monks who meditated here. It became a popular tourist destination in the 1990s.'
  },
  { 
    id: 11, 
    name: 'Chittagong Hill Tracts', 
    district: 'Chittagong', 
    category: 'Mountain', 
    description: 'Scenic mountainous area with waterfalls, caves, and tribal heritage.',
    history: 'The Hill Tracts have been inhabited by indigenous tribes for over 2,000 years. Ancient Buddhist ruins and monasteries dating back to the 8th century have been discovered, indicating the region\'s importance in early Buddhist history.'
  },
  { 
    id: 12, 
    name: 'Sonargaon', 
    district: 'Narayanganj', 
    category: 'Historical', 
    description: 'Historic city with traditional architecture and folk art museum.',
    history: 'The ancient capital of Bengal from the 13th to 16th century, Sonargaon was a major center of trade and culture. It served as the administrative headquarters of the Sultanate of Bengal and later the Mughal Subah.'
  },
  { 
    id: 13, 
    name: 'Lalbagh Fort', 
    district: 'Dhaka', 
    category: 'Historical', 
    description: 'Mughal-era fortress showcasing rich architectural heritage.',
    history: 'Built in 1678 by Prince Azam Shah, son of Emperor Aurangzeb, this fort represents the pinnacle of Mughal architecture in Bengal. The fort was never completed due to the prince\'s recall to Delhi, but it remains a symbol of Mughal grandeur.'
  },
  { 
    id: 14, 
    name: 'Ahsan Manzil', 
    district: 'Dhaka', 
    category: 'Historical', 
    description: 'Stunning palace complex from the 19th century along the Buriganga River.',
    history: 'Built in 1872 by Nawab Abdul Gani, this pink palace served as the residence of the Dhaka Nawabs. It witnessed many historical events including the Partition of Bengal in 1905 and later became a symbol of Dhaka\'s aristocratic heritage.'
  },
  { 
    id: 15, 
    name: 'Nilgiri', 
    district: 'Bandarban', 
    category: 'Mountain', 
    description: 'Mountain resort with panoramic views and trekking opportunities.',
    history: 'Nilgiri has been a sacred site for indigenous tribes for centuries, who believed it to be the abode of their deities. The British established a sanatorium here in the 19th century due to its cool climate and scenic beauty.'
  },
  { 
    id: 16, 
    name: 'Ramsagar National Park', 
    district: 'Dinajpur', 
    category: 'Wildlife', 
    description: 'Historic natural park with scenic lake and botanical gardens.',
    history: 'The Ramsagar Lake was constructed in 1750-1758 by Maharaja Ram Nath to solve water scarcity issues. The surrounding forest has been protected for over 250 years, making it one of Bangladesh\'s oldest conservation areas.'
  },
  { 
    id: 17, 
    name: 'Bisnakandi', 
    district: 'Sylhet', 
    category: 'Nature', 
    description: 'Scenic area with stone-laden streams and natural beauty.',
    history: 'Bisnakandi has been a center of stone trade for centuries, with the unique black stones here being used in construction throughout the region. The area was also a strategic point during various historical conflicts.'
  },
  { 
    id: 18, 
    name: 'Foy\'s Lake', 
    district: 'Chittagong', 
    category: 'Lake', 
    description: 'Artificial lake surrounded by hills, perfect for water activities.',
    history: 'Created in 1924 by the British as an alternative water supply, Foy\'s Lake was named after Mr. Foy, the then-Chief Commissioner of Chittagong. The lake quickly became a popular recreational spot for British officials and locals alike.'
  },
  { 
    id: 19, 
    name: 'Patenga Beach', 
    district: 'Chittagong', 
    category: 'Beach', 
    description: 'Popular beach near Chittagong with waves and maritime views.',
    history: 'Patenga has been a crucial maritime port for centuries, serving as a gateway for trade and naval activities. During World War II, it played a strategic role in Allied operations in the Bay of Bengal.'
  },
  { 
    id: 20, 
    name: 'Tajhat Palace', 
    district: 'Rangpur', 
    category: 'Historical', 
    description: 'Magnificent Raj-era palace with impressive architecture.',
    history: 'Built in the early 20th century by Maharaja Kumar Gopal Lal Roy, this palace showcases Indo-Saracenic architectural style. It served as the royal residence until the abolition of the zamindari system in 1950, after which it was converted into a museum.'
  }
];

let allSpots = [...spots];
let currentCategory = 'All';
let currentSelectedSpot = null;

// Determine API base URL: if page is served from the same Express server (port 3000)
// use relative paths; otherwise (e.g., VS Code Live Server on port 5500) use absolute URL.
const API_BASE = (location.port && location.port !== '3000') ? 'http://localhost:3000' : '';
const AUTH_KEYS = {
  accessToken: 'auth.accessToken',
  refreshToken: 'auth.refreshToken',
  user: 'auth.user',
  pendingOtpEmail: 'auth.pendingOtpEmail'
};

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEYS.user) || 'null');
  } catch (_err) {
    return null;
  }
}

function getAccessToken() {
  return localStorage.getItem(AUTH_KEYS.accessToken);
}

function setSession({ accessToken, refreshToken, user }) {
  if (accessToken) localStorage.setItem(AUTH_KEYS.accessToken, accessToken);
  if (refreshToken) localStorage.setItem(AUTH_KEYS.refreshToken, refreshToken);
  if (user) localStorage.setItem(AUTH_KEYS.user, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(AUTH_KEYS.accessToken);
  localStorage.removeItem(AUTH_KEYS.refreshToken);
  localStorage.removeItem(AUTH_KEYS.user);
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function authFetch(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  if (response.status !== 401) return response;

  const refreshToken = localStorage.getItem(AUTH_KEYS.refreshToken);
  if (!refreshToken) return response;

  const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (!refreshRes.ok) {
    clearSession();
    return response;
  }

  const refreshData = await refreshRes.json();
  if (!refreshData.accessToken) return response;

  localStorage.setItem(AUTH_KEYS.accessToken, refreshData.accessToken);
  headers.Authorization = `Bearer ${refreshData.accessToken}`;
  return fetch(url, { ...options, headers });
}

// ==== WEATHER FUNCTIONS ====

// Fetch current weather for the hero sidebar card
async function fetchWeatherFor(district) {
  const card = document.getElementById('weatherCard');
  const iconEl = document.getElementById('heroWeatherIcon');
  const tempEl = document.getElementById('heroWeatherTemp');
  const descEl = document.getElementById('heroWeatherDesc');
  const sugEl = document.getElementById('heroWeatherSuggestion');

  if (!card || !tempEl || !descEl || !sugEl || !iconEl) return;

  // Show card with loading state
  card.style.display = 'block';
  tempEl.textContent = '...';
  descEl.textContent = 'Loading...';
  sugEl.textContent = '';

  try {
    const url = `${API_BASE}/api/weather?district=${encodeURIComponent(district)}`;
    console.log('Fetching weather from:', url);
    const res = await fetch(url);
    console.log('Weather response status:', res.status);
    if (!res.ok) throw new Error('Weather lookup failed');
    const data = await res.json();

    const temp = Math.round(data.main?.temp ?? 0);
    const desc = (data.weather && data.weather[0] && data.weather[0].description) || 'Clear';
    const main = (data.weather && data.weather[0] && data.weather[0].main) || '';

    tempEl.textContent = `${temp}°C`;
    descEl.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
    iconEl.textContent = chooseIcon(main, desc);
    sugEl.textContent = travelSuggestion(main.toLowerCase(), temp);
  } catch (err) {
    console.error('Weather fetch error:', err);
    tempEl.textContent = '--°C';
    descEl.textContent = 'Unavailable';
    iconEl.textContent = '⚠️';
    sugEl.textContent = 'Weather data unavailable: ' + err.message;
  }
}

// Fetch forecast for the tab weather section
async function fetchForecastForDate(district, dateVal) {
  // Validate that the requested date is within the next 5 days (OpenWeatherMap limit)
  const now = new Date();
  const maxDate = new Date(now.getTime() + 5 * 86400000); // 5 days from now
  const selected = new Date(dateVal);
  if (isNaN(selected.getTime())) {
    const sugEl = document.getElementById('tabWeatherSuggestion');
    if (sugEl) sugEl.textContent = 'Invalid date format.';
    return;
  }
  if (selected > maxDate) {
    const sugEl = document.getElementById('tabWeatherSuggestion');
    if (sugEl) sugEl.textContent = 'OpenWeatherMap provides forecasts only up to 5 days ahead.';
    return;
  }

  const iconEl = document.getElementById('tabWeatherIcon');
  const tempEl = document.getElementById('tabWeatherTemp');
  const descEl = document.getElementById('tabWeatherDesc');
  const sugEl = document.getElementById('tabWeatherSuggestion');

  if (!tempEl || !descEl || !sugEl || !iconEl) return;

  // Show loading state
  tempEl.textContent = '...';
  descEl.textContent = 'Loading forecast...';
  sugEl.textContent = '';

  try {
    const url = `${API_BASE}/api/forecast?district=${encodeURIComponent(district)}&date=${encodeURIComponent(dateVal)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Forecast lookup failed');
    const result = await res.json();

    const data = result.data || result;

    // Process forecast data
    const forecastDate = new Date(dateVal + 'T00:00:00');
    const start = forecastDate.getTime();
    const end = start + 24 * 60 * 60 * 1000;
    const list = Array.isArray(data.list) ? data.list : [];
    const candidates = list.filter((it) => {
      const dtMs = (it.dt || 0) * 1000;
      return dtMs >= start && dtMs < end;
    });

    if (!candidates.length) throw new Error('No forecast data for this date');
    const noon = new Date(dateVal + 'T12:00:00').getTime();
    candidates.sort((a, b) =>
      Math.abs(a.dt * 1000 - noon) - Math.abs(b.dt * 1000 - noon)
    );
    const chosen = candidates[0];

    const temp = Math.round(chosen.main?.temp ?? 0);
    const weather = chosen.weather && chosen.weather[0] ? chosen.weather[0] : {};
    const main = weather.main || '';
    const desc = weather.description || '';
    const pop = Math.round((chosen.pop || 0) * 100);
    const windKph = chosen.wind?.speed ? Math.round(chosen.wind.speed * 3.6) : 0;

    tempEl.textContent = `${temp}°C`;
    descEl.textContent = desc.charAt(0).toUpperCase() + desc.slice(1) || 'Partly Cloudy';
    iconEl.textContent = chooseIcon(main, desc);
    sugEl.textContent = `Rain chance ~${pop}%${windKph ? `, Wind ~${windKph} km/h` : ''}. ${getTripSafety(
      main.toLowerCase(),
      temp,
      pop,
      windKph
    )}`;
  } catch (err) {
    tempEl.textContent = '--°C';
    descEl.textContent = 'Unavailable';
    iconEl.textContent = '⚠️';
    sugEl.textContent = 'Forecast not available for this date. OpenWeatherMap provides 5-day forecasts only.';
  }
}

// Get weather for the tab section (called by the Get Forecast button)
function getTabWeather() {
  const district = document.getElementById('resultDistrict').textContent;
  const dateInput = document.getElementById('tripDate');
  const dateVal = dateInput ? dateInput.value : '';

  if (!district || district === '-') {
    const sugEl = document.getElementById('tabWeatherSuggestion');
    if (sugEl) sugEl.textContent = 'Please select a destination first.';
    return;
  }

  if (dateVal) {
    fetchForecastForDate(district, dateVal);
  } else {
    // No date selected - fetch current weather for the tab
    fetchCurrentWeatherForTab(district);
  }
}

// Fetch current weather and display in the tab section
async function fetchCurrentWeatherForTab(district) {
  const iconEl = document.getElementById('tabWeatherIcon');
  const tempEl = document.getElementById('tabWeatherTemp');
  const descEl = document.getElementById('tabWeatherDesc');
  const sugEl = document.getElementById('tabWeatherSuggestion');

  if (!tempEl || !descEl || !sugEl || !iconEl) return;

  tempEl.textContent = '...';
  descEl.textContent = 'Loading...';
  sugEl.textContent = '';

  try {
    const url = `${API_BASE}/api/weather?district=${encodeURIComponent(district)}`;
    console.log('Fetching tab weather from:', url);
    const res = await fetch(url);
    console.log('Tab weather response status:', res.status);
    if (!res.ok) throw new Error('Weather lookup failed');
    const data = await res.json();

    const temp = Math.round(data.main?.temp ?? 0);
    const desc = (data.weather && data.weather[0] && data.weather[0].description) || 'Clear';
    const main = (data.weather && data.weather[0] && data.weather[0].main) || '';
    const humidity = data.main?.humidity ?? 0;
    const windSpeed = data.wind?.speed ? Math.round(data.wind.speed * 3.6) : 0;

    tempEl.textContent = `${temp}°C`;
    descEl.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
    iconEl.textContent = chooseIcon(main, desc);
    sugEl.textContent = `Humidity: ${humidity}%, Wind: ${windSpeed} km/h. ${travelSuggestion(main.toLowerCase(), temp)}`;
  } catch (err) {
    tempEl.textContent = '--°C';
    descEl.textContent = 'Unavailable';
    iconEl.textContent = '⚠️';
    sugEl.textContent = 'Weather data unavailable. Make sure the server is running.';
  }
}

// Utility functions
function chooseIcon(main, desc) {
  const m = (main || '').toLowerCase();
  if (m.includes('rain') || m.includes('drizzle') || m.includes('thunder')) return '🌧️';
  if (m.includes('cloud')) return '☁️';
  if (m.includes('snow')) return '❄️';
  if (m.includes('mist') || m.includes('fog') || m.includes('haze')) return '🌫️';
  if (m.includes('clear')) return '☀️';
  return '🌤️';
}

function travelSuggestion(mainLower, temp) {
  if (!mainLower) return 'No suggestion available.';
  if (mainLower.includes('rain') || mainLower.includes('drizzle') || mainLower.includes('thunder'))
    return 'Not recommended — expect rain. Consider postponing or carry waterproof gear.';
  if (temp >= 35)
    return 'Hot conditions — avoid midday travel and carry water.';
  if (temp <= 10)
    return 'Cold conditions — dress warmly and check transport availability.';
  return 'Good conditions for travel — proceed as planned.';
}

function getTripSafety(mainLower, temp, rainChance, windKph) {
  const rc = typeof rainChance === 'number' ? rainChance : 0;
  if (mainLower.includes('rain') || mainLower.includes('drizzle') || mainLower.includes('thunder') || rc >= 55) {
    return 'Not recommended — expect rain. Consider postponing or carry rain protection.';
  }
  if (temp >= 35) {
    return 'Hot conditions — avoid midday travel, rest often, and carry plenty of water.';
  }
  if (temp <= 10) {
    return 'Cool conditions — dress warmly and check local transport timings.';
  }
  return 'Good travel conditions — proceed as planned, but stay aware of quick weather changes.';
}

// ==== RENDER FUNCTION - Main search, filter and display ====
function render() {
  const searchInput = document.getElementById('search');
  const query = (searchInput?.value || '').toLowerCase().trim();
  
  // Filter spots by search query and current category
  let filtered = allSpots;
  
  if (query) {
    filtered = allSpots.filter(spot => 
      spot.name.toLowerCase().includes(query) || 
      spot.district.toLowerCase().includes(query)
    );
  }
  
  if (currentCategory !== 'All') {
    filtered = filtered.filter(spot => spot.category === currentCategory);
  }
  
  // Update stats
  updateStats();
  
  // Update popular grid
  displayPopularGrid(filtered);
  
  // Update featured card with random spot or first filtered result
  if (filtered.length > 0) {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    displayFeatured(filtered[randomIndex]);
  }
  
  // Update search hint
  updateSearchHint(filtered.length, query);
}

function updateStats() {
  document.getElementById('totalPlaces').textContent = allSpots.length + '+';
  
  const districts = new Set(allSpots.map(s => s.district));
  document.getElementById('totalDistricts').textContent = districts.size + '+';
  
  document.getElementById('activeCategory').textContent = currentCategory;
}

function displayPopularGrid(filteredSpots) {
  const grid = document.getElementById('popularGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  filteredSpots.slice(0, 12).forEach(spot => {
    const card = document.createElement('article');
    card.className = 'spot-card';
    card.innerHTML = `
      <div class="spot-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; height: 200px; color: white; font-size: 48px;">
        ${getCategoryEmoji(spot.category)}
      </div>
      <div class="spot-content">
        <h3>${spot.name}</h3>
        <p class="spot-district">${spot.district}</p>
        <span class="spot-category">${spot.category}</span>
      </div>
    `;
    card.style.cursor = 'pointer';
    card.onclick = () => {
      selectSpot(spot);
      document.getElementById('route').scrollIntoView({ behavior: 'smooth' });
    };
    grid.appendChild(card);
  });
  
  if (filteredSpots.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No destinations found. Try different search terms.</p>';
  }
}

function displayFeatured(spot) {
  document.getElementById('featuredName').textContent = spot.name;
  document.getElementById('featuredDistrict').textContent = spot.district;
  document.getElementById('featuredMeta').textContent = spot.category;
  document.getElementById('spotDetailLink').onclick = () => {
    selectSpot(spot);
    document.getElementById('route').scrollIntoView({ behavior: 'smooth' });
  };
}

function selectSpot(spot) {
  currentSelectedSpot = spot;

  document.getElementById('resultName').textContent = spot.name;
  document.getElementById('resultDesc').textContent = spot.description;
  document.getElementById('resultDistrict').textContent = spot.district;
  document.getElementById('resultCategory').textContent = spot.category;
  document.getElementById('resultIndex').textContent = `#${spot.id}`;
  
  // Add historical information
  const historyElement = document.getElementById('resultHistory');
  if (historyElement && spot.history) {
    historyElement.innerHTML = `
      <h4>Historical Background</h4>
      <p>${spot.history}</p>
    `;
    historyElement.style.display = 'block';
  }
  
  // Set background color based on category
  const visual = document.getElementById('resultVisual');
  if (visual) {
    visual.style.background = `linear-gradient(135deg, ${getCategoryColor(spot.category)} 0%, ${getCategoryColor2(spot.category)} 100%)`;
    visual.style.display = 'flex';
    visual.style.alignItems = 'center';
    visual.style.justifyContent = 'center';
    visual.style.fontSize = '80px';
    visual.style.minHeight = '300px';
    visual.innerHTML = getCategoryEmoji(spot.category);
  }
  
  // Fetch weather for the hero sidebar card
  fetchWeatherFor(spot.district);

  // Also fetch weather for the tab if it's active
  const weatherTab = document.getElementById('weather-tab');
  if (weatherTab && weatherTab.classList.contains('active')) {
    fetchCurrentWeatherForTab(spot.district);
  }

  // Update map if map tab is active
  const mapTab = document.getElementById('map-tab');
  if (mapTab && mapTab.classList.contains('active')) {
    loadMap(spot.district, spot.name);
  }
}

function getCategoryEmoji(category) {
  const emojis = {
    'Beach': '🏖️',
    'Wildlife': '🦁',
    'Island': '🏝️',
    'Mountain': '⛰️',
    'Nature': '🌲',
    'Historical': '🏛️',
    'Lake': '🏞️'
  };
  return emojis[category] || '📍';
}

function getCategoryColor(category) {
  const colors = {
    'Beach': '#FF6B6B',
    'Wildlife': '#4ECDC4',
    'Island': '#45B7D1',
    'Mountain': '#96CEB4',
    'Nature': '#FFEAA7',
    'Historical': '#DDA0DD',
    'Lake': '#87CEEB'
  };
  return colors[category] || '#667eea';
}

function getCategoryColor2(category) {
  const colors = {
    'Beach': '#FF8E72',
    'Wildlife': '#44A08D',
    'Island': '#2E8B9E',
    'Mountain': '#6FA876',
    'Nature': '#FFD93D',
    'Historical': '#DA70D6',
    'Lake': '#6BA3C0'
  };
  return colors[category] || '#764ba2';
}

function updateSearchHint(count, query) {
  const hint = document.getElementById('stats');
  if (!hint) return;
  
  if (query) {
    hint.textContent = `Found ${count} destination${count !== 1 ? 's' : ''} matching "${query}"`;
  } else {
    hint.textContent = `Showing all ${count} destinations`;
  }
}

function initializePage() {
  // Set date picker constraints for forecast (today to +5 days)
  const dateInput = document.getElementById('tripDate');
  if (dateInput) {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    const maxDate = new Date(today.getTime() + 5 * 86400000).toISOString().split('T')[0];
    dateInput.min = minDate;
    dateInput.max = maxDate;
    dateInput.value = minDate;
  }

  // Build category bar
  const categoryBar = document.getElementById('categoryBar');
  if (categoryBar) {
    categoryBar.innerHTML = '';
    
    const allBtn = document.createElement('button');
    allBtn.textContent = 'All';
    allBtn.className = 'category-chip active';
    allBtn.onclick = () => {
      currentCategory = 'All';
      document.querySelectorAll('.category-chip').forEach(btn => btn.classList.remove('active'));
      allBtn.classList.add('active');
      render();
    };
    categoryBar.appendChild(allBtn);
    
    const categories = [...new Set(allSpots.map(s => s.category))].sort();
    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = cat;
      btn.className = 'category-chip';
      btn.onclick = () => {
        currentCategory = cat;
        document.querySelectorAll('.category-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        render();
      };
      categoryBar.appendChild(btn);
    });
  }
  
  // Add weather click listener for the hero sidebar
  const weatherLink = document.querySelector('[data-action="weather"]');
  if (weatherLink) {
    weatherLink.onclick = (e) => {
      e.preventDefault();
      const card = document.getElementById('weatherCard');
      if (card) {
        if (card.style.display === 'none') {
          // Show and fetch weather for current spot
          if (currentSelectedSpot) {
            fetchWeatherFor(currentSelectedSpot.district);
          } else {
            card.style.display = 'block';
          }
        } else {
          card.style.display = 'none';
        }
      }
    };
  }
  
  // Initial render
  render();
}

function focusSearch() {
  document.getElementById('search').focus();
  document.getElementById('search').value = '';
  render();
}

function jumpToTop() {
  document.getElementById('home').scrollIntoView({ behavior: 'smooth' });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initializePage);

// ==== TAB NAVIGATION FUNCTION ====
function showTab(tabName, btnElement) {
  // Hide all tab panes
  const tabPanes = document.querySelectorAll('.tab-pane');
  tabPanes.forEach(pane => pane.classList.remove('active'));
  
  // Remove active class from all tab buttons
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => button.classList.remove('active'));
  
  // Show selected tab pane
  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  // Add active class to clicked button
  if (btnElement) {
    btnElement.classList.add('active');
  }
  
  // Initialize tab-specific content
  initializeTabContent(tabName);
}

// ==== TAB CONTENT INITIALIZATION ====
function initializeTabContent(tabName) {
  const district = document.getElementById('resultDistrict')?.textContent || '-';
  
  switch(tabName) {
    case 'weather':
      if (district && district !== '-') {
        fetchCurrentWeatherForTab(district);
      }
      break;
    case 'map':
      if (currentSelectedSpot) {
        loadMap(currentSelectedSpot.district, currentSelectedSpot.name);
      } else {
        loadMap(district, '');
      }
      break;
    case 'route':
      loadRouteOptions(district);
      break;
    case 'hotel':
      loadHotels(district);
      break;
    case 'guide':
      loadGuides(district);
      break;
    case 'history':
      loadHistory();
      break;
  }
}

// ==== MAP FUNCTION ====
function loadMap(district, spotName) {
  const GOOGLE_MAPS_API_KEY = 'AIzaSyA06LZtXWwqLA9GsLjxYFxD9tF0DijV7AU';
  const mapContainer = document.getElementById('mapContainer');
  if (!mapContainer) return;

  if (district && district !== '-') {
    const query = encodeURIComponent(spotName ? spotName + ', ' + district : district + ', Bangladesh');
    mapContainer.innerHTML = `
      <iframe
        class="map-iframe"
        src="https://www.google.com/maps/embed/v1/place?key=${GOOGLE_MAPS_API_KEY}&q=${query}"
        width="100%"
        height="400"
        style="border:0; border-radius:16px;"
        allowfullscreen
        loading="lazy"
        referrerpolicy="no-referrer-when-downgrade">
      </iframe>
      <div class="map-info">
        <p><strong>${spotName || district}</strong> — ${district}, Bangladesh</p>
        <a href="https://www.google.com/maps?q=${query}" target="_blank" class="map-link">Open in Google Maps ↗</a>
      </div>
    `;
  } else {
    mapContainer.innerHTML = `
      <div class="map-placeholder">
        <span class="map-icon">🗺️</span>
        <p>Select a destination to view its location on the map</p>
        <p class="map-hint">Add your Google Maps API key to server/.env to enable interactive maps</p>
      </div>
    `;
  }
}

// ==== ROUTE OPTIONS FUNCTION ====
function loadRouteOptions(district) {
  const routeOptions = document.getElementById('routeOptions');
  if (!routeOptions) return;
  
  // Mock route data
  const routes = [
    {
      type: 'Bus',
      company: 'Green Line Paribahan',
      duration: '4-5 hours',
      price: '৳350-450',
      departure: 'Dhaka Gabtoli',
      arrival: `${district} Bus Stand`
    },
    {
      type: 'Train',
      company: 'Bangladesh Railway',
      duration: '5-6 hours',
      price: '৳200-300',
      departure: 'Dhaka Kamalapur',
      arrival: `${district} Railway Station`
    },
    {
      type: 'Flight',
      company: 'Novo Air',
      duration: '1 hour',
      price: '৳3000-5000',
      departure: 'Dhaka Hazrat Shahjalal',
      arrival: `${district} Airport`
    },
    {
      type: 'Private Car',
      company: 'Rent a Car BD',
      duration: '4-5 hours',
      price: '৳4000-6000',
      departure: 'Your Location',
      arrival: `${district} Destination`
    }
  ];
  
  routeOptions.innerHTML = routes.map(route => `
    <div class="route-option">
      <h5>${route.type} - ${route.company}</h5>
      <p><strong>Duration:</strong> ${route.duration}</p>
      <p><strong>Price:</strong> <span class="price">${route.price}</span></p>
      <p><strong>Departure:</strong> ${route.departure}</p>
      <p><strong>Arrival:</strong> ${route.arrival}</p>
    </div>
  `).join('');

  // External booking links
  const externalLinks = [
    { name: 'Sohoz', url: 'https://shohoz.com' },
    { name: 'GoZayan', url: 'https://gozayan.com' },
    { name: 'bdtickets', url: 'https://bdtickets.com' },
    { name: 'ShareTrip', url: 'https://sharetrip.net' },
    { name: 'Jatri', url: 'https://jatri.co' }
  ];

  const bookingSection = document.createElement('div');
  bookingSection.className = 'booking-links';
  bookingSection.innerHTML = `
    <h5>External Booking Sites</h5>
    <div class="booking-buttons">
      ${externalLinks.map(link => `
        <a href="${link.url}" target="_blank" class="button secondary booking-btn">${link.name}</a>
      `).join('')}
    </div>
  `;
  routeOptions.appendChild(bookingSection);
}

// ==== HOTEL FUNCTIONS ====
function loadHotels(district) {
  // No longer needed - replaced by booking form
}

function searchHotels() {
  const hotelType = document.getElementById('hotelType')?.value.trim() || 'Hotel';
  const city = document.getElementById('hotelCity')?.value.trim() || 'Dhaka';
  const people = parseInt(document.getElementById('hotelPeople')?.value) || 2;
  const features = document.getElementById('hotelFeatures')?.value.trim() || 'WiFi, AC';
  const checkin = document.getElementById('checkinDate')?.value;
  const checkout = document.getElementById('checkoutDate')?.value;

  if (!checkin || !checkout) {
    alert('Please select check-in and check-out dates');
    return;
  }

  const resultsDiv = document.getElementById('hotelResults');
  const listDiv = document.getElementById('hotelResultsList');
  if (resultsDiv) resultsDiv.style.display = 'block';
  if (listDiv) listDiv.innerHTML = '<p style="color:var(--muted);">Searching hotels...</p>';

  // Call backend API
  fetch(`${API_BASE}/api/hotels/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hotelType, city, people, features, checkin, checkout })
  })
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      if (listDiv) listDiv.innerHTML = `<p style="color:var(--muted);">${data.error}</p>`;
      return;
    }
    const hotels = data.hotels || [];
    const nights = data.searchParams?.nights || 1;
    if (listDiv) {
      listDiv.innerHTML = hotels.map(h => {
        const portalLinks = (h.portals || []).map(p =>
          `<a href="${p.url}" target="_blank" style="margin-right:8px; padding:4px 10px; background:rgba(255,255,255,0.07); border-radius:6px; font-size:0.85rem;">${p.name}</a>`
        ).join('');
        return `
        <div class="hotel-card">
          <h5>${h.name}</h5>
          <div class="rating">
            <span class="stars">${'★'.repeat(Math.floor(h.rating))}${'☆'.repeat(5 - Math.floor(h.rating))}</span>
            <span>${h.rating}/5</span>
          </div>
          <p><strong>Type:</strong> ${h.type}</p>
          <p><strong>Features:</strong> ${h.features.join(', ')}</p>
          <p><strong>Price/Night:</strong> <span class="price">৳${h.pricePerNight}</span></p>
          <p><strong>Total (${nights} nights + VAT + Service):</strong> <span class="price">৳${h.totalPrice}</span></p>
          <div class="hotel-actions">
            <button class="book-btn" onclick="bookHotel('${h.name}', ${h.totalPrice}, '${checkin}', '${checkout}')">Book Now</button>
            <button class="button secondary" onclick="showPriceBreakdown(${h.pricePerNight}, ${nights}, ${h.hasCorporateRate}, '${h.name}')">Price Details</button>
          </div>
          ${portalLinks ? `<div class="portal-links" style="margin-top:8px;"><small>Book via: ${portalLinks}</small></div>` : ''}
        </div>
        `;
      }).join('');
    }
  })
  .catch(err => {
    if (listDiv) listDiv.innerHTML = `<p style="color:var(--muted);">Search failed: ${err.message}</p>`;
  });
}

function generateHotelResults(type, city, people, features, nights) {
  const basePrice = people * 1500 + ((type.includes('Luxury') || type.includes('Boutique')) ? 3000 : 1000);
  const vatRate = 0.15; // 15% VAT
  const serviceRate = 0.10; // 10% service

  const hotels = [
    {
      name: `${type} ${city}`,
      type: type,
      rating: 4.5,
      features: features.split(',').map(f => f.trim()),
      pricePerNight: basePrice,
      hasCorporateRate: Math.random() > 0.5,
      hasBankDiscount: Math.random() > 0.7
    },
    {
      name: `Grand ${city} Resort`,
      type: type,
      rating: 4.2,
      features: ['WiFi', 'Pool', 'Restaurant', ...features.split(',').map(f => f.trim())],
      pricePerNight: Math.round(basePrice * 1.3),
      hasCorporateRate: true,
      hasBankDiscount: false
    },
    {
      name: `${city} Plaza`,
      type: 'Standard',
      rating: 4.0,
      features: ['WiFi', 'AC', ...features.split(',').map(f => f.trim())],
      pricePerNight: Math.round(basePrice * 0.8),
      hasCorporateRate: false,
      hasBankDiscount: true
    }
  ];

  hotels.forEach(h => {
    const vat = Math.round(h.pricePerNight * vatRate);
    const service = Math.round(h.pricePerNight * serviceRate);
    h.totalPrice = (h.pricePerNight + vat + service) * nights;
  });

  return hotels;
}

function showPriceBreakdown(pricePerNight, nights, hasCorporateRate, hotelName) {
  // Calculate using backend formula: pricePerNight already includes base, we add VAT + service
  const vat = Math.round(pricePerNight * 0.15);
  const service = Math.round(pricePerNight * 0.10);
  const subtotal = pricePerNight * nights;
  const total = (pricePerNight + vat + service) * nights;

  const calculator = document.getElementById('priceCalculator');
  const breakdown = document.getElementById('priceBreakdown');
  if (calculator) calculator.style.display = 'block';
  if (breakdown) {
    breakdown.innerHTML = `
      <div class="price-row"><span>Price per night:</span> <span>৳${pricePerNight}</span></div>
      <div class="price-row"><span>Nights:</span> <span>${nights}</span></div>
      <div class="price-row"><span>Subtotal:</span> <span>৳${subtotal}</span></div>
      <div class="price-row"><span>VAT (15%):</span> <span>৳${vat * nights}</span></div>
      <div class="price-row"><span>Service Charge (10%):</span> <span>৳${service * nights}</span></div>
      ${hasCorporateRate ? '<div class="price-row" style="color:#50d878;"><span>✓ Corporate Rate Available</span></div>' : ''}
      <div class="price-row total"><span>Total:</span> <span>৳${total}</span></div>
      ${hasCorporateRate ? '<p style="color:var(--muted); font-size:0.85rem;">Corporate rates available. Contact hotel for details.</p>' : ''}
    `;
  }
}

function resetHotelForm() {
  ['hotelType', 'hotelCity', 'hotelPeople', 'hotelFeatures', 'checkinDate', 'checkoutDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const results = document.getElementById('hotelResults');
  if (results) results.style.display = 'none';
  const calculator = document.getElementById('priceCalculator');
  if (calculator) calculator.style.display = 'none';
}

function bookHotel(hotelName, totalPrice, checkin, checkout) {
  if (!getAccessToken()) {
    showLoginModal();
    return;
  }

  const booking = {
    hotel: hotelName,
    price: totalPrice,
    checkin: checkin,
    checkout: checkout,
    date: new Date().toISOString().split('T')[0],
    status: 'Confirmed'
  };

  let bookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
  bookings.push(booking);
  localStorage.setItem('hotelBookings', JSON.stringify(bookings));

  alert(`Booking confirmed for ${hotelName}!\nTotal: ৳${totalPrice}\nCheck-in: ${checkin}\nCheck-out: ${checkout}`);
  loadHistory();
}

// ==== GUIDE FUNCTIONS ====
function loadGuides(district) {
  const guideList = document.getElementById('guideList');
  if (!guideList) return;
  
  // Mock guide data
  const guides = [
    {
      name: 'Rahman Khan',
      experience: '5 years',
      rating: 4.7,
      languages: ['Bengali', 'English', 'Hindi'],
      specialties: ['History', 'Culture', 'Photography'],
      price: 50,
    },
    {
      name: 'Amina Begum',
      experience: '3 years',
      rating: 4.5,
      languages: ['Bengali', 'English'],
      specialties: ['Nature', 'Wildlife', 'Trekking'],
      price: 40,
    },
    {
      name: 'Mohammed Ali',
      experience: '7 years',
      rating: 4.9,
      languages: ['Bengali', 'English', 'Arabic', 'Urdu'],
      specialties: ['Religious Sites', 'Architecture', 'Local History'],
      price: 60,
    }
  ];
  
  guideList.innerHTML = guides.map(guide => `
    <div class="guide-card">
      <h5>${guide.name}</h5>
      <div class="info">
        <p><strong>Experience:</strong> ${guide.experience}</p>
        <p><strong>Rating:</strong> ${'★'.repeat(Math.floor(guide.rating))} (${guide.rating}/5)</p>
        <p><strong>Languages:</strong> ${guide.languages.join(', ')}</p>
        <p><strong>Specialties:</strong> ${guide.specialties.join(', ')}</p>
        <p><strong>Rate:</strong> <span class="price">৳${guide.price * 110}/day</span></p>
      </div>
      <div class="languages">
        ${guide.languages.map(lang => `<span class="language-tag">${lang}</span>`).join('')}
      </div>
      <button class="hire-btn" onclick="hireGuide('${guide.name}', ${guide.price * 110})">Hire Guide</button>
    </div>
  `).join('');
}

function hireGuide(guideName, price) {
  if (!getAccessToken()) {
    showLoginModal();
    return;
  }

  const booking = {
    guide: guideName,
    price: price,
    date: new Date().toISOString().split('T')[0],
    status: 'Confirmed'
  };
  
  // Save to localStorage
  let bookings = JSON.parse(localStorage.getItem('guideBookings') || '[]');
  bookings.push(booking);
  localStorage.setItem('guideBookings', JSON.stringify(bookings));
  
  // Show confirmation
  alert(`Guide ${guideName} hired for ৳${price}/day!`);
  
  // Update history
  loadHistory();
}

// ==== HISTORY FUNCTIONS ====
function loadHistory() {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;
  
  // Get all bookings from localStorage
  const hotelBookings = JSON.parse(localStorage.getItem('hotelBookings') || '[]');
  const guideBookings = JSON.parse(localStorage.getItem('guideBookings') || '[]');
  
  // Combine and sort by date
  const allHistory = [
    ...hotelBookings.map(booking => ({...booking, type: 'Hotel'})),
    ...guideBookings.map(booking => ({...booking, type: 'Guide'}))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));
  
  if (allHistory.length === 0) {
    historyList.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 20px;">No booking history found.</p>';
    return;
  }
  
  historyList.innerHTML = allHistory.map(item => `
    <div class="history-item">
      <h5>${item.type} Booking - ${item.hotel || item.guide}</h5>
      <p class="date">Date: ${item.date}</p>
      <p class="details">
        <strong>Price:</strong> ৳${item.price} | 
        <strong>Status:</strong> ${item.status}
      </p>
      <button class="action" onclick="viewBookingDetails('${item.type}', '${item.hotel || item.guide}')">View Details</button>
    </div>
  `).join('');
}

function viewBookingDetails(type, name) {
  alert(`Viewing details for ${type} booking: ${name}`);
}
// ===== LOGIN / AUTH =====
function setAuthMessage(message, isError = false) {
  const messageEl = document.getElementById('authMessage');
  if (!messageEl) return;
  messageEl.style.color = isError ? '#ff6b6b' : 'var(--muted)';
  messageEl.textContent = message || '';
}

function showLoginForm() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const otpForm = document.getElementById('otpForm');
  const title = document.getElementById('authModalTitle');
  if (title) title.textContent = 'Login';
  if (loginForm) loginForm.style.display = 'block';
  if (registerForm) registerForm.style.display = 'none';
  if (otpForm) otpForm.style.display = 'none';
  setAuthMessage('');
}

function showRegisterForm() {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const otpForm = document.getElementById('otpForm');
  const title = document.getElementById('authModalTitle');
  if (title) title.textContent = 'Sign Up';
  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'block';
  if (otpForm) otpForm.style.display = 'none';
  setAuthMessage('');
}

function showOtpForm(email = '') {
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const otpForm = document.getElementById('otpForm');
  const title = document.getElementById('authModalTitle');
  const otpEmail = document.getElementById('otpEmail');
  if (title) title.textContent = 'Verify OTP';
  if (loginForm) loginForm.style.display = 'none';
  if (registerForm) registerForm.style.display = 'none';
  if (otpForm) otpForm.style.display = 'block';
  if (otpEmail && email) otpEmail.value = email;
}

function checkLogin() {
  const user = getCurrentUser();
  const isLoggedIn = !!user && !!getAccessToken();
  const loginStatus = document.getElementById('loginStatus');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const ratingForm = document.getElementById('ratingForm');
  const loginToReviewBtn = document.getElementById('loginToReviewBtn');
  const adminPanel = document.getElementById('adminPanel');

  if (isLoggedIn) {
    if (loginStatus) loginStatus.textContent = user.email || 'User';
    if (loginBtn) loginBtn.textContent = 'Logout';
    if (loginBtn) loginBtn.onclick = logout;
    if (signupBtn) signupBtn.style.display = 'none';
    if (ratingForm) ratingForm.style.display = 'block';
    if (loginToReviewBtn) loginToReviewBtn.style.display = 'none';
    if (adminPanel) adminPanel.style.display = user.role === 'admin' ? 'block' : 'none';
    if (user.role === 'admin') refreshAdminPanel();
  } else {
    if (loginStatus) loginStatus.textContent = '';
    if (loginBtn) loginBtn.textContent = 'Login';
    if (loginBtn) loginBtn.onclick = showLoginModal;
    if (signupBtn) signupBtn.style.display = 'inline-flex';
    if (ratingForm) ratingForm.style.display = 'none';
    if (loginToReviewBtn) loginToReviewBtn.style.display = 'block';
    if (adminPanel) adminPanel.style.display = 'none';
  }

  updateCheckLogin();
  renderReviews();
}

function showLoginModal() {
  showLoginForm();
  document.getElementById('loginModal').style.display = 'block';
}

function showRegisterModal() {
  showRegisterForm();
  document.getElementById('loginModal').style.display = 'block';
}

function closeLoginModal() {
  document.getElementById('loginModal').style.display = 'none';
}

async function login() {
  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;
  if (!email || !password) {
    setAuthMessage('Please enter email and password', true);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthMessage(data.error || 'Login failed', true);
      return;
    }

    setSession({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
    closeLoginModal();
    checkLogin();
  } catch (err) {
    setAuthMessage(err.message || 'Login failed', true);
  }
}

async function registerUser() {
  const name = document.getElementById('registerName').value.trim();
  const email = document.getElementById('registerEmail').value.trim().toLowerCase();
  const phone = document.getElementById('registerPhone').value.trim();
  const password = document.getElementById('registerPassword').value;

  if (!name || !email || !password) {
    setAuthMessage('Name, email and password are required', true);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthMessage(data.error || 'Registration failed', true);
      return;
    }

    localStorage.setItem(AUTH_KEYS.pendingOtpEmail, email);
    showOtpForm(email);
    setAuthMessage('OTP sent successfully. Please verify to continue.', false);
  } catch (err) {
    setAuthMessage(err.message || 'Registration failed', true);
  }
}

async function verifySignupOtp() {
  const email = document.getElementById('otpEmail').value.trim().toLowerCase();
  const otp = document.getElementById('otpCode').value.trim();

  if (!email || !otp) {
    setAuthMessage('Email and OTP are required', true);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp, purpose: 'registration' })
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthMessage(data.error || 'OTP verification failed', true);
      return;
    }

    localStorage.removeItem(AUTH_KEYS.pendingOtpEmail);
    showLoginForm();
    setAuthMessage('OTP verified. Please login.', false);
  } catch (err) {
    setAuthMessage(err.message || 'OTP verification failed', true);
  }
}

async function resendSignupOtp() {
  const emailInput = document.getElementById('otpEmail');
  const email = (emailInput?.value || localStorage.getItem(AUTH_KEYS.pendingOtpEmail) || '').trim().toLowerCase();
  if (!email) {
    setAuthMessage('Email is required for OTP resend', true);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, purpose: 'registration' })
    });
    const data = await res.json();
    if (!res.ok) {
      setAuthMessage(data.error || 'OTP resend failed', true);
      return;
    }
    setAuthMessage('OTP resent successfully.', false);
  } catch (err) {
    setAuthMessage(err.message || 'OTP resend failed', true);
  }
}

async function refreshAdminPanel() {
  const user = getCurrentUser();
  if (!user || user.role !== 'admin') return;

  const statusEl = document.getElementById('adminPanelStatus');
  const analyticsEl = document.getElementById('adminAnalytics');
  const usersEl = document.getElementById('adminUsers');
  if (statusEl) statusEl.textContent = 'Loading admin data...';

  try {
    const [analyticsRes, usersRes] = await Promise.all([
      authFetch(`${API_BASE}/api/admin/analytics`),
      authFetch(`${API_BASE}/api/admin/users`)
    ]);

    const analyticsData = await analyticsRes.json();
    const usersData = await usersRes.json();
    if (!analyticsRes.ok) throw new Error(analyticsData.error || 'Failed to load analytics');
    if (!usersRes.ok) throw new Error(usersData.error || 'Failed to load users');

    if (analyticsEl) {
      const usersCount = Number(analyticsData.users) || 0;
      const hotelBookingsCount = Number(analyticsData.hotelBookings) || 0;
      const guideBookingsCount = Number(analyticsData.guideBookings) || 0;
      const reviewCount = Number(analyticsData.reviews) || 0;
      analyticsEl.innerHTML = `
        <p><strong>Users:</strong> ${usersCount}</p>
        <p><strong>Hotel Bookings:</strong> ${hotelBookingsCount}</p>
        <p><strong>Guide Bookings:</strong> ${guideBookingsCount}</p>
        <p><strong>Reviews:</strong> ${reviewCount}</p>
      `;
    }

    if (usersEl) {
      const rows = (usersData.users || []).slice(0, 20).map((u) => `
        <tr>
          <td>${escapeHtml(u.name || '-')}</td>
          <td>${escapeHtml(u.email || '-')}</td>
          <td>${escapeHtml(u.role_name || '-')}</td>
          <td>${u.is_active ? 'Active' : 'Inactive'}</td>
          <td>${u.is_verified ? 'Verified' : 'Pending'}</td>
        </tr>
      `).join('');

      usersEl.innerHTML = `
        <div style="overflow:auto;">
          <table style="width:100%; border-collapse:collapse;">
            <thead>
              <tr>
                <th style="text-align:left; padding:6px;">Name</th>
                <th style="text-align:left; padding:6px;">Email</th>
                <th style="text-align:left; padding:6px;">Role</th>
                <th style="text-align:left; padding:6px;">Status</th>
                <th style="text-align:left; padding:6px;">Verification</th>
              </tr>
            </thead>
            <tbody>${rows || '<tr><td colspan="5" style="padding:6px;">No users found.</td></tr>'}</tbody>
          </table>
        </div>
      `;
    }

    if (statusEl) statusEl.textContent = 'Admin data loaded.';
  } catch (err) {
    if (statusEl) statusEl.textContent = `Failed to load admin data: ${err.message}`;
  }
}

async function logout() {
  try {
    const refreshToken = localStorage.getItem(AUTH_KEYS.refreshToken);
    if (refreshToken) {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
    }
  } finally {
    clearSession();
    checkLogin();
  }
}

// ===== STAR RATING =====
let selectedRating = 0;
function setupStarRating() {
  const stars = document.querySelectorAll('#starRating .star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      selectedRating = parseInt(star.dataset.value);
      stars.forEach(s => {
        s.textContent = parseInt(s.dataset.value) <= selectedRating ? '★' : '☆';
        s.classList.toggle('active', parseInt(s.dataset.value) <= selectedRating);
      });
    });
    star.addEventListener('mouseover', () => {
      const hoverVal = parseInt(star.dataset.value);
      stars.forEach(s => {
        s.textContent = parseInt(s.dataset.value) <= hoverVal ? '★' : '☆';
      });
    });
  });
  const starRating = document.getElementById('starRating');
  if (starRating) {
    starRating.addEventListener('mouseleave', () => {
      stars.forEach(s => {
        s.textContent = parseInt(s.dataset.value) <= selectedRating ? '★' : '☆';
      });
    });
  }
}

// ===== REVIEWS =====
function renderReviews() {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  if (reviews.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);">No reviews yet. Be the first to review!</p>';
    return;
  }
  container.innerHTML = reviews.map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-email">${r.email}</span>
        <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <p class="review-text">${r.text}</p>
    </div>
  `).join('');
}

function submitReview() {
  const user = getCurrentUser();
  if (!getAccessToken() || !user) {
    alert('Please login to submit a review');
    return;
  }
  const text = document.getElementById('reviewText').value.trim();
  if (!text) {
    alert('Please write a review');
    return;
  }
  if (selectedRating === 0) {
    alert('Please select a rating');
    return;
  }
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  reviews.push({
    email: user.email || 'User',
    rating: selectedRating,
    text: text,
    date: new Date().toISOString()
  });
  localStorage.setItem('reviews', JSON.stringify(reviews));
  document.getElementById('reviewText').value = '';
  selectedRating = 0;
  document.querySelectorAll('#starRating .star').forEach(s => s.textContent = '☆');
  renderReviews();
}

// Initialize auth check and star rating on page load


// ===== HOMEPAGE REVIEW =====
let homepageSelectedRating = 0;
function setupHomepageStarRating() {
  const stars = document.querySelectorAll('#homepageStarRating .star');
  stars.forEach(star => {
    star.addEventListener('click', () => {
      homepageSelectedRating = parseInt(star.dataset.value);
      stars.forEach(s => {
        s.textContent = parseInt(s.dataset.value) <= homepageSelectedRating ? '★' : '☆';
        s.classList.toggle('active', parseInt(s.dataset.value) <= homepageSelectedRating);
      });
    });
  });
}

function renderHomepageReviews() {
  const container = document.getElementById('homepageReviewContainer');
  if (!container) return;
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  if (reviews.length === 0) {
    container.innerHTML = '<p style="color:var(--muted);">No reviews yet.</p>';
    return;
  }
  container.innerHTML = reviews.slice(-3).map(r => `
    <div class="review-card">
      <div class="review-header">
        <span class="review-email">${r.email}</span>
        <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
      </div>
      <p class="review-text">${r.text}</p>
    </div>
  `).join('');
}

function submitHomepageReview() {
  const user = getCurrentUser();
  if (!getAccessToken() || !user) {
    showLoginModal();
    return;
  }
  const text = document.getElementById('homepageReviewText').value.trim();
  if (!text) { alert('Please write a review'); return; }
  if (homepageSelectedRating === 0) { alert('Please select a rating'); return; }
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  reviews.push({
    email: user.email || 'User',
    rating: homepageSelectedRating,
    text: text,
    date: new Date().toISOString()
  });
  localStorage.setItem('reviews', JSON.stringify(reviews));
  document.getElementById('homepageReviewText').value = '';
  homepageSelectedRating = 0;
  document.querySelectorAll('#homepageStarRating .star').forEach(s => s.textContent = '☆');
  renderHomepageReviews();
  renderReviews(); // update other review sections
}

// Update checkLogin to handle homepage elements
function updateCheckLogin() {
  const isLoggedIn = !!getAccessToken() && !!getCurrentUser();
  const ratingForm = document.getElementById('homepageRatingForm');
  const loginBtn = document.getElementById('homepageLoginBtn');
  if (isLoggedIn) {
    if (ratingForm) ratingForm.style.display = 'block';
    if (loginBtn) loginBtn.style.display = 'none';
  } else {
    if (ratingForm) ratingForm.style.display = 'none';
    if (loginBtn) loginBtn.style.display = 'block';
  }
  renderHomepageReviews();
}

document.addEventListener('DOMContentLoaded', () => {
  setupHomepageStarRating();
  updateCheckLogin();
  checkLogin();
  setupStarRating();
});
