// destination.js - Handles the destination detail page


let currentReviewRating = 0;
window.onGoogleMapsApiLoaded = () => {
  const destIndex = getDestinationFromURL();
  const district = spots[destIndex]?.[1];
  if (district) {
    displayDestinationDetailMap(district);
  }
};

let siteContentCache = null;

// Get destination index from URL parameter
function getDestinationFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

// Initialize destination page
async function initDestinationPage() {
  await loadSiteContent();
  const destIndex = getDestinationFromURL();
  
  if (!destIndex || destIndex < 0 || destIndex >= spots.length) {
    showError('Destination not found. Redirecting to home...');
    setTimeout(() => window.location.href = 'index.html', 2000);
    return;
  }

  const place = spots[destIndex];
  const [name, district, category] = place;

  // Display hero section
  displayDestinationHero(place, destIndex);

  // Display all sections
  displayDestinationCurrentWeather(district);
  displayDestinationForecastCalendar(district);
  displayDestinationDetailMap(district);
  displayDestinationGuide(place);
  displayHotels(district);
  displayRelatedDestinations(district, destIndex);
  updateBookingLinks(name, district);
  initReviewSection();
  initBudgetCalculator(category);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function loadSiteContent() {
  if (siteContentCache) return siteContentCache;
  try {
    const response = await fetch('/api/site-content');
    const data = await response.json().catch(() => ({}));
    if (response.ok && data?.content) {
      siteContentCache = data.content;
      return siteContentCache;
    }
  } catch (error) {
    // ignore and use fallback content
  }
  siteContentCache = {
    travelGuide: '',
    budgets: {},
  };
  return siteContentCache;
}

function updateBookingLinks(name, district) {
  const hotelBtn = document.getElementById('bookHotelsBtn');
  if (hotelBtn) {
    hotelBtn.href = `https://hotel.com.bd/search?q=${encodeURIComponent(district)}`;
  }
  
  const transportBtn = document.getElementById('bookTransportBtn');
  if (transportBtn) {
    transportBtn.href = `https://www.shohoz.com/bus-tickets?tocity=${encodeURIComponent(district)}`;
  }
}

function displayDestinationHero(place, index) {
  const [name, district, category] = place;
  const gradient = getSpotGradient(place);

  document.getElementById('destHeroName').textContent = name;
  document.getElementById('destHeroDistrict').textContent = `District: ${district}`;
  document.getElementById('destHeroBadge').textContent = cats[category];
  document.getElementById('destHeroIndex').textContent = `#${index + 1}`;
  document.getElementById('destHeroCategory').textContent = cats[category];
  document.getElementById('destHeroVisual').style.backgroundImage = gradient;
  document.getElementById('destHeroDescription').textContent = 
    `${name} is a ${cats[category].toLowerCase()} destination in ${district}. This is one of ${spots.length}+ amazing places across Bangladesh.`;
}

async function displayDestinationCurrentWeather(district) {
  const iconEl = document.getElementById('destCurrentIcon');
  const tempEl = document.getElementById('destCurrentTemp');
  const descEl = document.getElementById('destCurrentDesc');
  const sugEl = document.getElementById('destCurrentSuggestion');

  if (!tempEl || !descEl || !sugEl || !iconEl) return;

  tempEl.textContent = 'Loading...';
  descEl.textContent = district;
  sugEl.textContent = 'Fetching weather...';

  try {
    const weather = await fetchOpenWeatherCurrent(district);
    const temp = weather.temp;
    const desc = weather.description;
    const main = weather.main;

    tempEl.textContent = `${temp}°C`;
    descEl.textContent = desc;
    iconEl.textContent = chooseIcon(main, desc);
    sugEl.textContent = travelSuggestion(main.toLowerCase(), temp);
  } catch (err) {
    const data = generateMockCurrentWeather(district);
    const temp = Math.round(data.main?.temp ?? 0);
    const desc = (data.weather && data.weather[0] && data.weather[0].description) || 'Clear';
    const main = (data.weather && data.weather[0] && data.weather[0].main) || '';

    tempEl.textContent = temp + '°C';
    descEl.textContent = desc;
    iconEl.textContent = chooseIcon(main, desc);
    sugEl.textContent = `Real-time weather unavailable. ${travelSuggestion(main.toLowerCase(), temp)}`;
  }
}

function displayDestinationForecastCalendar(district) {
  const container = document.getElementById('destForecastContainer');
  if (!container) return;

  container.innerHTML = '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const defaultDate = new Date(today);

  const formatDate = (value) => {
    const yyyy = value.getFullYear();
    const mm = String(value.getMonth() + 1).padStart(2, '0');
    const dd = String(value.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const parseDate = (value) => new Date(`${value}T00:00:00`);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  let selectedTripDate = formatDate(defaultDate);
  let viewYear = defaultDate.getFullYear();
  let viewMonth = defaultDate.getMonth();

  const controls = document.createElement('div');
  controls.id = 'destPageTripDateControls';
  controls.style.marginTop = '20px';
  controls.innerHTML = `
    <div class="trip-calendar-shell">
      <div class="trip-calendar-title-row">
        <div>
          <div class="trip-calendar-label">Select Trip Date</div>
          <div class="trip-calendar-help">Choose a date to see weather forecast and travel advisory.</div>
        </div>
        <div class="trip-calendar-nav">
          <select id="destPageTripCalMonth" class="trip-calendar-select" aria-label="Select month"></select>
          <select id="destPageTripCalYear" class="trip-calendar-select" aria-label="Select year"></select>
        </div>
      </div>
      <div class="trip-calendar-weekdays" aria-hidden="true">
        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
      </div>
      <div id="destPageTripCalendarGrid" class="trip-calendar-grid"></div>
      <div class="trip-calendar-meta">
        Selected: <strong id="destPageTripCalendarSelected"></strong>
      </div>
      <button id="destPageCheckTripWeather" type="button" class="button primary trip-calendar-check">Check weather for this date</button>
    </div>
    <div class="weather-suggestion" id="destPageTripForecastOutput" style="margin-top:20px;">Choose a date to see detailed forecast.</div>
  `;

  container.appendChild(controls);

  const checkBtn = document.getElementById('destPageCheckTripWeather');
  const grid = document.getElementById('destPageTripCalendarGrid');
  const monthSelect = document.getElementById('destPageTripCalMonth');
  const yearSelect = document.getElementById('destPageTripCalYear');
  const selectedLabel = document.getElementById('destPageTripCalendarSelected');
  const output = document.getElementById('destPageTripForecastOutput');

  const monthStart = (year, month) => new Date(year, month, 1);

  const formatNiceDate = (value) => value.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const populateSelectors = () => {
    if (monthSelect && !monthSelect.options.length) {
      monthSelect.innerHTML = monthNames.map((month, index) => `<option value="${index}">${month}</option>`).join('');
    }

    if (yearSelect && !yearSelect.options.length) {
      const startYear = 1990;
      const endYear = 2035;
      yearSelect.innerHTML = Array.from({ length: endYear - startYear + 1 }, (_, index) => startYear + index)
        .map((year) => `<option value="${year}">${year}</option>`).join('');
    }

    if (monthSelect) monthSelect.value = String(viewMonth);
    if (yearSelect) yearSelect.value = String(viewYear);
  };

  const renderCalendar = () => {
    viewYear = Number(yearSelect?.value || viewYear);
    viewMonth = Number(monthSelect?.value || viewMonth);

    const firstDay = monthStart(viewYear, viewMonth);
    const firstWeekday = firstDay.getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    if (selectedLabel) selectedLabel.textContent = formatNiceDate(parseDate(selectedTripDate));

    if (!grid) return;
    grid.innerHTML = '';

    for (let empty = 0; empty < firstWeekday; empty += 1) {
      const spacer = document.createElement('span');
      spacer.className = 'trip-calendar-spacer';
      grid.appendChild(spacer);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      const value = new Date(viewYear, viewMonth, day);
      const dateKey = formatDate(value);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'trip-calendar-day';
      button.textContent = String(day);
      button.dataset.date = dateKey;

      if (dateKey === selectedTripDate) button.classList.add('is-selected');
      if (dateKey === formatDate(today)) button.classList.add('is-today');

      button.addEventListener('click', () => {
        selectedTripDate = dateKey;
        renderCalendar();
        fetchDestinationPageForecast(district, selectedTripDate);
      });

      grid.appendChild(button);
    }
  };

  if (monthSelect) {
    monthSelect.addEventListener('change', () => {
      renderCalendar();
    });
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', () => {
      renderCalendar();
    });
  }

  populateSelectors();

  checkBtn.addEventListener('click', () => {
    const dateVal = selectedTripDate || '';

    if (!dateVal) {
      output.textContent = 'Please select a trip date.';
      return;
    }

    fetchDestinationPageForecast(district, dateVal);
  });

  renderCalendar();
}

async function fetchDestinationPageForecast(district, dateVal) {
  const output = document.getElementById('destPageTripForecastOutput');
  if (!output) return;

  output.textContent = 'Loading forecast...';

  try {
    let summary;
    try {
      const location = await resolveWeatherLocation(district);
      const apiData = await fetchOpenMeteoWeather(location);
      summary = buildForecastSummaryFromRealData(location, dateVal, apiData);
      
      if (summary?.available === false) {
        throw new Error(summary.message || 'No live forecast data available');
      }
    } catch (err) {
      const data = generateMockForecast(district, dateVal);
      summary = generateMockSummary(district, dateVal, data);
    }
    
    output.innerHTML = renderForecastSummary(summary, district, dateVal);
  } catch (err) {
    output.innerHTML = `<strong>Forecast Error:</strong> ${err.message}`;
  }
}



function displayDestinationDetailMap(district) {
  const container = document.getElementById('destDetailMap');
  const mapLabel = document.getElementById('destMapLocationName');
  if (!container) return;

  if (mapLabel) {
    mapLabel.textContent = district;
  }

  // Destroy existing map if any
  if (window.destPageMapInstance) {
    if (typeof window.destPageMapInstance.remove === 'function') {
      window.destPageMapInstance.remove();
    }
    window.destPageMapInstance = null;
  }

  container.innerHTML = '';
  const place = spots[getDestinationFromURL()];
  const coords = (place && place[3]) || districtCoords[district] || [23.685, 90.3563];


  // Try Google Maps first
  if (window.google && window.google.maps) {
    const mapInstance = new google.maps.Map(container, {
      center: { lat: coords[0], lng: coords[1] },
      zoom: 14, // Increased zoom for better clarity
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true
    });


    const gLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(district + ' Bangladesh')}`;
    const externalLinkEl = document.getElementById('externalMapLink');
    if (externalLinkEl) externalLinkEl.href = gLink;

    const marker = new google.maps.Marker({
      position: { lat: coords[0], lng: coords[1] },
      map: mapInstance,
      title: district
    });

    const info = new google.maps.InfoWindow({
      content: `
        <div style="color:#333; padding:5px;">
          <strong style="display:block; font-size:1rem; margin-bottom:4px;">${district}</strong>
          <a href="${gLink}" target="_blank" style="color:#4285F4; font-weight:600; text-decoration:none;">View on Google Maps</a>
        </div>
      `
    });

    marker.addListener('click', () => {
      info.open({ map: mapInstance, anchor: marker });
    });


    window.destPageMapInstance = mapInstance;
    return;
  }

  // Leaflet fallback
  const mapInstance = L.map(container).setView(coords, 10);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
  }).addTo(mapInstance);

  L.circleMarker(coords, {
    radius: 12,
    fillColor: '#ff7e5f',
    color: '#fff',
    weight: 3,
    opacity: 1,
    fillOpacity: 0.9,
  }).addTo(mapInstance).bindPopup(`<strong>${district}</strong><br>Destination Location`);

  window.destPageMapInstance = mapInstance;

  requestAnimationFrame(() => {
    mapInstance.invalidateSize();
  });
}


function displayDestinationGuide(place) {
  const [name, district, category] = place;
  const container = document.getElementById('destGuideContent');
  if (!container) return;

  const tips = getTravelTips(category);
  const introGuide = siteContentCache?.travelGuide || '';
  // Build a simplified two-part guide: Essential Information + Guides
  const dbId = spots.indexOf(place) + 1;
  const coords = districtCoords[district] ? districtCoords[district].join(', ') : 'N/A';

  const essentialHTML = `
    <div class="guide-block" style="max-width:800px;">
      <h3 style="margin-top:0;">${name}</h3>
      <p style="font-size:1.05rem; line-height:1.8; color:var(--muted); margin-bottom:12px;">
        ${name} is a ${cats[category].toLowerCase()} destination located in ${district}. This guide provides essential information for planning your visit.
      </p>

      ${introGuide ? `<div style="margin:14px 0;padding:12px;border-radius:12px;background:rgba(255,255,255,0.03);">${escapeHtml(introGuide)}</div>` : ''}

      <section class="guide-section">
        <h4>📋 Essential Information</h4>
        <div class="travel-tips">
          ${tips.map(tip => `<p>• ${tip}</p>`).join('')}
        </div>

        <div style="margin-top:12px;">
          <strong>🕐 Best Time to Visit:</strong>
          <p style="margin:6px 0 0 0;">${getSeasonalInfo(category)}</p>
        </div>

        <div style="margin-top:12px;">
          <strong>💡 Local Information:</strong>
          <ul style="list-style:none; padding:0; margin:8px 0 0 0;">
            <li>📍 <strong>District:</strong> ${district}</li>
            <li>🏷️ <strong>Category:</strong> ${cats[category]}</li>
          </ul>
        </div>
      </section>
    </div>
  `;

  // Generate guide contacts (randomized placeholders)
  const guides = generateRandomGuides(3);
  const guidesHTML = `
    <div class="guide-block" style="max-width:800px; margin-top:20px;">
      <h4>🧑‍💼 Guides & Contacts</h4>
      <div class="guides-grid" style="display:flex; gap:12px; flex-wrap:wrap; margin-top:10px;">
        ${guides.map(g => `
          <div class="guide-card" style="flex:1 1 250px; background:var(--panel); padding:12px; border-radius:8px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <div style="width:44px; height:44px; border-radius:50%; background:#2f4f3f; display:grid; place-items:center; color:#fff; font-weight:700;">
                ${g.initials}
              </div>
              <div>
                <div style="font-weight:600;">${g.name}</div>
              </div>
            </div>
            <div style="margin-top:10px; font-size:0.95rem; color:var(--muted);">
              <div>✉️ <a href="mailto:${g.email}" style="color:inherit; text-decoration:underline;">${g.email}</a></div>
              <div style="margin-top:6px;">📞 ${g.phone}</div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.innerHTML = essentialHTML + guidesHTML;
}

// Helper: generate placeholder guides with random emails and phones
function generateRandomGuides(count = 3) {
  const firstNames = ['Arif', 'Nusrat', 'Rafiq', 'Maya', 'Tasnim', 'Sujon', 'Jahan', 'Rumana', 'Faruk', 'Lima'];
  const roles = ['Local Guide', 'Beach Guide', 'Nature Guide', 'Cultural Guide', 'History Guide'];
  const domains = ['example.com', 'travelsbd.com', 'guidehub.com', 'tourmail.com'];
  const bases = ['Cox\'s Bazar', 'Dhaka', 'Sylhet', 'Bandarban', 'Rangamati'];

  const list = [];
  for (let i = 0; i < count; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = firstNames[Math.floor(Math.random() * firstNames.length)];
    const name = `${fn} ${ln}`;
    const initials = (fn[0] + ln[0]).toUpperCase();
    const role = roles[Math.floor(Math.random() * roles.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${fn.toLowerCase()}.${ln.toLowerCase()}@${domain}`;
    const phone = `+88 ${Math.floor(10000000 + Math.random() * 90000000)}`;
    const base = bases[Math.floor(Math.random() * bases.length)];

    list.push({ name, initials, role, email, phone, base });
  }

  return list;
}

function getTravelTips(category) {
  const tipsByCategory = {
    beach: [
      'Best visited during November to February for pleasant weather',
      'Pack sunscreen, hat, and light clothing',
      'Carry plenty of water and stay hydrated',
      'Check tide times and weather conditions before visiting',
      'Respect local customs and swimming guidelines',
    ],
    nature: [
      'Wear comfortable hiking shoes and appropriate weather gear',
      'Start early in the morning to avoid crowds',
      'Bring insect repellent, first-aid kit, and plenty of water',
      'Check weather conditions and trail accessibility beforehand',
      'Hire local guides for better safety and experience',
    ],
    history: [
      'Hire a knowledgeable local guide for deeper understanding',
      'Visit in early morning for better photography and fewer crowds',
      'Show respect to cultural and historical sites',
      'Check opening hours and entrance fees in advance',
      'Take time to read historical markers and information boards',
    ],
    religious: [
      'Dress respectfully and modestly when visiting',
      'Remove shoes when required and follow posted guidelines',
      'Ask permission before taking photographs',
      'Respect prayer times and religious ceremonies',
      'Be mindful of cultural sensitivities and traditions',
    ],
    culture: [
      'Interact respectfully with local people and artisans',
      'Learn basic Bengali phrases to enhance your experience',
      'Try local cuisine from trusted vendors and restaurants',
      'Visit local markets and handicraft stores for authentic souvenirs',
      'Participate in local cultural events if available',
    ],
    city: [
      'Use public transport, rickshaws, or ride-sharing services',
      'Keep valuables secure and be aware of your surroundings',
      'Visit early morning for peaceful experience and better photography',
      'Try street food from popular, busy vendors',
      'Book accommodations in well-known areas',
    ],
    ecotourism: [
      'Follow "leave no trace" principles strictly',
      'Wear neutral earth tones to avoid disturbing wildlife',
      'Hire certified eco-guides for the best experience',
      'Stay on marked trails and respect protected areas',
      'Use eco-friendly products and minimize waste',
    ],
    wetland: [
      'Wear waterproof clothing and sturdy waterproof footwear',
      'Bring binoculars for bird watching opportunities',
      'Go with experienced local guides who know the area',
      'Visit during winter months for best wildlife viewing',
      'Respect wildlife habitats and maintain distance from animals',
    ],
  };

  return tipsByCategory[category] || [
    'Plan your visit well in advance',
    'Check current weather and local conditions',
    'Respect local customs and culture',
    'Book accommodations and transport ahead of time',
  ];
}

function getSeasonalInfo(category) {
  const seasonByCategory = {
    beach: 'November to February offers the best weather for beach visits. Avoid monsoon season (June-September).',
    nature: 'October to March is ideal for trekking and nature activities. Avoid heavy monsoon seasons.',
    history: 'October to March is best for sightseeing. Cooler weather makes exploring comfortable.',
    religious: 'Year-round accessible, but check for religious festivals and events for special experiences.',
    culture: 'October to March is most pleasant. Many cultural events happen during this season.',
    city: 'October to March offers pleasant weather. Avoid monsoon and peak summer heat.',
    ecotourism: 'November to February is best for eco-tours. Maximum wildlife visibility during these months.',
    wetland: 'Winter (December-February) is best for wetland visits and bird watching.',
  };

  return seasonByCategory[category] || 'Year-round accessible. Check weather before planning.';
}

async function displayHotels(district) {
  const container = document.getElementById('hotelList');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/hotels/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: district })
    });
    const data = await res.json();
    
    if (!data.hotels || data.hotels.length === 0) {
      container.innerHTML = '<li>Contact local tourism board for hotel recommendations</li>';
      return;
    }

    container.innerHTML = data.hotels.map(hotel => `
      <li style="margin-bottom: 12px; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 12px; list-style: none; border: 1px solid rgba(255,255,255,0.05);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-weight: 600; color: var(--accent); margin-bottom: 4px;">🏨 ${hotel.name}</div>
            <div style="font-size: 0.85rem; color: var(--muted);">Rating: ${hotel.rating}★ | Est. ৳${hotel.price}</div>
          </div>
          <a href="${hotel.url}" target="_blank" rel="noopener noreferrer" class="button secondary" style="padding: 6px 12px; font-size: 0.8rem;">
            Visit Website
          </a>
        </div>
      </li>
    `).join('');
  } catch (error) {
    container.innerHTML = '<li>Error loading hotels. Please try again.</li>';
  }
}

function displayRelatedDestinations(district, currentIndex) {
  const container = document.getElementById('relatedDestinations');
  if (!container) return;

  // Find other destinations in the same district
  const related = spots
    .map((place, idx) => ({ place, idx }))
    .filter(item => item.place[1] === district && item.idx !== currentIndex)
    .slice(0, 4);

  if (related.length === 0) {
    container.innerHTML = '<p style="grid-column: 1/-1;">No other destinations found in this district.</p>';
    return;
  }

  container.innerHTML = related.map(({ place, idx }) => {
    const [name, placedistrict, category] = place;
    const gradient = getSpotGradient(place);

    return `
      <article class="related-card" onclick="goToDestination(${idx})">
        <div class="related-card-image" style="background-image: ${gradient}"></div>
        <div class="related-card-info">
          <h4>${name}</h4>
          <p>${cats[category]}</p>
          <span class="button primary" style="width: 100%; display: flex; text-align: center;">View Details</span>
        </div>
      </article>
    `;
  }).join('');
}

function goToDestination(index) {
  window.location.href = `destination.html?id=${index}`;
}

function showError(message) {
  const main = document.getElementById('destDetailMain');
  if (main) {
    main.innerHTML = `<div style="text-align: center; padding: 60px 20px; color: var(--muted);">
      <h2>${message}</h2>
      <p>Redirecting to home page...</p>
    </div>`;
  }
}

function initReviewSection() {
  const destIndex = getDestinationFromURL();
  const destinationName = spots[destIndex]?.[0] || '';
  const starButtons = document.querySelectorAll('.star-rating .star');
  const ratingText = document.getElementById('ratingText');
  const clearBtn = document.getElementById('clearReviewBtn');
  const submitBtn = document.getElementById('submitReviewBtn');
  const textarea = document.getElementById('reviewTextarea');
  const reviewList = document.getElementById('reviewList');

  async function loadReviews() {
    if (!reviewList) return;
    reviewList.innerHTML = '<p>Loading reviews...</p>';
    try {
      const response = await fetch(`/api/reviews?destinationId=${encodeURIComponent(String(destIndex))}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not load reviews');

      const reviews = Array.isArray(data.reviews) ? data.reviews : [];
      if (!reviews.length) {
        reviewList.innerHTML = '<p>No reviews yet. Be the first to share one.</p>';
        return;
      }

      reviewList.innerHTML = reviews.map((review) => {
        const stars = '★★★★★'.slice(0, review.rating) + '☆☆☆☆☆'.slice(0, 5 - review.rating);
        const response = review.adminResponse
          ? `<div class="review-response"><strong>Admin response:</strong> <p>${escapeHtml(review.adminResponse.text)}</p></div>`
          : '<div class="review-response review-response-empty">No admin response yet.</div>';
        return `
          <article class="review-card">
            <div class="review-card-head">
              <strong>${escapeHtml(review.userName || 'Traveler')}</strong>
              <span>${stars}</span>
            </div>
            <p>${escapeHtml(review.text)}</p>
            ${response}
          </article>
        `;
      }).join('');
    } catch (error) {
      reviewList.innerHTML = `<p>${escapeHtml(error.message || 'Could not load reviews')}</p>`;
    }
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Star rating interactions
  if (starButtons.length) {
    starButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        currentReviewRating = parseInt(button.dataset.rating);
        
        // Update visual state
        starButtons.forEach((btn, idx) => {
          if (idx < currentReviewRating) {
            btn.classList.add('active');
          } else {
            btn.classList.remove('active');
          }
        });

        // Update rating text
        const ratingLabels = ['', '1 star', '2 stars', '3 stars', '4 stars', '5 stars'];
        if (ratingText) {
          ratingText.textContent = ratingLabels[currentReviewRating] || 'Select a rating';
        }
      });
    });
  }

  // Clear button
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      currentReviewRating = 0;
      if (textarea) textarea.value = '';
      if (ratingText) ratingText.textContent = 'Select a rating';
      starButtons.forEach(btn => btn.classList.remove('active'));
    });
  }

  // Submit button
  if (submitBtn) {
    submitBtn.addEventListener('click', () => {
      const reviewText = textarea?.value.trim() || '';
      
      if (currentReviewRating === 0) {
        alert('Please select a rating before submitting your review.');
        return;
      }

      if (reviewText.length < 10) {
        alert('Please write at least 10 characters in your review.');
        return;
      }

      const token = localStorage.getItem('tourismAuthToken') || '';
      if (!token) {
        alert('Please sign in before publishing a review.');
        return;
      }

      fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destinationId: String(destIndex),
          destinationName,
          rating: currentReviewRating,
          text: reviewText,
        }),
      })
        .then(async (response) => {
          const data = await response.json().catch(() => ({}));
          if (!response.ok) throw new Error(data.error || 'Could not submit review');
          alert('Your review has been saved.');
          currentReviewRating = 0;
          if (textarea) textarea.value = '';
          if (ratingText) ratingText.textContent = 'Select a rating';
          starButtons.forEach((btn) => btn.classList.remove('active'));
          loadReviews();
        })
        .catch((error) => {
          alert(error.message || 'Could not submit review');
        });
    });
  }

  loadReviews();
}

function getBudgetByCategory(category) {
  const budgets = siteContentCache?.budgets || {
    beach: { accommodation: 2500, food: 800, transport: 600 },
    nature: { accommodation: 1800, food: 700, transport: 500 },
    history: { accommodation: 2200, food: 750, transport: 550 },
    religious: { accommodation: 1500, food: 650, transport: 450 },
    culture: { accommodation: 2000, food: 800, transport: 600 },
    city: { accommodation: 3000, food: 1000, transport: 700 },
    ecotourism: { accommodation: 2200, food: 700, transport: 550 },
    wetland: { accommodation: 1600, food: 700, transport: 500 }
  };

  return budgets[category] || budgets.nature;
}

function initBudgetCalculator(category) {
  const personInput = document.getElementById('budgetPersons');
  const daysInput = document.getElementById('budgetDays');
  const accEl = document.getElementById('budgetAccommodation');
  const foodEl = document.getElementById('budgetFood');
  const localTransportEl = document.getElementById('budgetLocalTransport');
  const travelCostEl = document.getElementById('budgetTravelCost');
  const perPersonPerDayEl = document.getElementById('budgetPerPersonPerDay');
  const totalEl = document.getElementById('budgetTotal');
  const routeInfoEl = document.getElementById('budgetRouteInfo');
  const originSelect = document.getElementById('budgetOriginDest');
  const transportModeSelect = document.getElementById('budgetTransportMode');

  if (!personInput || !daysInput) return;

  const budget = getBudgetByCategory(category);

  // Per-km rates for each transport mode (BDT)
  const perKmRates = { bus: 2.0, train: 1.8, launch: 1.5, air: 12.0 };
  const minFares = { bus: 200, train: 250, launch: 300, air: 3500 };

  function haversineDist(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  // Get the destination district from the page
  const destIndex = getDestinationFromURL();
  const destDistrict = spots[destIndex]?.[1] || '';

  function updateCalculation() {
    const persons = parseInt(personInput.value) || 1;
    const days = parseInt(daysInput.value) || 1;
    const origin = originSelect ? originSelect.value : '';
    const transportMode = transportModeSelect ? transportModeSelect.value : 'bus';

    const accPerNight = budget.accommodation;
    const foodPerDay = budget.food;
    const localTransportPerDay = budget.transport;

    // Calculate travel cost based on distance
    let roundTripPerPerson = 0;
    let routeText = '';

    if (origin && destDistrict) {
      const oCoords = districtCoords[origin];
      const dCoords = districtCoords[destDistrict];
      if (oCoords && dCoords) {
        let distKm = haversineDist(oCoords[0], oCoords[1], dCoords[0], dCoords[1]);
        distKm = Math.round(distKm * 1.3); // road distance factor
        const perKm = perKmRates[transportMode] || 2.0;
        const minFare = minFares[transportMode] || 200;
        const oneWay = Math.max(Math.round(distKm * perKm), minFare);
        roundTripPerPerson = oneWay * 2;
        routeText = `${origin} → ${destDistrict} (~${distKm} km by ${transportMode})`;
      }
    }

    if (travelCostEl) {
      travelCostEl.textContent = roundTripPerPerson > 0 ? `৳ ${roundTripPerPerson.toLocaleString()}` : 'Select your district';
    }
    if (routeInfoEl) {
      routeInfoEl.textContent = routeText;
    }

    const perPersonPerDay = accPerNight + foodPerDay + localTransportPerDay;
    const totalCost = (perPersonPerDay * persons * days) + (roundTripPerPerson * persons);

    if (accEl) accEl.textContent = `৳ ${accPerNight.toLocaleString()}`;
    if (foodEl) foodEl.textContent = `৳ ${foodPerDay.toLocaleString()}`;
    if (localTransportEl) localTransportEl.textContent = `৳ ${localTransportPerDay.toLocaleString()}`;
    if (perPersonPerDayEl) perPersonPerDayEl.textContent = `৳ ${perPersonPerDay.toLocaleString()}`;
    if (totalEl) totalEl.textContent = `৳ ${totalCost.toLocaleString()}`;
  }

  // Add event listeners
  personInput.addEventListener('change', updateCalculation);
  daysInput.addEventListener('change', updateCalculation);
  if (originSelect) originSelect.addEventListener('change', updateCalculation);
  if (transportModeSelect) transportModeSelect.addEventListener('change', updateCalculation);

  // Button controls
  document.getElementById('personPlus')?.addEventListener('click', () => {
    let val = parseInt(personInput.value) || 1;
    if (val < 20) {
      personInput.value = val + 1;
      updateCalculation();
    }
  });

  document.getElementById('personMinus')?.addEventListener('click', () => {
    let val = parseInt(personInput.value) || 1;
    if (val > 1) {
      personInput.value = val - 1;
      updateCalculation();
    }
  });

  document.getElementById('daysPlus')?.addEventListener('click', () => {
    let val = parseInt(daysInput.value) || 1;
    if (val < 30) {
      daysInput.value = val + 1;
      updateCalculation();
    }
  });

  document.getElementById('daysMinus')?.addEventListener('click', () => {
    let val = parseInt(daysInput.value) || 1;
    if (val > 1) {
      daysInput.value = val - 1;
      updateCalculation();
    }
  });

  // Initial calculation
  updateCalculation();
}

// Initialize when page loads
window.addEventListener('DOMContentLoaded', initDestinationPage);
