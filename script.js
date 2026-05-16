const spots = [
  ["Cox's Bazar Sea Beach", "Cox's Bazar", "beach", [21.4159, 91.9810]],
  ["Sundarbans", "Khulna", "nature", [21.9497, 89.1833]],
  ["Somapura Mahavihara", "Naogaon", "history", [25.0311, 88.9769]],
  ["Lalbagh Fort", "Dhaka", "history", [23.7190, 90.3881]],
  ["Sonargaon", "Narayanganj", "history", [23.6445, 90.5984]],
  ["Sixty Dome Mosque", "Bagerhat", "religious", [22.6744, 89.7419]],
  ["Ahsan Manzil", "Dhaka", "history", [23.7086, 90.4061]],
  ["Bandarban", "Bandarban", "nature", [22.2053, 92.2384]],
  ["Rangamati", "Rangamati", "nature", [23.4159, 92.2985]],
  ["Khagrachari", "Khagrachari", "nature", [23.4126, 91.9868]],


  ["Sajek Valley", "Rangamati", "nature", [23.3909, 92.2855]],
  ["Nilgiri","Bandarban","nature"],
  ["Nilachal","Bandarban","nature"],
  ["Thanchi","Bandarban","nature"],
  ["Ruma","Bandarban","nature"],
  ["Keokradong","Bandarban","nature"],
  ["Tajingdong","Bandarban","nature"],
  ["Chimbuk Hill","Bandarban","nature"],
  ["Alikadam","Bandarban","nature"],
  ["Rowangchhari","Bandarban","nature"],

  ["Mahamaya Lake","Chattogram","nature"],
  ["Foy's Lake","Chattogram","nature"],
  ["Patenga Sea Beach","Chattogram","beach"],
  ["Parki Sea Beach","Chattogram","beach"],
  ["Kaptai Lake","Rangamati","nature"],
  ["Hanging Bridge Rangamati","Rangamati","nature"],
  ["Subalong Waterfall","Rangamati","nature"],
  ["Alutila Cave","Khagrachari","nature"],
  ["Richang Waterfall","Khagrachari","nature"],
  ["Dighinala","Khagrachari","nature"],

  ["Saint Martin's Island", "Cox's Bazar", "beach", [20.6131, 92.3267]],
  ["Chera Dwip","Cox's Bazar","beach"],
  ["Teknaf","Cox's Bazar","beach"],
  ["Himchari","Cox's Bazar","beach"],
  ["Inani Beach","Cox's Bazar","beach"],
  ["Kuakata","Patuakhali","beach"],
  ["Sonar Char","Patuakhali","beach"],
  ["Gangamati Beach","Patuakhali","beach"],

  ["Nijhum Island","Noakhali","ecotourism"],
  ["Hatiya Island","Noakhali","nature"],
  ["Sandwip","Chattogram","nature"],
  ["Maheshkhali","Cox's Bazar","nature"],
  ["Kutubdia","Cox's Bazar","nature"],

  ["Shalban Vihara","Cumilla","history"],
  ["Mainamati","Cumilla","history"],

  ["War Cemetery","Chattogram","history"],
  ["Batali Hill","Chattogram","nature"],
  ["Sitakunda","Chattogram","nature"],
  ["Chandranath Temple","Chattogram","religious"],

  ["Tanguar Haor", "Sunamganj", "wetland", [25.1414, 91.0664]],
  ["Hakaluki Haor","Moulvibazar","wetland"],
  ["Srimangal Tea Garden","Moulvibazar","nature"],
  ["Madhabpur Lake","Moulvibazar","nature"],
  ["Ham Ham Waterfall","Moulvibazar","nature"],
  ["Lawachara National Park","Moulvibazar","ecotourism"],

  ["Jaflong","Sylhet","nature"],
  ["Bichanakandi","Sylhet","nature"],
  ["Ratargul Swamp Forest","Sylhet","wetland"],

  ["National Parliament House","Dhaka","city"],
  ["National Martyrs' Memorial","Dhaka","history"],
  ["Baitul Mukarram Mosque","Dhaka","religious"],
  ["Dhakeshwari Temple","Dhaka","religious"],
  ["National Museum","Dhaka","culture"],

  ["Ramna Park","Dhaka","city"],
  ["Suhrawardy Udyan","Dhaka","city"],
  ["Botanical Garden","Dhaka","nature"],
  ["National Zoo","Dhaka","city"],

  ["Bhola Island","Bhola","nature"],
  ["Char Kukri Mukri","Bhola","ecotourism"],
  ["Monpura Island","Bhola","nature"],

  ["Kuakata Sea Beach","Patuakhali","beach"],
  ["Lebur Char","Patuakhali","beach"],
  ["Bhetua Beach","Barguna","beach"],

  ["Padma Bridge","Madaripur","city"],
  ["Mujibnagar","Meherpur","history"],

  ["Hardinge Bridge","Pabna","history"],
  ["Puthia Rajbari","Rajshahi","history"],
  ["Bagha Mosque","Rajshahi","religious"],

  ["Kantajew Temple","Dinajpur","religious"],
  ["Ramsagar","Dinajpur","nature"],

  ["Lalon Akhra","Kushtia","culture"],
  ["Rabindra Kuthibari","Kushtia","culture"]
];

const API_BASE_URL = (window.location.origin === 'null' || window.location.origin.startsWith('file') || window.location.port === '5500' || window.location.port === '5501') ? 'http://127.0.0.1:3000' : window.location.origin;

const budgetRates = {
  transport: { bus: 900, train: 1200, launch: 750, air: 6500 },
  hotel: { budget: 1800, standard: 3500, premium: 7000 },
  guide: { budget: 2800, standard: 4200, premium: 6500 },
  activity: { leisure: 1200, culture: 1000, adventure: 1800, eco: 1100, wildlife: 1500, family: 900 }
};

const spotFilterProfiles = {
  beach: { budget: 'high', road: 'easy', opportunity: 'leisure' },
  nature: { budget: 'low', road: 'moderate', opportunity: 'wildlife' },
  history: { budget: 'low', road: 'easy', opportunity: 'culture' },
  religious: { budget: 'low', road: 'easy', opportunity: 'culture' },
  city: { budget: 'high', road: 'easy', opportunity: 'leisure' },
  wetland: { budget: 'low', road: 'moderate', opportunity: 'eco' },
  ecotourism: { budget: 'low', road: 'easy', opportunity: 'eco' },
  culture: { budget: 'low', road: 'easy', opportunity: 'culture' }
};

const spotFilterOverrides = {
  Sundarbans: { road: 'moderate', opportunity: 'wildlife' },
  'Saint Martin\'s Island': { road: 'moderate', opportunity: 'leisure' },
  Nilgiri: { budget: 'high', road: 'challenging', opportunity: 'adventure' }
};

// District coordinates (approximate center of each district)
const districtCoords = {
  "Dhaka": [23.8103, 90.4125],
  "Cox's Bazar": [21.4425, 91.9674],
  "Khulna": [22.8456, 89.5339],
  "Naogaon": [24.1959, 88.9315],
  "Bandarban": [22.2053, 92.2384],
  "Rangamati": [23.4159, 92.2985],
  "Khagrachari": [23.4126, 91.9868],
  "Chattogram": [22.3569, 91.7832],
  "Patuakhali": [22.2526, 90.3298],
  "Noakhali": [23.0137, 91.6309],
  "Cumilla": [23.4607, 91.1809],
  "Sylhet": [24.8949, 91.8687],
  "Sunamganj": [25.2581, 91.3955],
  "Moulvibazar": [24.4829, 91.7271],
  "Narayanganj": [23.6327, 90.5],
  "Bagerhat": [22.6510, 89.7869],
  "Madaripur": [23.1641, 90.1882],
  "Meherpur": [23.7657, 88.6313],
  "Pabna": [23.9169, 89.2334],
  "Rajshahi": [24.3745, 88.6042],
  "Dinajpur": [25.6270, 88.6389],
  "Kushtia": [23.9012, 89.1210]
};

const districtToDivision = {
  "Dhaka": "dhaka",
  "Narayanganj": "dhaka",
  "Madaripur": "dhaka",

  "Chattogram": "chattogram",
  "Cox's Bazar": "chattogram",
  "Bandarban": "chattogram",
  "Rangamati": "chattogram",
  "Khagrachari": "chattogram",
  "Cumilla": "chattogram",
  "Noakhali": "chattogram",

  "Khulna": "khulna",
  "Bagerhat": "khulna",
  "Kushtia": "khulna",
  "Meherpur": "khulna",

  "Patuakhali": "barishal",
  "Bhola": "barishal",
  "Barguna": "barishal",

  "Naogaon": "rajshahi",
  "Rajshahi": "rajshahi",
  "Pabna": "rajshahi",

  "Dinajpur": "rangpur",

  "Sylhet": "sylhet",
  "Sunamganj": "sylhet",
  "Moulvibazar": "sylhet"
};

const divisions = {
  all: "All",
  dhaka: "Dhaka",
  chattogram: "Chattogram",
  khulna: "Khulna",
  sylhet: "Sylhet",
  rangpur: "Rangpur",
  barishal: "Barishal",
  rajshahi: "Rajshahi",
  mymensingh: "Mymensingh"
};

let tourismMap = null;
let mapMarkers = [];
let markerClusterGroup = null;
let useGoogleMaps = true; // set to true to prefer Google Maps when API is loaded
let googleMap = null;
let googleMarkers = [];
window.onGoogleMapsApiLoaded = () => {
  initializeMap();
  if (googleMap) {
    render();
  }
};


const cats = {all:"All", nature:"Nature", beach:"Beach", history:"History", religious:"Religious", culture:"Culture", wetland:"Wetland", ecotourism:"Ecotourism", city:"City"};
let active = "all";
let activeDivision = "all";
let selectedIndex = 0;
// Weather API key should be kept on the server (server/.env). This file calls backend APIs.
// Backend endpoints:
// GET /api/weather?district=Dhaka
// GET /api/forecast?district=Dhaka&date=YYYY-MM-DD


const categoryGradients = {
  all: "linear-gradient(135deg, rgba(70, 201, 109, 0.25), rgba(6, 17, 11, 0.9))",
  nature: "linear-gradient(135deg, rgba(70, 201, 109, 0.35), rgba(6, 17, 11, 0.92))",
  beach: "linear-gradient(135deg, rgba(90, 180, 255, 0.35), rgba(6, 17, 11, 0.92))",
  history: "linear-gradient(135deg, rgba(240, 195, 90, 0.35), rgba(6, 17, 11, 0.92))",
  religious: "linear-gradient(135deg, rgba(255, 120, 100, 0.32), rgba(6, 17, 11, 0.92))",
  culture: "linear-gradient(135deg, rgba(216, 100, 255, 0.32), rgba(6, 17, 11, 0.92))",
  wetland: "linear-gradient(135deg, rgba(78, 209, 190, 0.34), rgba(6, 17, 11, 0.92))",
  ecotourism: "linear-gradient(135deg, rgba(144, 227, 123, 0.34), rgba(6, 17, 11, 0.92))",
  city: "linear-gradient(135deg, rgba(135, 150, 170, 0.34), rgba(6, 17, 11, 0.92))"
};

const spotImages = {
  "Cox's Bazar Sea Beach": "spot-pictures/Coxs bazar.jpg",
  "Sundarbans": "spot-pictures/Sundarban_Tiger.jpg",
  "Lalbagh Fort": "spot-pictures/Lalbagh fort.jpg",
  "Sonargaon": "spot-pictures/Sonargaon .jpg",
  "Ahsan Manzil": "spot-pictures/ahsan-monjil.jpg",
  "Bandarban": "spot-pictures/Bandarban.jpg",
  "Rangamati": "spot-pictures/Rangamati.jpg",
  "Sajek Valley": "spot-pictures/Chittagong hill tracks.jpg",
  "Nilgiri": "spot-pictures/Nilgiri.jpg",
  "Foy's Lake": "spot-pictures/Foys lake.jpg",
  "Patenga Sea Beach": "spot-pictures/Potenga sea Beach .jpg",
  "Saint Martin's Island": "spot-pictures/Saint martin.jpg",
  "Kuakata": "spot-pictures/Kuyakata.jpg",
  "Srimangal Tea Garden": "spot-pictures/SRIMANGAL.jpg",
  "Jaflong": "spot-pictures/Jaflang.jpg",
  "Bichanakandi": "spot-pictures/Bishankandi-4.jpg",
  "Lawachara National Park": "spot-pictures/LAWYACHORA GARDEN.jpg",
  "Ramsagar": "spot-pictures/Ramsagar national park.jpg",
  "Inani Beach": "spot-pictures/Coxs bazar.jpg", // reuse coxs bazar for nearby beaches
  "Himchari": "spot-pictures/Coxs bazar.jpg",
  "Ratargul Swamp Forest": "spot-pictures/Bishankandi-4.jpg" // similar nature
};


function getSpotGradient(place) {
  const name = place[0];
  const cat = place[2];
  if (spotImages[name]) {
    return `url('${spotImages[name]}')`;
  }
  return categoryGradients[cat] || categoryGradients.all;
}


function getMarkerColor(category) {
  const colors = {
    nature: '#70c96d',
    beach: '#5ab4ff',
    history: '#f0c35a',
    religious: '#ff6464',
    culture: '#d864ff',
    ecotourism: '#90e37b',
    city: '#8b96aa',
    wetland: '#4ed1be'
  };
  return colors[category] || '#9eb5aa';
}

function initializeMap() {
  const mapContainer = document.getElementById('tourismMap');
  if (!mapContainer) return;

  // If Google Maps is requested and loaded, initialize it. Otherwise fallback to Leaflet.
  if (useGoogleMaps && window.google && window.google.maps) {
    if (googleMap) return;
    googleMap = new google.maps.Map(mapContainer, {
      center: { lat: 23.685, lng: 90.3563 },
      zoom: 7,
      mapTypeControl: true,
    });
    return;
  }

  if (tourismMap) return; // already initialized (Leaflet)

  // Center on Bangladesh (Leaflet fallback)
  tourismMap = L.map('tourismMap').setView([23.685, 90.3563], 7);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19,
    backgroundColor: '#051009'
  }).addTo(tourismMap);

  markerClusterGroup = L.markerClusterGroup({ maxClusterRadius: 50 });
  tourismMap.addLayer(markerClusterGroup);
}

function getMarkerIcon(category, isSelected = false) {
  const color = getMarkerColor(category);
  const size = isSelected ? 30 : 24;
  return L.divIcon({
    html: `<div style="
      width: ${size}px; 
      height: ${size}px; 
      background: ${color}; 
      border: 3px solid ${isSelected ? '#fff' : 'rgba(255,255,255,0.6)'};
      border-radius: 50%; 
      display: grid; 
      place-items: center;
      box-shadow: ${isSelected ? '0 0 12px rgba(255,255,255,0.8), 0 0 20px ' + color : '0 2px 6px rgba(0,0,0,0.4)'};
      font-weight: 700;
      color: #000;
      font-size: ${isSelected ? '14px' : '12px'};
    "></div>`,
    iconSize: [size, size],
    className: 'custom-marker'
  });
}

function clearMapMarkers() {
  if (markerClusterGroup) {
    markerClusterGroup.clearLayers();
    mapMarkers = [];
  }
}

function focusMapOnFilteredPlace(filtered, index) {
  if (!tourismMap || !filtered.length) return;

  const place = filtered[index] || filtered[0];
  if (!place) return;

  const district = place[1];
  const coords = districtCoords[district];
  if (!coords) return;

  tourismMap.flyTo(coords, 8, {
    duration: 0.8,
    easeLinearity: 0.25
  });
}

function addMapMarkers(filtered) {
  clearMapMarkers();
  // Google Maps path
  if (googleMap) {
    filtered.forEach((place, idx) => {
      const [name, district, category, specificCoords] = place;
      const coords = specificCoords || districtCoords[district];
      if (!coords) return;


      const offset = (idx % 3) * 0.01;
      const lat = coords[0] + (Math.random() - 0.5) * 0.05 + offset;
      const lng = coords[1] + (Math.random() - 0.5) * 0.05;

      const pos = { lat, lng };

      const marker = new google.maps.Marker({
        position: pos,
        map: googleMap,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: idx === selectedIndex ? 9 : 7,
          fillColor: getMarkerColor(category),
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 1
        }
      });

      const gLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name + ' ' + district)}`;
      const info = new google.maps.InfoWindow({ 
        content: `
          <div style="color:#333; padding:5px;">
            <strong style="display:block; font-size:1.1rem; margin-bottom:4px;">${name}</strong>
            <div style="margin-bottom:8px;">${district} • ${cats[category]}</div>
            <div style="display:flex; gap:10px;">
              <a href="destination.html?id=${spots.indexOf(place)}" style="color:#2ea857; font-weight:600; text-decoration:none;">View Details</a>
              <a href="${gLink}" target="_blank" style="color:#4285F4; font-weight:600; text-decoration:none;">Directions</a>
            </div>
          </div>
        ` 
      });


      marker.addListener('click', () => {
        if (selectedIndex === idx) {
          window.location.href = `destination.html?id=${spots.indexOf(place)}`;
        } else {
          selectedIndex = idx;
          render();
        }
        info.open({ map: googleMap, anchor: marker });
      });

      googleMarkers.push({ marker, info });
    });
    return;
  }

  // Leaflet fallback path (existing behaviour)
  if (!tourismMap || !markerClusterGroup) return;

  filtered.forEach((place, idx) => {
    const [name, district, category] = place;
    const coords = districtCoords[district];
    if (!coords) return;

    // Add slight random offset so multiple places in same district don't overlap
    const offset = (idx % 3) * 0.01;
    const lat = coords[0] + (Math.random() - 0.5) * 0.05 + offset;
    const lng = coords[1] + (Math.random() - 0.5) * 0.05;

    const marker = L.marker([lat, lng], {
      icon: getMarkerIcon(category, idx === selectedIndex)
    });

    const popupContent = `
      <strong>${name}</strong>
      <div>${district}</div>
      <div class="category">${cats[category]}</div>
      <div class="map-popup-actions">
        <a href="destination.html?id=${spots.indexOf(place)}">View details</a>
      </div>
    `;
    marker.bindPopup(popupContent);

    marker.on('click', () => {
      if (selectedIndex === idx) {
        window.location.href = `destination.html?id=${spots.indexOf(place)}`;
      } else {
        selectedIndex = idx;
        render();
      }
    });

    mapMarkers.push(marker);
    markerClusterGroup.addLayer(marker);
  });
}

function updateMapMarkers(filtered) {
  // Google Maps path
  if (googleMap) {
    googleMarkers.forEach((obj, idx) => {
      const isSelected = idx === selectedIndex;
      const place = filtered[idx];
      if (!place) return;
      const category = place[2];
      obj.marker.setIcon({
        path: google.maps.SymbolPath.CIRCLE,
        scale: isSelected ? 9 : 7,
        fillColor: getMarkerColor(category),
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 1
      });
    });
    return;
  }

  if (!tourismMap) return;

  // Leaflet path: Update marker styling based on selected index
  mapMarkers.forEach((marker, idx) => {
    const isSelected = idx === selectedIndex;
    const place = filtered[idx];
    if (place) {
      const category = place[2];
      marker.setIcon(getMarkerIcon(category, isSelected));
    }
  });
}

function focusSearch() {
  const search = document.getElementById("search");
  search.focus();
  search.scrollIntoView({ behavior: "smooth", block: "center" });
}

function jumpToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function smoothScrollToSection(selector) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initFaqNavigation() {
  document.querySelectorAll('a[href="#faq"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      smoothScrollToSection("#faq");
    });
  });

  const faqStartBtn = document.getElementById("faqStartBtn");
  if (faqStartBtn) {
    faqStartBtn.addEventListener("click", (event) => {
      event.preventDefault();
      smoothScrollToSection("#discover");
    });
  }
}

function getDivisionByDistrict(district) {
  if (districtToDivision[district]) return districtToDivision[district];
  return null;
}

function getFiltered(includeDivision = true) {
  const q = document.getElementById("search").value.trim().toLowerCase();
  const bF = document.getElementById("budgetFilter")?.value || "All";
  const rF = document.getElementById("roadFilter")?.value || "All";
  const oF = document.getElementById("opportunityFilter")?.value || "All";

  return spots.filter((s) => {
    const division = getDivisionByDistrict(s[1]);
    const profile = spotFilterProfiles[s[2]] || { budget: 'low', road: 'easy', opportunity: 'leisure' };
    const over = spotFilterOverrides[s[0]] || {};
    const p = { ...profile, ...over };

    const matchCat = active === "all" || s[2] === active;
    const matchQ = !q || s[0].toLowerCase().includes(q) || s[1].toLowerCase().includes(q);
    const matchDivision = !includeDivision || activeDivision === "all" || division === activeDivision;
    
    const matchesBudget = bF === "All" || p.budget === bF;
    const matchesRoad = rF === "All" || p.road === rF;
    const matchesOpp = oF === "All" || p.opportunity === oF;

    return matchCat && matchQ && matchDivision && matchesBudget && matchesRoad && matchesOpp;
  });
}

function buildDivisionButtons(source) {
  const divisionGrid = document.getElementById("divisionGrid");
  if (!divisionGrid) return;

  const safeSource = Array.isArray(source) ? source : spots;
  const searchEl = document.getElementById("divisionSearch");
  const divisionQuery = (searchEl?.value || "").trim().toLowerCase();

  const counts = {
    all: safeSource.length,
    dhaka: 0,
    chattogram: 0,
    khulna: 0,
    sylhet: 0,
    rangpur: 0,
    barishal: 0,
    rajshahi: 0,
    mymensingh: 0
  };

  safeSource.forEach((place) => {
    const division = getDivisionByDistrict(place[1]);
    if (division && Object.prototype.hasOwnProperty.call(counts, division)) {
      counts[division] += 1;
    }
  });

  const keys = ["all", "dhaka", "chattogram", "khulna", "sylhet", "rangpur", "barishal", "rajshahi", "mymensingh"];
  const visibleKeys = keys.filter((key) => {
    if (key === "all") return true;
    if (!divisionQuery) return true;
    return divisions[key].toLowerCase().includes(divisionQuery);
  });

  if (!visibleKeys.includes(activeDivision)) {
    activeDivision = "all";
  }

  divisionGrid.innerHTML = "";

  visibleKeys.forEach((key) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "division-card" + (key === activeDivision ? " active" : "");
    button.dataset.division = key;
    button.innerHTML =
      "<strong>" + divisions[key] + "</strong>" +
      "<small>" + counts[key] + " destinations</small>";

    button.onclick = () => {
      activeDivision = key;
      selectedIndex = 0;
      render();
    };

    divisionGrid.appendChild(button);
  });
}

function syncCategoryButtons() {
  document.querySelectorAll("[data-cat]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.cat === active);
  });
}

function buildCategoryButtons() {
  const catEl = document.getElementById("categoryBar") || document.getElementById("cats");

  if (!catEl) return;

  catEl.innerHTML = "";

  Object.entries(cats).forEach(([key, value]) => {
    const button = document.createElement("button");
    button.className = "chip" + (key === "all" ? " active" : "");
    button.dataset.cat = key;
    button.type = "button";
    button.textContent = value;
    button.onclick = () => {
      active = key;
      selectedIndex = 0;
      syncCategoryButtons();
      render();
    };

    catEl.appendChild(button);
  });
}

function updateStats(filtered) {
  const districts = new Set(spots.map((s) => s[1]));
  document.getElementById("stats").textContent = filtered.length + " places shown";
  document.getElementById("totalPlaces").textContent = spots.length + "+";
  document.getElementById("totalDistricts").textContent = districts.size + "+";
  document.getElementById("activeCategory").textContent = cats[active];
}

function setFeatured(place, idxInFiltered) {
  if (!place) {
    document.getElementById("featuredName").textContent = "No destination found";
    document.getElementById("featuredDistrict").textContent = "Try another search keyword";
    document.getElementById("featuredTag").textContent = "Empty";
    document.getElementById("featuredMeta").textContent = "No category";
    document.getElementById("resultName").textContent = "No destination selected";
    document.getElementById("resultDistrict").textContent = "-";
    document.getElementById("resultCategory").textContent = "-";
    document.getElementById("resultIndex").textContent = "-";
    document.getElementById("resultDesc").textContent = "No match found with current filter. Change keyword or select a different category.";
    document.getElementById("featuredCard").style.backgroundImage = categoryGradients.all;
    document.getElementById("resultVisual").style.backgroundImage = categoryGradients.all;
    const featuredLink = document.getElementById("featuredDetailsLink");
    const resultLink = document.getElementById("resultDetailsLink");
    if (featuredLink) featuredLink.href = "#";
    if (resultLink) resultLink.href = "#";
    return;
  }

  const [name, district, cat] = place;
  const gradient = getSpotGradient(place);

  document.getElementById("featuredName").textContent = name;
  document.getElementById("featuredDistrict").textContent = district;
  document.getElementById("featuredTag").textContent = cats[cat];
  document.getElementById("featuredMeta").textContent = "#" + (spots.indexOf(place) + 1) + " in database";

  document.getElementById("resultName").textContent = name;
  document.getElementById("resultDistrict").textContent = district;
  document.getElementById("resultCategory").textContent = cats[cat];
  
  const p = getSpotFilterProfile(place);
  const budgetPill = document.getElementById("resultBudgetPill");
  if (budgetPill) {
    budgetPill.textContent = p.budget.toUpperCase();
    budgetPill.className = 'budget-pill ' + p.budget;
  }

  const budgetResult = document.getElementById("budgetResult");
  if (budgetResult) budgetResult.innerHTML = 'Adjust travelers/nights and click calculate.';

  loadRouteOptions(district);
  
  document.getElementById("resultDesc").textContent = name + " is a " + cats[cat].toLowerCase() + " destination in " + district + ". Explore travel options, accommodation, and real-time weather below.";

  document.getElementById("featuredCard").style.backgroundImage = gradient;
  document.getElementById("resultVisual").style.backgroundImage = gradient;

  // Update links to point to the destination page
  const globalIndex = spots.indexOf(place);
  const featuredLink = document.getElementById("featuredDetailsLink");
  const resultLink = document.getElementById("resultDetailsLink");
  if (featuredLink) featuredLink.href = `destination.html?id=${globalIndex}`;
  if (resultLink) resultLink.href = `destination.html?id=${globalIndex}`;
}

function renderPopularGrid(filtered) {
  const grid = document.getElementById("popularGrid");
  grid.innerHTML = "";

  filtered.slice(0, 12).forEach((place, idx) => {
    const [name, district, cat] = place;
    const card = document.createElement("article");
    card.className = "popular-card" + (idx === selectedIndex ? " active" : "");
    card.innerHTML =
      '<div class="card-image" style="background-image:' + getSpotGradient(place) + '"></div>' +
      '<div class="card-title"><h3>' + name + '</h3><span class="card-badge">' + cats[cat] + '</span></div>' +
      '<p class="card-meta">District: ' + district + '</p>';

    card.onclick = () => {
      if (selectedIndex === idx) {
        window.location.href = `destination.html?id=${spots.indexOf(place)}`;
      } else {
        selectedIndex = idx;
        render();
        document.getElementById("resultCard").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    };

    grid.appendChild(card);
  });
}

function getSpotFilterProfile(place) {
  const name = place[0];
  const cat = place[2];
  const profile = spotFilterProfiles[cat] || { budget: 'low', road: 'easy', opportunity: 'leisure' };
  return { ...profile, ...(spotFilterOverrides[name] || {}) };
}

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Per-km rates for each transport mode (BDT)
const transportPerKmRates = { bus: 2.0, train: 1.8, launch: 1.5, air: 12.0 };
const transportMinFare = { bus: 200, train: 250, launch: 300, air: 3500 };

function calculateBudget() {
  const origin = document.getElementById('budgetOrigin').value;
  const travelers = parseInt(document.getElementById('budgetTravelers').value) || 1;
  const nights = parseInt(document.getElementById('budgetNights').value) || 1;
  const guideDays = parseInt(document.getElementById('budgetGuideDays').value) || 0;
  const transportMode = document.getElementById('budgetTransport').value;
  const hotelTier = document.getElementById('budgetHotelTier').value;
  const res = document.getElementById('budgetResult');

  // Get destination district from the currently selected spot
  const destDistrict = document.getElementById('resultDistrict')?.textContent || '';

  if (!origin) {
    res.innerHTML = '<div style="color:#F5A623;"><i class="fas fa-exclamation-triangle"></i> Please select your district first.</div>';
    return;
  }
  if (!destDistrict || destDistrict === '-') {
    res.innerHTML = '<div style="color:#F5A623;"><i class="fas fa-exclamation-triangle"></i> Please select a destination first.</div>';
    return;
  }

  // Calculate distance
  const originCoords = districtCoords[origin];
  const destCoords = districtCoords[destDistrict];
  let distKm = 0;
  let distNote = '';

  if (originCoords && destCoords) {
    distKm = haversineDistance(originCoords[0], originCoords[1], destCoords[0], destCoords[1]);
    // Road distance is roughly 1.3x straight-line
    distKm = Math.round(distKm * 1.3);
    distNote = `${origin} → ${destDistrict} (~${distKm} km)`;
  } else {
    distKm = 200; // fallback
    distNote = `${origin} → ${destDistrict} (est. ~200 km)`;
  }

  const perKm = transportPerKmRates[transportMode] || 2.0;
  const minFare = transportMinFare[transportMode] || 200;
  const oneWayFare = Math.max(Math.round(distKm * perKm), minFare);
  const roundTripFare = oneWayFare * 2;

  const hotelRate = budgetRates.hotel[hotelTier] || 3500;
  const guideRate = budgetRates.guide[hotelTier] || 4200;

  const transportTotal = roundTripFare * travelers;
  const hotelTotal = hotelRate * nights * Math.ceil(travelers / 2);
  const guideTotal = guideRate * guideDays;
  const total = transportTotal + hotelTotal + guideTotal;

  res.innerHTML = `
    <div class="budget-total">Estimated: ৳${total.toLocaleString()} BDT</div>
    <div class="budget-breakdown">
      <div><strong>Route:</strong> ${distNote}</div>
      <div><strong>Transport (${transportMode}, round-trip):</strong> ৳${transportTotal.toLocaleString()} <small>(৳${oneWayFare.toLocaleString()}/person one-way)</small></div>
      <div><strong>Accommodation (${nights} nights):</strong> ৳${hotelTotal.toLocaleString()}</div>
      <div><strong>Guide (${guideDays} days):</strong> ৳${guideTotal.toLocaleString()}</div>
    </div>
  `;
}

function showTab(tabName, btn) {
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(b => b.classList.remove('active'));
  document.getElementById(tabName + '-tab').classList.add('active');
  btn.classList.add('active');
}

function loadRouteOptions(district) {
  const container = document.getElementById('routeOptions');
  if (!container) return;
  const externalLinks = [
    { name: 'Sohoz', url: 'https://shohoz.com' },
    { name: 'GoZayan', url: 'https://gozayan.com' },
    { name: 'bdtickets', url: 'https://bdtickets.com' },
    { name: 'ShareTrip', url: 'https://sharetrip.net' }
  ];
  container.innerHTML = `
    <h5>Travel Portals</h5>
    <div class="booking-buttons">
      ${externalLinks.map(link => `<a href="${link.url}" target="_blank" class="button secondary booking-btn">${link.name}</a>`).join('')}
    </div>
  `;
}

async function searchHotels() {
  const list = document.getElementById('hotelResultsList');
  if (!list) return;
  list.innerHTML = 'Searching...';
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/hotels/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ city: document.getElementById('resultDistrict').textContent })
    });
    const data = await res.json();
    if (!data.hotels || data.hotels.length === 0) {
      list.innerHTML = 'No specific hotels found.';
      return;
    }
    list.innerHTML = data.hotels.map(h => `
      <div class="hotel-card" style="padding:12px; border:1px solid rgba(255,255,255,0.1); border-radius:12px; margin-bottom:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <strong>${h.name}</strong>
          <a href="${h.url}" target="_blank" class="button secondary" style="padding:4px 10px; font-size:0.8rem;">Visit Website</a>
        </div>
        <div style="font-size:0.85rem; color:var(--muted); margin-top:4px;">
          Rating: ${h.rating}★ | Est. ৳${h.price} / night
        </div>
      </div>
    `).join('');
  } catch (e) {
    list.innerHTML = 'Search failed.';
  }
}

function render() {
  const sourceForDivision = getFiltered(false);
  buildDivisionButtons(sourceForDivision);

  const filtered = sourceForDivision.filter((place) => {
    if (activeDivision === "all") return true;
    return getDivisionByDistrict(place[1]) === activeDivision;
  });

  updateStats(filtered);
  renderPopularGrid(filtered);
  addMapMarkers(filtered);
  focusMapOnFilteredPlace(filtered, selectedIndex);

  if (selectedIndex >= filtered.length) {
    selectedIndex = 0;
  }

  setFeatured(filtered[selectedIndex], selectedIndex);
}

// Destination-specific features removed from here, now in destination.js

async function init() {
  const searchEl = document.getElementById("search");
  if (!searchEl) return;

  const divisionSearchEl = document.getElementById("divisionSearch");
  if (divisionSearchEl) {
    divisionSearchEl.addEventListener("input", () => {
      buildDivisionButtons(getFiltered(false));
    });
  }

  buildCategoryButtons();
  buildDivisionButtons(spots);
  syncCategoryButtons();
  initFaqNavigation();
  render();

  // Initialize map
  initializeMap();

  // Load home reviews
  loadHomeReviews();
}

async function loadHomeReviews() {
  const container = document.getElementById('homeReviewsList');
  if (!container) return;
  
  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews`);
    const data = await res.json();
    const reviews = data.reviews || [];
    
    // Only 5-star reviews
    const topReviews = reviews.filter(r => r.rating === 5);
    
    if (topReviews.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:var(--muted); padding:30px 0;">No 5-star reviews yet. Be the first to share your experience!</p>';
      return;
    }
    
    container.innerHTML = topReviews.map(r => {
      const initial = (r.userName || 'T').charAt(0).toUpperCase();
      const name = r.userName || 'Traveler';
      const spot = r.spotName || 'Bangladesh';
      const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '';
      const replyHtml = r.admin_reply ? `
        <div class="review-card-reply">
          <strong><i class="fas fa-reply"></i> Admin:</strong> ${r.admin_reply}
        </div>` : '';

      return `
        <div class="review-card">
          <div class="review-card-header">
            <div class="review-card-avatar">${initial}</div>
            <div class="review-card-user">
              <div class="review-card-name">${name}</div>
              <div class="review-card-spot"><i class="fas fa-map-marker-alt" style="margin-right:4px;"></i>${spot}</div>
            </div>
          </div>
          <div class="review-card-stars">${starsHTML(r.rating)}</div>
          <div class="review-card-text">"${r.text || 'Amazing experience!'}"</div>
          ${date ? `<div class="review-card-date">${date}</div>` : ''}
          ${replyHtml}
        </div>`;
    }).join('');
  } catch (e) {
    console.error('Error loading home reviews:', e);
  }
}

function starsHTML(r) {
  let s = '';
  for (let i = 1; i <= 5; i++) {
    s += `<i class="fas fa-star" style="color:${i <= r ? '#F5A623' : '#E2E8F0'}"></i>`;
  }
  return s;
}

(async () => { 
  await init(); 
})();


// Fetch current weather from OpenWeather by city/district (Bangladesh assumed)
async function fetchWeatherFor(district) {
  const card = document.getElementById('weatherCard');
  const iconEl = document.getElementById('weatherIcon');
  const tempEl = document.getElementById('weatherTemp');
  const descEl = document.getElementById('weatherDesc');
  const sugEl = document.getElementById('weatherSuggestion');

  if (!card || !tempEl || !descEl || !sugEl || !iconEl) return;

  card.style.display = 'block';
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
    sugEl.textContent = `Real-time weather is temporarily unavailable. ${travelSuggestion(main.toLowerCase(), temp)}`;
  }
}

function chooseIcon(main, desc) {
  const m = (main || '').toLowerCase();
  if (m.includes('rain') || m.includes('drizzle') || m.includes('thunder')) return '🌧️';
  if (m.includes('cloud')) return '☁️';
  if (m.includes('snow')) return '❄️';
  return '☀️';
}

function travelSuggestion(mainLower, temp) {
  if (!mainLower) return 'No suggestion available.';
  if (mainLower.includes('rain') || mainLower.includes('drizzle') || mainLower.includes('thunder')) return 'Not recommended — expect rain. Consider postponing or carry waterproof gear.';
  if (temp >= 35) return 'Hot conditions — avoid midday travel and carry water.';
  if (temp <= 10) return 'Cold conditions — dress warmly and check transport availability.';
  return 'Good conditions for travel — proceed as planned.';
}

const OPENWEATHER_API_KEY = window.OPENWEATHER_API_KEY || 'YOUR_OPENWEATHERMAP_API_KEY';

async function fetchOpenWeatherCurrent(city) {
  const query = encodeURIComponent(`${city},BD`);
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${query}&units=metric&appid=${OPENWEATHER_API_KEY}`;
  const response = await fetch(url);

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.message || `OpenWeather request failed (${response.status})`);
  }

  const data = await response.json();
  return {
    city: data.name || city,
    temp: Math.round(data.main?.temp ?? 0),
    description: data.weather?.[0]?.description || 'clear sky',
    main: data.weather?.[0]?.main || 'Clear',
  };
}

const weatherLocationCache = new Map();

function normalizeWeatherName(name) {
  return (name ?? '').toString().trim();
}

function weatherCodeToIcon(code, isDay = true) {
  const day = isDay !== false;
  if (code === 0) return day ? '☀️' : '🌙';
  if (code === 1 || code === 2) return day ? '🌤️' : '🌥️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 57) return '🌦️';
  if (code >= 61 && code <= 67) return '🌧️';
  if (code >= 71 && code <= 77) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌤️';
}

function weatherCodeToText(code) {
  if (code === 0) return 'clear sky';
  if (code === 1) return 'mostly clear';
  if (code === 2) return 'partly cloudy';
  if (code === 3) return 'overcast';
  if (code === 45 || code === 48) return 'foggy';
  if (code >= 51 && code <= 57) return 'light drizzle';
  if (code >= 61 && code <= 67) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'showers';
  if (code >= 95) return 'thunderstorm';
  return 'weather conditions';
}

function weatherCodeToMain(code) {
  if (code === 0) return 'Clear';
  if (code === 1 || code === 2 || code === 3) return 'Clouds';
  if (code === 45 || code === 48) return 'Mist';
  if (code >= 51 && code <= 67) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain';
  if (code >= 95) return 'Thunderstorm';
  return 'Clouds';
}

function hashString(value) {
  let hash = 0;
  const text = (value ?? '').toString();
  for (let index = 0; index < text.length; index += 1) {
    hash = ((hash << 5) - hash) + text.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

function seededNumber(seed, min, max) {
  const span = max - min + 1;
  return min + (seed % span);
}

async function resolveWeatherLocation(district) {
  const name = normalizeWeatherName(district);
  if (!name) throw new Error('District name is required');

  if (weatherLocationCache.has(name)) {
    return weatherLocationCache.get(name);
  }

  const query = encodeURIComponent(`${name}, Bangladesh`);
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=1&language=en&country_code=BD&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Location lookup failed');

  const payload = await res.json();
  const place = payload?.results?.[0];
  if (!place) throw new Error(`Could not find weather location for ${name}`);

  const location = {
    name: place.name || name,
    admin1: place.admin1 || '',
    country: place.country || 'Bangladesh',
    latitude: place.latitude,
    longitude: place.longitude,
    timezone: place.timezone || 'auto',
  };

  weatherLocationCache.set(name, location);
  return location;
}

async function fetchOpenMeteoWeather(location) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,is_day&hourly=temperature_2m,weather_code,wind_speed_10m,precipitation_probability&forecast_days=7&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Weather lookup failed');
  return res.json();
}

function buildCurrentWeatherFromRealData(location, data) {
  const current = data?.current || {};
  const temp = Math.round(current.temperature_2m ?? 0);
  const code = Number(current.weather_code ?? 0);
  const isDay = current.is_day !== 0;
  const main = weatherCodeToMain(code);
  const description = weatherCodeToText(code);

  return {
    name: location.name,
    main: { temp, humidity: current.relative_humidity_2m ?? 0 },
    weather: [{ main, description, icon: weatherCodeToIcon(code, isDay) }],
    wind: { speed: current.wind_speed_10m ?? 0 },
  };
}

function buildForecastSummaryFromRealData(location, dateVal, data) {
  const hourly = data?.hourly || {};
  const times = Array.isArray(hourly.time) ? hourly.time : [];
  const temps = Array.isArray(hourly.temperature_2m) ? hourly.temperature_2m : [];
  const codes = Array.isArray(hourly.weather_code) ? hourly.weather_code : [];
  const winds = Array.isArray(hourly.wind_speed_10m) ? hourly.wind_speed_10m : [];
  const rainChance = Array.isArray(hourly.precipitation_probability) ? hourly.precipitation_probability : [];

  const indices = [];
  times.forEach((value, index) => {
    if (String(value).slice(0, 10) === dateVal) indices.push(index);
  });

  if (!indices.length) {
    return {
      available: false,
      date: dateVal,
      message: 'No real-time forecast found for that date. Try another date within the next 7 days.',
    };
  }

  let tempMin = Infinity;
  let tempMax = -Infinity;
  let windMax = 0;
  let rainChanceMax = 0;
  let bestIndex = indices[0];
  let bestScore = Infinity;
  const counts = {};

  indices.forEach((index) => {
    const temp = Number(temps[index]);
    const code = Number(codes[index] ?? 3);
    const wind = Number(winds[index] ?? 0);
    const rain = Number(rainChance[index] ?? 0);
    const hour = Number(String(times[index] || '').slice(11, 13) || 12);
    const score = rain + (hour >= 10 && hour <= 15 ? 0 : 8) + (weatherCodeToMain(code) === 'Clear' ? 0 : 5);

    const label = weatherCodeToMain(code);
    counts[label] = (counts[label] || 0) + 1;

    if (Number.isFinite(temp)) {
      tempMin = Math.min(tempMin, temp);
      tempMax = Math.max(tempMax, temp);
    }

    windMax = Math.max(windMax, Math.round(wind));
    rainChanceMax = Math.max(rainChanceMax, Math.round(rain));

    if (score < bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  const dominantMain = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Clear';
  const dominantCode = Number(codes[bestIndex] ?? 0);
  const dominantDescription = weatherCodeToText(dominantCode);
  const safety = getTripSafety(dominantMain.toLowerCase(), Math.round(tempMax), rainChanceMax, windMax);

  return {
    available: true,
    date: dateVal,
    icon: weatherCodeToIcon(dominantCode, true),
    dominantMain,
    dominantDescription,
    tempMin: Number.isFinite(tempMin) ? Math.round(tempMin) : null,
    tempMax: Number.isFinite(tempMax) ? Math.round(tempMax) : null,
    windMax,
    rainChanceMax,
    bestWindow: String(times[bestIndex] || '').slice(11, 16),
    slots: indices.length,
    safety: {
      safe: !/not recommended/i.test(safety),
      label: /not recommended/i.test(safety) ? 'Not safe for long tours' : 'Safe with caution',
      note: safety,
    },
    summary: `${dominantDescription} with up to ${rainChanceMax}% rain chance.`,
    note: safety,
  };
}

// Client-side mock weather (no server needed - works with file://)
function generateMockCurrentWeather(district) {
  const seed = hashString(district || 'Bangladesh');
  const temps = { 'Dhaka': 29, "Cox's Bazar": 28, 'Khulna': 30, 'Rangamati': 22, 'Chattogram': 27, 'Sylhet': 24 };
  const temp = (temps[district] || 28) + seededNumber(seed, -2, 2);
  const weatherRoll = seed % 100;
  const main = weatherRoll < 20 ? 'Rain' : (weatherRoll < 50 ? 'Clouds' : 'Clear');
  return {
    mock: true,
    name: district,
    dt: Math.floor(Date.now() / 1000),
    main: { temp, humidity: 70 },
    weather: [{ main, description: main === 'Clear' ? 'clear sky' : 'scattered clouds' }],
    wind: { speed: 3 }
  };
}

function generateMockForecast(district, date) {
  const slots = [];
  const seedBase = hashString(`${district}::${date}`);
  const profileRoll = seedBase % 100;
  const profile = profileRoll < 45 ? 'sunny' : (profileRoll < 80 ? 'cloudy' : 'rainy');
  const [year, month, day] = date.split('-').map(Number);
  for (let h = 0; h < 24; h += 3) {
    const dt = Math.floor(new Date(Date.UTC(year, month - 1, day, h)).getTime() / 1000);
    const slotSeed = seedBase + (h * 17);
    let main = 'Clear', desc = 'clear sky', pop = 0;
    if (profile === 'sunny') {
      if (slotSeed % 16 === 0) { main = 'Clouds'; desc = 'few clouds'; pop = 0.12; }
    } else if (profile === 'cloudy') {
      if (slotSeed % 7 < 2) { main = 'Clouds'; desc = 'broken clouds'; pop = 0.24; }
      if (slotSeed % 11 === 0) { main = 'Rain'; desc = 'light rain'; pop = 0.42; }
    } else {
      if (slotSeed % 6 < 3) { main = 'Rain'; desc = 'light rain'; pop = 0.58; }
      else if (slotSeed % 6 < 5) { main = 'Clouds'; desc = 'overcast'; pop = 0.34; }
    }
    const temps = { 'Dhaka': 28, "Cox's Bazar": 27, 'Khulna': 29, 'Rangamati': 21, 'Chattogram': 26, 'Sylhet': 23 };
    const tempBase = (temps[district] || 27) + seededNumber(slotSeed, -2, 4) + (h >= 12 && h <= 15 ? 2 : 0);
    const temp = profile === 'sunny' ? tempBase + 2 : tempBase;
    slots.push({ dt, main: { temp }, weather: [{ main, description: desc }], pop, wind: { speed: 2 + (h >= 12 ? 1 : 0) } });
  }
  return { mock: true, city: { name: district, timezone: 21600 }, list: slots };
}

function generateMockSummary(district, date, data) {
  const temps = data.list.map(s => s.main.temp);
  const tempMin = Math.min(...temps);
  const tempMax = Math.max(...temps);
  const rainChances = data.list.map(s => s.pop * 100);
  const rainChanceMax = Math.max(...rainChances);
  const winds = data.list.map(s => Math.round((s.wind?.speed || 0) * 3.6));
  const windMax = Math.max(...winds);
  const mains = data.list.map(s => s.weather?.[0]?.main || 'Clear');
  const dominantMain = mains.sort((a, b) => mains.filter(x => x === a).length - mains.filter(x => x === b).length).pop() || 'Clear';
  const desc = data.list.find(s => s.weather?.[0]?.main === dominantMain)?.weather?.[0]?.description || dominantMain.toLowerCase();
  
  let safe = true, label = 'Good for travel', note = 'Weather looks favorable.';
  if (rainChanceMax >= 45 || dominantMain.includes('Rain')) { safe = false; label = 'Not safe for long tours'; note = 'Rain expected. Carry protection or postpone.'; }
  else if (tempMax >= 35) { safe = true; label = 'Safe with caution'; note = 'Hot conditions. Avoid midday travel.'; }
  else if (tempMin <= 10) { safe = true; label = 'Safe with caution'; note = 'Cool conditions. Dress warmly.'; }
  else if (rainChanceMax >= 25) { safe = true; label = 'Safe with caution'; note = 'Some rain chance. Keep an umbrella or raincoat with you.'; }
  
  return {
    available: true,
    date,
    icon: chooseIcon(dominantMain),
    dominantMain,
    dominantDescription: desc,
    tempMin: Math.round(tempMin),
    tempMax: Math.round(tempMax),
    windMax,
    rainChanceMax: Math.round(rainChanceMax),
    bestWindow: '12:00 PM',
    slots: data.list.length,
    safety: { safe, label, note },
    summary: `Mostly ${dominantMain.toLowerCase()} with ${Math.round(rainChanceMax)}% rain chance.`,
    note
  };
}

function forecastSafeClass(summary) {
  if (!summary?.safety) return 'danger';
  if (!summary.safety.safe) return 'danger';
  const label = (summary.safety.label || '').toLowerCase();
  return label.includes('caution') ? 'warn' : 'safe';
}

function renderForecastSummary(summary, district, dateVal) {
  const tempText = summary?.tempMin != null && summary?.tempMax != null
    ? `${summary.tempMin}°C - ${summary.tempMax}°C`
    : '--°C';
  const rainText = summary?.rainChanceMax != null
    ? `Rain chance up to ${summary.rainChanceMax}%`
    : 'Rain chance unavailable';
  const windText = summary?.windMax != null
    ? `Wind up to ${summary.windMax} km/h`
    : 'Wind info unavailable';
  const safetyLabel = summary?.safety?.label || 'Weather safety unavailable';
  const safetyNote = summary?.safety?.note || summary?.summary || 'No safety note available.';
  const bestWindow = summary?.bestWindow ? `Best window: ${summary.bestWindow}` : 'Best window unavailable';
  const dominant = summary?.dominantMain || 'Weather';
  const description = summary?.dominantDescription || 'Forecast summary';
  const icon = summary?.icon || '🌤️';

  return `
    <div class="forecast-summary">
      <div class="forecast-grid">
        <div class="forecast-pill">
          <strong>${dateVal}</strong>
          <span>${district}</span>
        </div>
        <div class="forecast-pill">
          <strong>${icon} ${dominant}</strong>
          <span>${description}</span>
        </div>
        <div class="forecast-pill">
          <strong>${tempText}</strong>
          <span>Temperature range</span>
        </div>
        <div class="forecast-pill">
          <strong>${rainText}</strong>
          <span>${windText}</span>
        </div>
      </div>
      <div class="forecast-note forecast-safe ${forecastSafeClass(summary)}">${safetyLabel}</div>
      <div class="forecast-note">${safetyNote}</div>
      <div class="forecast-note">${bestWindow}</div>
    </div>
  `;
}

async function fetchForecastForDate(district, dateVal) {
  const iconEl = document.getElementById('weatherIcon');
  const tempEl = document.getElementById('weatherTemp');
  const descEl = document.getElementById('weatherDesc');
  const sugEl = document.getElementById('tripForecastOutput');
  const card = document.getElementById('weatherCard');

  if (!card || !tempEl || !descEl || !sugEl || !iconEl) return;

  card.style.display = 'block';
  tempEl.textContent = 'Loading...';
  descEl.textContent = district;
  iconEl.textContent = '⏳';
  sugEl.textContent = 'Fetching forecast for selected date...';

  try {
    const location = await resolveWeatherLocation(district);
    const apiData = await fetchOpenMeteoWeather(location);
    const summary = buildForecastSummaryFromRealData(location, dateVal, apiData);

    if (summary?.available === false) {
      throw new Error(summary.message || 'No live forecast data available');
    }

    if (summary?.available) {
      tempEl.textContent = summary.tempMin != null && summary.tempMax != null ? `${summary.tempMin}°C - ${summary.tempMax}°C` : '--°C';
      descEl.textContent = summary.dominantDescription || summary.dominantMain || 'Conditions';
      iconEl.textContent = summary.icon || '🌤️';
      sugEl.innerHTML = renderForecastSummary(summary, district, dateVal);
      return;
    }
  } catch (err) {
    const data = generateMockForecast(district, dateVal);
    const summary = generateMockSummary(district, dateVal, data);
    tempEl.textContent = summary.tempMin != null && summary.tempMax != null ? `${summary.tempMin}°C - ${summary.tempMax}°C` : '--°C';
    descEl.textContent = summary.dominantDescription || 'Conditions';
    iconEl.textContent = summary.icon || '🌤️';
    sugEl.innerHTML = renderForecastSummary(summary, district, dateVal);
  }
}

function getTripSafety(mainLower, temp, rainChance, windKph) {
  const rc = typeof rainChance === 'number' ? rainChance : 0;
  const windText = windKph != null ? `Windy (~${windKph} km/h)` : '';

  if (mainLower.includes('rain') || mainLower.includes('drizzle') || mainLower.includes('thunder') || rc >= 55) {
    return `Not recommended — expect rain. ${windText ? windText + '. ' : ''}Consider postponing or carry rain protection.`;
  }

  if (temp >= 35) {
    return `Hot conditions — avoid midday travel, rest often, and carry plenty of water.`;
  }

  if (temp <= 10) {
    return `Cool conditions — dress warmly and check local transport timings.`;
  }

  return `Good travel conditions — proceed as planned, but stay aware of quick weather changes.`;
}

