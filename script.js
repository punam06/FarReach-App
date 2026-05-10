// ==== TOURIST SPOTS DATA ====
let spots = [];
let allSpots = [];

let currentCategory = 'All';
let currentSelectedSpot = null;

// Map each spot name to its corresponding image file in "spot pictures/"
const spotImages = {
  "Cox's Bazar Beach": "Coxs bazar.jpg",
  "Sundarbans": "Sundarban_Tiger.jpg",
  "Saint Martin Island": "Saint martin.jpg",
  "Rangamati": "Rangamati.jpg",
  "Bandarban": "Bandarban.jpg",
  "Sylhet Tea Gardens": "tea garden.jpg",
  "Sreemangal": "SRIMANGAL.jpg",
  "Jaflong": "Jaflang.jpg",
  "Lawachara National Park": "LAWYACHORA GARDEN.jpg",
  "Kuakata Beach": "Kuyakata.jpg",
  "Chittagong Hill Tracts": "Chittagong hill tracks.jpg",
  "Sonargaon": "Sonargaon .jpg",
  "Lalbagh Fort": "Lalbagh fort.jpg",
  "Ahsan Manzil": "ahsan-monjil.jpg",
  "Nilgiri": "Nilgiri.jpg",
  "Ramsagar National Park": "Ramsagar national park.jpg",
  "Bisnakandi": "Bishankandi-4.jpg",
  "Foy's Lake": "Foys lake.jpg",
  "Patenga Beach": "Potenga sea Beach .jpg",
  "Tajhat Palace": "Tazhat palace.jpg"
};

// Use same-origin when served by backend; fallback to localhost:3000 for static servers.
const API_BASE = (location.port && location.port !== '3000') ? 'http://localhost:3000' : '';

const divisionDistrictMap = {
  Dhaka: ['Dhaka', 'Narayanganj', 'Gazipur', 'Manikganj', 'Munshiganj', 'Narsingdi', 'Sonargaon'],
  Chattogram: ['Chittagong', "Cox's Bazar", 'Rangamati', 'Bandarban', 'Khagrachhari', 'Comilla', 'Feni', 'Noakhali'],
  Sylhet: ['Sylhet', 'Moulvibazar', 'Habiganj', 'Sunamganj'],
  Rangpur: ['Rangpur', 'Dinajpur', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Gaibandha', 'Thakurgaon', 'Panchagarh'],
  Barishal: ['Barishal', 'Patuakhali', 'Barguna', 'Jhalokati', 'Pirojpur', 'Bhola'],
  Jessore: ['Jessore', 'Khulna', 'Satkhira', 'Bagerhat', 'Narail', 'Magura', 'Jhenaidah', 'Chuadanga', 'Kushtia', 'Meherpur'],
  Rajshahi: ['Rajshahi', 'Natore', 'Naogaon', 'Chapainawabganj', 'Pabna', 'Bogra', 'Joypurhat', 'Sirajganj'],
  Mymensingh: ['Mymensingh', 'Jamalpur', 'Sherpur', 'Netrokona', 'Kishoreganj', 'Tangail']
};

const districtToDivision = Object.entries(divisionDistrictMap).reduce((lookup, [division, districts]) => {
  districts.forEach(district => {
    lookup[district.toLowerCase()] = division;
  });
  return lookup;
}, {});

const spotFilterProfiles = {
  Beach: { budget: 'high', road: 'easy', opportunity: 'leisure' },
  Wildlife: { budget: 'low', road: 'moderate', opportunity: 'wildlife' },
  Island: { budget: 'high', road: 'moderate', opportunity: 'leisure' },
  Mountain: { budget: 'high', road: 'challenging', opportunity: 'adventure' },
  Nature: { budget: 'low', road: 'easy', opportunity: 'eco' },
  Historical: { budget: 'low', road: 'easy', opportunity: 'culture' },
  Lake: { budget: 'low', road: 'easy', opportunity: 'family' }
};

const spotFilterOverrides = {
  Sundarbans: { road: 'moderate', opportunity: 'wildlife' },
  'Saint Martin Island': { road: 'moderate', opportunity: 'leisure' },
  Nilgiri: { budget: 'high', road: 'challenging', opportunity: 'adventure' },
  Bandraban: { budget: 'high', road: 'challenging', opportunity: 'adventure' },
  'Chittagong Hill Tracts': { budget: 'high', road: 'challenging', opportunity: 'adventure' }
};

const budgetRates = {
  transport: { bus: 900, train: 1200, launch: 750, air: 6500 },
  hotel: { budget: 1800, standard: 3500, premium: 7000 },
  guide: { budget: 2800, standard: 4200, premium: 6500 },
  activity: { leisure: 1200, culture: 1000, adventure: 1800, eco: 1100, wildlife: 1500, family: 900 }
};

// ==== DIVISION SECTION ====

// List of 8 divisions as requested
const divisions = ['Dhaka', 'Chattogram', 'Sylhet', 'Rangpur', 'Barishal', 'Jessore', 'Rajshahi', 'Mymensingh'];

let currentDivision = 'All';
let currentBudgetFilter = 'All';
let currentRoadFilter = 'All';
let currentOpportunityFilter = 'All';

function renderDivisionCards() {
  const grid = document.getElementById('divisionGrid');
  if (!grid) return;
  grid.innerHTML = '';
  divisions.forEach(div => {
    const spotCount = getSpotsForDivision(div).length;
    const card = document.createElement('article');
    card.className = 'division-card';
    card.innerHTML = `
      <h3>${div}</h3>
      <p>${spotCount} destination${spotCount !== 1 ? 's' : ''}</p>
    `;
    card.style.cursor = 'pointer';
    card.onclick = () => {
      focusDivision(div);
    };
    grid.appendChild(card);
  });
}

function getSpotDivision(spot) {
  return districtToDivision[spot.district.toLowerCase()] || 'All';
}

function getSpotFilterProfile(spot) {
  const baseProfile = spotFilterProfiles[spot.category] || { budget: 'low', road: 'easy', opportunity: 'leisure' };
  return { ...baseProfile, ...(spotFilterOverrides[spot.name] || {}) };
}

function getSpotsForDivision(divisionName) {
  return allSpots.filter(spot => getSpotDivision(spot) === divisionName);
}

function focusDivision(divisionName) {
  currentDivision = divisionName;
  currentCategory = 'All';
  currentBudgetFilter = 'All';
  currentRoadFilter = 'All';
  currentOpportunityFilter = 'All';

  const searchInput = document.getElementById('search');
  const divisionSearch = document.getElementById('districtSearch');
  const budgetFilter = document.getElementById('budgetFilter');
  const roadFilter = document.getElementById('roadFilter');
  const opportunityFilter = document.getElementById('opportunityFilter');
  if (searchInput) searchInput.value = '';
  if (divisionSearch) divisionSearch.value = divisionName;
  if (budgetFilter) budgetFilter.value = 'All';
  if (roadFilter) roadFilter.value = 'All';
  if (opportunityFilter) opportunityFilter.value = 'All';

  const firstSpot = getSpotsForDivision(divisionName)[0];
  render();
  if (firstSpot) selectSpot(firstSpot);

  const routeSection = document.getElementById('route');
  if (routeSection) {
    routeSection.scrollIntoView({ behavior: 'smooth' });
  }
}

function searchDivisions() {
  const searchInput = document.getElementById('districtSearch');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const grid = document.getElementById('divisionGrid');
  if (!grid) return;
  const filtered = divisions.filter(d => !query || d.toLowerCase().includes(query));
  grid.innerHTML = '';
  filtered.forEach(div => {
    const card = document.createElement('article');
    card.className = 'division-card';
    card.innerHTML = `<h3>${div}</h3><p>${getSpotsForDivision(div).length} destination${getSpotsForDivision(div).length !== 1 ? 's' : ''}</p>`;
    card.style.cursor = 'pointer';
    card.onclick = () => focusDivision(div);
    grid.appendChild(card);
  });
  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No divisions found matching your search.</p>';
  }
}

// ==== DISTRICT FUNCTIONS (kept for backward compatibility) ====
function renderDistrictCards() {
  // Original district rendering retained for compatibility; not used in UI.
  const grid = document.getElementById('districtGrid');
  if (!grid) return;
  const districtNames = Object.keys(window.districtData || {});
  grid.innerHTML = '';
  districtNames.forEach(district => {
    const districtSpots = window.districtData[district];
    const card = document.createElement('article');
    card.className = 'district-card';
    card.innerHTML = `
      <div class="district-card-header">
        <h3>${district}</h3>
        <span class="spot-count">${districtSpots.length} spot${districtSpots.length !== 1 ? 's' : ''}</span>
      </div>
      <p class="district-categories">${[...new Set(districtSpots.map(s => s.category))].join(', ')}</p>
    `;
    card.style.cursor = 'pointer';
    card.onclick = () => {
      const searchInput = document.getElementById('search');
      if (searchInput) {
        searchInput.value = district;
        render();
      }
      document.getElementById('discover').scrollIntoView({ behavior: 'smooth' });
    };
    grid.appendChild(card);
  });
}

function searchDistricts() {
  const searchInput = document.getElementById('districtSearch');
  const query = (searchInput?.value || '').toLowerCase().trim();
  const grid = document.getElementById('districtGrid');
  if (!grid) return;
  const districtNames = Object.keys(window.districtData || {});
  const filtered = districtNames.filter(d => {
    if (!query) return true;
    const districtSpots = window.districtData[d];
    return d.toLowerCase().includes(query) || districtSpots.some(s => s.name.toLowerCase().includes(query));
  });
  grid.innerHTML = '';
  filtered.forEach(district => {
    const districtSpots = window.districtData[district];
    const card = document.createElement('article');
    card.className = 'district-card';
    card.innerHTML = `
      <div class="district-card-header">
        <h3>${district}</h3>
        <span class="spot-count">${districtSpots.length} spot${districtSpots.length !== 1 ? 's' : ''}</span>
      </div>
      <p class="district-categories">${[...new Set(districtSpots.map(s => s.category))].join(', ')}</p>
    `;
    card.style.cursor = 'pointer';
    card.onclick = () => {
      const mainSearch = document.getElementById('search');
      if (mainSearch) {
        mainSearch.value = district;
        render();
      }
      document.getElementById('discover').scrollIntoView({ behavior: 'smooth' });
    };
    grid.appendChild(card);
  });
  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">No districts found matching your search.</p>';
  }
}

// ==== WEATHER FUNCTIONS ====

async function fetchWeatherFor(district) {
  const card = document.getElementById('weatherCard');
  const iconEl = document.getElementById('heroWeatherIcon');
  const tempEl = document.getElementById('heroWeatherTemp');
  const descEl = document.getElementById('heroWeatherDesc');
  const sugEl = document.getElementById('heroWeatherSuggestion');

  if (!card || !tempEl || !descEl || !sugEl || !iconEl) return;

  // Show card and loading placeholders
  card.style.display = 'block';
  tempEl.textContent = '...';
  descEl.textContent = 'Loading...';
  sugEl.textContent = '';

  try {
    const url = `${API_BASE}/api/weather?district=${encodeURIComponent(district)}`;
    const res = await fetch(url);
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
    // Fallback to dummy data when server is unreachable or returns error
    console.warn('Weather fetch failed, using fallback data:', err.message);
    const fallback = {
      main: { temp: 27 },
      weather: [{ main: 'Clear', description: 'clear sky' }]
    };
    const temp = Math.round(fallback.main.temp);
    const desc = fallback.weather[0].description;
    const main = fallback.weather[0].main;
    tempEl.textContent = `${temp}°C`;
    descEl.textContent = desc.charAt(0).toUpperCase() + desc.slice(1);
    iconEl.textContent = chooseIcon(main, desc);
    sugEl.textContent = travelSuggestion(main.toLowerCase(), temp) + ' (fallback)';
  }
}

async function fetchForecastForDate(district, dateVal) {
  const now = new Date();
  const maxDate = new Date(now.getTime() + 5 * 86400000);
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

  tempEl.textContent = '...';
  descEl.textContent = 'Loading forecast...';
  sugEl.textContent = '';

  try {
    const url = `${API_BASE}/api/forecast?district=${encodeURIComponent(district)}&date=${encodeURIComponent(dateVal)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Forecast lookup failed');
    const result = await res.json();

    const data = result.data || result;

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
    fetchCurrentWeatherForTab(district);
  }
}

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

// ==== RENDER FUNCTION ====
function render() {
  const searchInput = document.getElementById('search');
  const query = (searchInput?.value || '').toLowerCase().trim();
  currentBudgetFilter = document.getElementById('budgetFilter')?.value || currentBudgetFilter;
  currentRoadFilter = document.getElementById('roadFilter')?.value || currentRoadFilter;
  currentOpportunityFilter = document.getElementById('opportunityFilter')?.value || currentOpportunityFilter;
  
  let filtered = allSpots;
  filtered = filtered.filter(spot => {
    const division = getSpotDivision(spot);
    const profile = getSpotFilterProfile(spot);

    if (query) {
      const searchable = [spot.name, spot.district, spot.category, division, profile.opportunity].join(' ').toLowerCase();
      if (!searchable.includes(query)) return false;
    }

    if (currentDivision !== 'All' && division !== currentDivision) return false;
    if (currentCategory !== 'All' && spot.category !== currentCategory) return false;
    if (currentBudgetFilter !== 'All' && profile.budget !== currentBudgetFilter) return false;
    if (currentRoadFilter !== 'All' && profile.road !== currentRoadFilter) return false;
    if (currentOpportunityFilter !== 'All' && profile.opportunity !== currentOpportunityFilter) return false;
    return true;
  });
  
  updateStats();
  displayPopularGrid(filtered);
  
  if (filtered.length > 0) {
    const randomIndex = Math.floor(Math.random() * filtered.length);
    displayFeatured(filtered[randomIndex]);
  }
  
  updateSearchHint(filtered.length, query);
}

function updateStats() {
  document.getElementById('totalPlaces').textContent = allSpots.length + '+';
  const districts = new Set(allSpots.map(s => s.district));
  document.getElementById('totalDistricts').textContent = districts.size + '+';
  const filterSummary = [];
  if (currentDivision !== 'All') filterSummary.push(currentDivision);
  if (currentCategory !== 'All') filterSummary.push(currentCategory);
  if (currentBudgetFilter !== 'All') filterSummary.push(currentBudgetFilter === 'low' ? 'Low Budget' : 'High Budget');
  if (currentRoadFilter !== 'All') filterSummary.push(currentRoadFilter);
  if (currentOpportunityFilter !== 'All') filterSummary.push(currentOpportunityFilter);
  document.getElementById('activeCategory').textContent = filterSummary.length ? filterSummary.join(' • ') : 'All';
}

function displayPopularGrid(filteredSpots) {
  const grid = document.getElementById('popularGrid');
  if (!grid) return;
  
  grid.innerHTML = '';
  
  filteredSpots.slice(0, 20).forEach(spot => {
    const profile = getSpotFilterProfile(spot);
    const card = document.createElement('article');
    card.className = 'spot-card';
    card.innerHTML = `
      <div class="spot-image" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; height: 200px; color: white; font-size: 48px;">
        <img src="spot-pictures/${spotImages[spot.name]}" style="width:100%;height:200px;object-fit:cover;">
      </div>
      <div class="spot-content">
        <h3>${spot.name}</h3>
        <p class="spot-district">${spot.district}</p>
        <div class="spot-badges">
          <span class="spot-category">${spot.category}</span>
          <span class="spot-budget">${profile.budget === 'high' ? 'High Budget' : 'Low Budget'}</span>
        </div>
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

  const featuredCard = document.getElementById('featuredCard');
  if (featuredCard) {
    const imageFile = spotImages[spot.name];
    if (imageFile) {
      const imageUrl = `spot-pictures/${encodeURIComponent(imageFile)}`;
      featuredCard.style.background = `linear-gradient(180deg, rgba(3, 12, 7, 0.28), rgba(3, 12, 7, 0.82)), url("${imageUrl}") center / cover no-repeat`;
    } else {
      featuredCard.style.background = 'linear-gradient(135deg, rgba(70, 201, 109, 0.25), rgba(6, 17, 11, 0.9))';
    }
  }

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
  
  const historyElement = document.getElementById('resultHistory');
  if (historyElement && spot.history) {
    historyElement.innerHTML = `
      <h4>Historical Background</h4>
      <p>${spot.history}</p>
    `;
    historyElement.style.display = 'block';
  }
  
  const visual = document.getElementById('resultVisual');
  if (visual) {
    visual.style.background = `linear-gradient(135deg, ${getCategoryColor(spot.category)} 0%, ${getCategoryColor2(spot.category)} 100%)`;
    visual.style.display = 'flex';
    visual.style.alignItems = 'center';
    visual.style.justifyContent = 'center';
    visual.style.fontSize = '80px';
    visual.style.minHeight = '300px';
    visual.innerHTML = '<img src="spot-pictures/' + spotImages[spot.name] + '" style="width:100%;height:100%;object-fit:cover;">';
  }

  updateBudgetSection(spot);
  
  fetchWeatherFor(spot.district);

  const weatherTab = document.getElementById('weather-tab');
  if (weatherTab && weatherTab.classList.contains('active')) {
    fetchCurrentWeatherForTab(spot.district);
  }

  const mapTab = document.getElementById('map-tab');
  if (mapTab && mapTab.classList.contains('active')) {
    loadMap(spot.district, spot.name);
  }
}

function calculateBudgetLocally(spot, inputs) {
  const profile = getSpotFilterProfile(spot);
  const travelers = Math.max(1, Number(inputs.travelers) || 1);
  const nights = Math.max(1, Number(inputs.nights) || 1);
  const guideDays = Math.max(0, Number(inputs.guideDays) || 0);
  const transportRate = budgetRates.transport[inputs.transportMode] || budgetRates.transport.bus;
  const hotelRate = budgetRates.hotel[inputs.hotelTier] || budgetRates.hotel.standard;
  const guideRate = budgetRates.guide[inputs.hotelTier] || budgetRates.guide.standard;
  const activityRate = budgetRates.activity[profile.opportunity] || budgetRates.activity.leisure;

  const tripTickets = Math.round(transportRate * travelers * (profile.budget === 'high' ? 1.2 : 1));
  const hotelBooking = Math.round(hotelRate * nights * travelers * (profile.budget === 'high' ? 1.15 : 1));
  const guideBooking = Math.round(guideRate * guideDays);
  const localActivity = Math.round(activityRate * travelers);
  const contingency = Math.round((tripTickets + hotelBooking + guideBooking + localActivity) * 0.1);
  const total = tripTickets + hotelBooking + guideBooking + localActivity + contingency;

  return {
    spot: spot.name,
    district: spot.district,
    travelers,
    nights,
    guideDays,
    breakdown: {
      tripTickets,
      hotelBooking,
      guideBooking,
      localActivity,
      contingency
    },
    total,
    currency: 'BDT'
  };
}

function renderBudgetResult(result) {
  const container = document.getElementById('budgetResult');
  if (!container || !result) return;
  container.innerHTML = `
    <div class="budget-total">৳${result.total.toLocaleString()} <span>${result.currency}</span></div>
    <div class="budget-breakdown">
      <div><strong>Travel tickets</strong><span>৳${result.breakdown.tripTickets.toLocaleString()}</span></div>
      <div><strong>Hotel booking</strong><span>৳${result.breakdown.hotelBooking.toLocaleString()}</span></div>
      <div><strong>Food & Misc</strong><span>৳${result.breakdown.foodTotal.toLocaleString()}</span></div>
      <div><strong>Guide booking</strong><span>৳${result.breakdown.guideBooking.toLocaleString()}</span></div>
      <div><strong>Local activities</strong><span>৳${result.breakdown.localActivity.toLocaleString()}</span></div>
      <div><strong>Contingency</strong><span>৳${result.breakdown.contingency.toLocaleString()}</span></div>
    </div>
  `;
}

async function calculateBudget() {
  const spot = currentSelectedSpot || allSpots[0];
  if (!spot) return;

  const payload = {
    travelers: Number(document.getElementById('budgetTravelers')?.value || 1),
    nights: Number(document.getElementById('budgetNights')?.value || 1),
    guideDays: Number(document.getElementById('budgetGuideDays')?.value || 0),
    transportMode: document.getElementById('budgetTransport')?.value || 'bus',
    hotelTier: document.getElementById('budgetHotelTier')?.value || 'standard'
  };

  try {
    const response = await fetch(`${API_BASE}/api/spots/${spot.id}/budget-estimate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Budget service unavailable');
    const data = await response.json();
    renderBudgetResult(data.estimate);
  } catch (err) {
    renderBudgetResult(calculateBudgetLocally(spot, payload));
  }
}

function updateBudgetSection(spot) {
  const badge = document.getElementById('budgetBadge');
  const result = document.getElementById('budgetResult');
  if (badge) {
    const profile = getSpotFilterProfile(spot);
    badge.textContent = `${profile.budget === 'high' ? 'Premium' : 'Budget'} plan`;
  }
  if (result) {
    result.textContent = 'Calculating estimate...';
  }
  calculateBudget();
}

function getCategoryEmoji(category) {
  const emojis = {
    'Beach': '🏖️', 'Wildlife': '🦁', 'Island': '🏝️',
    'Mountain': '⛰️', 'Nature': '🌲', 'Historical': '🏛️', 'Lake': '🏞️'
  };
  return emojis[category] || '📍';
}

function getCategoryColor(category) {
  const colors = {
    'Beach': '#FF6B6B', 'Wildlife': '#4ECDC4', 'Island': '#45B7D1',
    'Mountain': '#96CEB4', 'Nature': '#FFEAA7', 'Historical': '#DDA0DD', 'Lake': '#87CEEB'
  };
  return colors[category] || '#667eea';
}

function getCategoryColor2(category) {
  const colors = {
    'Beach': '#FF8E72', 'Wildlife': '#44A08D', 'Island': '#2E8B9E',
    'Mountain': '#6FA876', 'Nature': '#FFD93D', 'Historical': '#DA70D6', 'Lake': '#6BA3C0'
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

async function initializePage() {
  checkLogin();
  updateCheckLogin();

  try {
    const res = await fetch(`${API_BASE}/api/spots`);
    if (res.ok) {
      const data = await res.json();
      if (data.spots && data.spots.length > 0) {
        spots = data.spots.map(s => ({
          ...s,
          district: s.district_name || 'Unknown',
          division: s.division_name || 'Unknown',
        }));
        allSpots = [...spots];
      }
    }
  } catch (e) {
    console.error('Failed to fetch spots from DB', e);
  }

  // Initialize district data structures
  window.districtData = {};
  spots.forEach(s => {
    if (!window.districtData[s.district]) window.districtData[s.district] = [];
    window.districtData[s.district].push(s);
  });
  // Render district cards
  renderDivisionCards();

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
  const tabPanes = document.querySelectorAll('.tab-pane');
  tabPanes.forEach(pane => pane.classList.remove('active'));
  
  const tabButtons = document.querySelectorAll('.tab-button');
  tabButtons.forEach(button => button.classList.remove('active'));
  
  const selectedTab = document.getElementById(`${tabName}-tab`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }
  
  if (btnElement) {
    btnElement.classList.add('active');
  }
  
  initializeTabContent(tabName);
}

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

let appConfigCache = null;
async function fetchAppConfig() {
  if (appConfigCache) return appConfigCache;
  try {
    const res = await fetch(`${API_BASE}/api/config`);
    if (res.ok) {
      appConfigCache = await res.json();
      return appConfigCache;
    }
  } catch (e) {
    console.error('Failed to fetch config:', e);
  }
  return { googleMapsApiKey: 'AIzaSyA06LZtXWwqLA9GsLjxYFxD9tF0DijV7AU' };
}

// ==== MAP FUNCTION ====
async function loadMap(district, spotName) {
  const config = await fetchAppConfig();
  const GOOGLE_MAPS_API_KEY = config.googleMapsApiKey || 'AIzaSyA06LZtXWwqLA9GsLjxYFxD9tF0DijV7AU';
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
  
  const routes = [
    { type: 'Bus', company: 'Green Line Paribahan', duration: '4-5 hours', price: '৳350-450', departure: 'Dhaka Gabtoli', arrival: `${district} Bus Stand` },
    { type: 'Train', company: 'Bangladesh Railway', duration: '5-6 hours', price: '৳200-300', departure: 'Dhaka Kamalapur', arrival: `${district} Railway Station` },
    { type: 'Flight', company: 'Novo Air', duration: '1 hour', price: '৳3000-5000', departure: 'Dhaka Hazrat Shahjalal', arrival: `${district} Airport` },
    { type: 'Private Car', company: 'Rent a Car BD', duration: '4-5 hours', price: '৳4000-6000', departure: 'Your Location', arrival: `${district} Destination` }
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
  const vatRate = 0.15;
  const serviceRate = 0.10;

  const hotels = [
    { name: `${type} ${city}`, type, rating: 4.5, features: features.split(',').map(f => f.trim()), pricePerNight: basePrice, hasCorporateRate: Math.random() > 0.5, hasBankDiscount: Math.random() > 0.7 },
    { name: `Grand ${city} Resort`, type, rating: 4.2, features: ['WiFi', 'Pool', 'Restaurant', ...features.split(',').map(f => f.trim())], pricePerNight: Math.round(basePrice * 1.3), hasCorporateRate: true, hasBankDiscount: false },
    { name: `${city} Plaza`, type: 'Standard', rating: 4.0, features: ['WiFi', 'AC', ...features.split(',').map(f => f.trim())], pricePerNight: Math.round(basePrice * 0.8), hasCorporateRate: false, hasBankDiscount: true }
  ];

  hotels.forEach(h => {
    const vat = Math.round(h.pricePerNight * vatRate);
    const service = Math.round(h.pricePerNight * serviceRate);
    h.totalPrice = (h.pricePerNight + vat + service) * nights;
  });

  return hotels;
}

function showPriceBreakdown(pricePerNight, nights, hasCorporateRate, hotelName) {
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

async function bookHotel(hotelName, totalPrice, checkin, checkout) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!token || !user) {
    showLoginModal();
    return;
  }

  if (!user.phone || !user.address) {
    alert("Please complete your profile (add Phone and Address) before making a booking.");
    window.location.href = 'user-dashboard.html#profile';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/user/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'hotel',
        target_name: hotelName,
        price: totalPrice,
        booking_date: checkin
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert(`Booking confirmed for ${hotelName}!\nTotal: ৳${totalPrice}\nCheck-in: ${checkin}\nCheck-out: ${checkout}`);
      loadHistory();
    } else {
      alert(data.error || 'Booking failed');
    }
  } catch (err) {
    alert('Connection error');
  }
}

// ==== GUIDE FUNCTIONS ====
function loadGuides(district) {
  const guideList = document.getElementById('guideList');
  if (!guideList) return;
  
  const guides = [
    { name: 'Rahman Khan', experience: '5 years', rating: 4.7, languages: ['Bengali', 'English', 'Hindi'], specialties: ['History', 'Culture', 'Photography'], price: 50 },
    { name: 'Amina Begum', experience: '3 years', rating: 4.5, languages: ['Bengali', 'English'], specialties: ['Nature', 'Wildlife', 'Trekking'], price: 40 },
    { name: 'Mohammed Ali', experience: '7 years', rating: 4.9, languages: ['Bengali', 'English', 'Arabic', 'Urdu'], specialties: ['Religious Sites', 'Architecture', 'Local History'], price: 60 }
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

async function hireGuide(guideName, price) {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  if (!token || !user) {
    showLoginModal();
    return;
  }

  if (!user.phone || !user.address) {
    alert("Please complete your profile (add Phone and Address) before hiring a guide.");
    window.location.href = 'user-dashboard.html#profile';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/user/bookings`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        type: 'guide',
        target_name: guideName,
        price: price,
        booking_date: new Date().toISOString().split('T')[0]
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert(`Guide ${guideName} hired for ৳${price}/day!`);
      loadHistory();
    } else {
      alert(data.error || 'Booking failed');
    }
  } catch (err) {
    alert('Connection error');
  }
}

// ==== HISTORY FUNCTIONS ====
async function loadHistory() {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;
  
  const token = localStorage.getItem('token');
  if (!token) {
    historyList.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 20px;">Please login to see your booking history.</p>';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/user/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      if (data.bookings.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--muted); padding: 20px;">No booking history found.</p>';
        return;
      }
      
      historyList.innerHTML = data.bookings.map(item => `
        <div class="history-item">
          <h5>${item.type.charAt(0).toUpperCase() + item.type.slice(1)} Booking - ${item.target_name}</h5>
          <p class="date">Date: ${item.booking_date ? new Date(item.booking_date).toLocaleDateString() : new Date(item.created_at).toLocaleDateString()}</p>
          <p class="details">
            <strong>Price:</strong> ৳${item.price} | 
            <strong>Status:</strong> ${item.status.toUpperCase()}
          </p>
          <button class="action" onclick="viewBookingDetails('${item.type}', '${item.target_name}')">View Details</button>
        </div>
      `).join('');
    }
  } catch (err) {
    historyList.innerHTML = '<p style="text-align: center; color: var(--danger); padding: 20px;">Failed to load history.</p>';
  }
}

function viewBookingDetails(type, name) {
  alert(`Viewing details for ${type} booking: ${name}`);
}

// ===== LOGIN / AUTH =====
function checkLogin() {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  const loginStatus = document.getElementById('loginStatus');
  const loginBtn = document.getElementById('loginBtn');
  const signupBtn = document.getElementById('signupBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  const dashboardLink = document.getElementById('dashboardLink');

  if (token && userStr) {
    let user;
    try { user = JSON.parse(userStr); } catch(e) { user = {}; }

    if (loginStatus) loginStatus.textContent = 'Hi, ' + (user.name || user.email || 'User');
    if (loginBtn) loginBtn.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';

    if (dashboardLink) {
      dashboardLink.style.display = 'inline-block';
      if (user.role === 'admin') {
        dashboardLink.href = 'admin-dashboard.html';
        dashboardLink.innerHTML = '<i class="fas fa-tachometer-alt"></i> Admin Panel';
      } else {
        dashboardLink.href = 'user-dashboard.html';
        dashboardLink.innerHTML = '<i class="fas fa-tachometer-alt"></i> Dashboard';
      }
    }
  } else {
    if (loginStatus) loginStatus.textContent = '';
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (signupBtn) signupBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (dashboardLink) dashboardLink.style.display = 'none';
  }
  renderReviews();
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  checkLogin();
}

function logoutUser() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  checkLogin();
  window.location.reload();
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
async function renderReviews() {
  const container = document.getElementById('reviewsContainer');
  if (!container) return;
  if (!currentSelectedSpot) return;

  try {
    const res = await fetch(`${API_BASE}/api/reviews/public`);
    if (res.ok) {
      const data = await res.json();
      const spotReviews = data.reviews.filter(r => r.spot_id === currentSelectedSpot.id);
      
      if (spotReviews.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);">No reviews yet. Be the first!</p>';
        return;
      }
      container.innerHTML = spotReviews.map(r => `
        <div class="review-card">
          <div class="review-header">
            <span class="review-email">${r.user_name || 'User'}</span>
            <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          </div>
          <p class="review-text">${r.text}</p>
        </div>
      `).join('');
    }
  } catch (e) {
    container.innerHTML = '<p style="color:var(--muted);">Could not load reviews.</p>';
  }
}

async function submitReview() {
  const token = localStorage.getItem('token');
  if (!token) {
    showLoginModal();
    return;
  }
  const text = document.getElementById('reviewText').value.trim();
  if (!text) { alert('Please write a review'); return; }
  if (selectedRating === 0) { alert('Please select a rating'); return; }
  
  if (!currentSelectedSpot || !currentSelectedSpot.id) {
    alert('Cannot find spot details.');
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/api/user/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        spot_id: currentSelectedSpot.id,
        rating: selectedRating,
        text: text
      })
    });
    if (res.ok) {
      document.getElementById('reviewText').value = '';
      selectedRating = 0;
      document.querySelectorAll('#starRating .star').forEach(s => s.textContent = '☆');
      renderReviews();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to submit review');
    }
  } catch (err) {
    alert('Network error');
  }
}

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

async function renderHomepageReviews() {
  const container = document.getElementById('homepageReviewContainer');
  if (!container) return;
  
  try {
    const res = await fetch(`${API_BASE}/api/reviews/public`);
    if (res.ok) {
      const data = await res.json();
      const generalReviews = data.reviews.filter(r => r.spot_id === null);
      if (generalReviews.length === 0) {
        container.innerHTML = '<p style="color:var(--muted);">No reviews yet.</p>';
        return;
      }
      container.innerHTML = generalReviews.slice(0, 5).map(r => `
        <div class="review-card">
          <div class="review-header">
            <span class="review-email">${r.user_name || 'User'}</span>
            <span class="review-stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
          </div>
          <p class="review-text">${r.text}</p>
        </div>
      `).join('');
    }
  } catch (e) {
    container.innerHTML = '<p style="color:var(--muted);">Could not load reviews.</p>';
  }
}

async function submitHomepageReview() {
  const token = localStorage.getItem('token');
  if (!token) {
    showLoginModal();
    return;
  }
  const text = document.getElementById('homepageReviewText').value.trim();
  if (!text) { alert('Please write a review'); return; }
  if (homepageSelectedRating === 0) { alert('Please select a rating'); return; }
  
  try {
    const res = await fetch(`${API_BASE}/api/user/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        spot_id: null, // null for general platform reviews
        rating: homepageSelectedRating,
        text: text
      })
    });
    if (res.ok) {
      document.getElementById('homepageReviewText').value = '';
      homepageSelectedRating = 0;
      document.querySelectorAll('#homepageStarRating .star').forEach(s => s.textContent = '☆');
      renderHomepageReviews();
    } else {
      const data = await res.json();
      alert(data.error || 'Failed to submit review');
    }
  } catch (err) {
    alert('Network error');
  }
}

function updateCheckLogin() {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const note = document.getElementById('homepageReviewNote');
  if (isLoggedIn) {
    const email = localStorage.getItem('userEmail') || 'User';
    if (note) note.textContent = `Signed in as ${email}. Submit to publish your review.`;
  } else {
    if (note) note.textContent = 'You can draft your review here. Sign in to publish it.';
  }
  renderHomepageReviews();
}

// Initialize auth check and star rating on page load
document.addEventListener('DOMContentLoaded', () => {
  checkLogin();
  setupStarRating();
  setupHomepageStarRating();
  updateCheckLogin();
});