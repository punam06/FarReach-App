# FarReach-App Test Suites Documentation

## Table of Contents
1. [Authentication Module Tests](#authentication-module-tests)
2. [Search Module Tests](#search-module-tests)
3. [Booking Reservation Module Tests](#booking-reservation-module-tests)
4. [Budget Calculation Module Tests](#budget-calculation-module-tests)

---

## Authentication Module Tests

| Test ID | Function Name | Test Input | Expected Output | Example | Status |
|---------|---------------|-----------|-----------------|---------|--------|
| AUTH-001 | checkAuth() | localStorage with valid token and user | User session restored, UI updates for logged-in state | token="abc123", user={"name":"John","role":"user"} | Pending |
| AUTH-002 | checkAuth() | localStorage with no token | User remains logged out, UI shows login button | localStorage empty | Pending |
| AUTH-003 | checkAuth() | localStorage with invalid/corrupted user JSON | Token and user removed from localStorage | localStorage.user = "{invalid json}" | Pending |
| AUTH-004 | loginUser() | email="user@example.com", password="pass123" | Successful login, token and user saved, UI updated | API returns {"token":"xyz789","user":{...}} | Pending |
| AUTH-005 | loginUser() | email="", password="pass123" | Alert shown "Please enter email and password" | Empty email field | Pending |
| AUTH-006 | loginUser() | email="user@example.com", password="" | Alert shown "Please enter email and password" | Empty password field | Pending |
| AUTH-007 | loginUser() | email="invalid@test.com", password="wrongpass" | Alert shows error from API response | API returns {"error":"Invalid credentials"} | Pending |
| AUTH-008 | loginUser() | email not verified | Alert shows "Your email is not verified yet" | API returns {"verification_required":true} | Pending |
| AUTH-009 | loginUser() | Network error during login | Alert shows "Connection error. Is the server running?" | Fetch throws error | Pending |
| AUTH-010 | updateUIForLoggedInUser() | user={"name":"John","role":"admin"} | Dashboard link shows "Admin Panel", href="/admin-dashboard" | user.role="admin" | Pending |
| AUTH-011 | updateUIForLoggedInUser() | user={"name":"Jane","role":"user"} | Dashboard link shows "Dashboard", href="/user-dashboard" | user.role="user" | Pending |
| AUTH-012 | updateUIForLoggedInUser() | user object | Login button hidden, logout button visible | loginBtn.style.display="none", logoutBtn.style.display="inline-block" | Pending |
| AUTH-013 | updateUIForLoggedInUser() | user={"name":"John"} | Login status displays "Hi, John" | loginStatus.textContent="Hi, John" | Pending |
| AUTH-014 | updateUIForLoggedOutUser() | None | Login button visible, logout button hidden, dashboard link hidden | loginBtn visible, logoutBtn hidden, dashboardLink hidden | Pending |
| AUTH-015 | logoutUser() | Valid logout action | Token and user removed from localStorage, UI updated | localStorage.clear() called | Pending |
| AUTH-016 | saveSpot() | spotId=1, token present | Spot saved, alert "Spot saved!" | API POST to /user/saved-spots/1 | Pending |
| AUTH-017 | saveSpot() | spotId=1, no token | showLoginModal() triggered | token=null | Pending |
| AUTH-018 | saveSpot() | spotId=1, token="xyz", API error | Alert shows error message | API returns {"error":"Failed to save"} | Pending |
| AUTH-019 | unsaveSpot() | spotId=1, token present | Spot removed, alert "Spot removed." | API DELETE /user/saved-spots/1 | Pending |
| AUTH-020 | unsaveSpot() | spotId=1, no token | Function returns silently | token=null | Pending |
| AUTH-021 | Token Persistence | Login → Refresh Page | User remains logged in | Token recovered from localStorage | Pending |
| AUTH-022 | Authorization Header | API call with token | Header includes "Authorization: Bearer token" | fetch with header={'Authorization':'Bearer xyz789'} | Pending |
| AUTH-023 | Login Modal | Click saveSpot without auth | Login modal opens | Modal becomes visible | Pending |
| AUTH-024 | Star Rating Click | Click star in rating | Selected rating updates, stars toggle | data.value=3, active stars displayed | Pending |

---

## Search Module Tests

| Test ID | Function Name | Test Input | Expected Output | Example | Status |
|---------|---------------|-----------|-----------------|---------|--------|
| SEARCH-001 | render() | query="Cox's Bazar" | Filtered results show only Cox's Bazar Beach | spots array filtered | Pending |
| SEARCH-002 | render() | query="" (empty) | All spots displayed | allSpots length = 20+ | Pending |
| SEARCH-003 | render() | query="beach" (lowercase) | Results include all beach-related spots | Case-insensitive search | Pending |
| SEARCH-004 | render() | query="Mountain" (uppercase) | Mountain category spots displayed | Case-insensitive search | Pending |
| SEARCH-004 | render() | query="xyz" (no match) | "No destinations found" message displayed | Grid displays message | Pending |
| SEARCH-005 | render() | currentDivision="Dhaka" | Only Dhaka division spots shown | Division filter applied | Pending |
| SEARCH-006 | render() | currentBudgetFilter="low" | Only low-budget spots displayed | Budget filter applied | Pending |
| SEARCH-007 | render() | currentRoadFilter="easy" | Only easy road condition spots shown | Road filter applied | Pending |
| SEARCH-008 | render() | currentOpportunityFilter="adventure" | Only adventure opportunity spots shown | Opportunity filter applied | Pending |
| SEARCH-009 | render() | Multiple filters: Division="Sylhet" + Budget="high" + Road="moderate" | Spots matching all criteria displayed | Intersection of filters | Pending |
| SEARCH-010 | searchDivisions() | searchInput.value="Dhaka" | Division card for Dhaka displayed with spot count | Grid shows 1 card | Pending |
| SEARCH-011 | searchDivisions() | searchInput.value="xyz" | "No divisions found" message displayed | Empty grid with message | Pending |
| SEARCH-012 | searchDivisions() | searchInput.value="" | All 8 divisions displayed with spot counts | 8 cards shown | Pending |
| SEARCH-013 | searchDivisions() | Click division card | focusDivision() called, view updates | Division filter applied | Pending |
| SEARCH-014 | searchDistricts() | searchInput.value="Chittagong" | Chittagong district and its spots shown | District card displayed | Pending |
| SEARCH-015 | searchDistricts() | searchInput.value="" | All districts displayed | Full district grid shown | Pending |
| SEARCH-016 | displayPopularGrid() | filteredSpots.length=0 | "No destinations found" message displayed | Grid message shown | Pending |
| SEARCH-017 | displayPopularGrid() | filteredSpots.length=5 | 5 spot cards created and displayed | Spot cards rendered | Pending |
| SEARCH-018 | Spot Card Display | Spot object | Card shows name, district, category, budget badge | Card.innerHTML contains spot details | Pending |
| SEARCH-019 | Image Loading | Spot with image URL | Image loads or fallback displays | img.src set correctly | Pending |
| SEARCH-020 | Category Filter | Click "Beach" button | Only beach spots displayed, button marked active | currentCategory="Beach" | Pending |
| SEARCH-021 | Category Reset | Click "All" button | All categories shown, active state reset | currentCategory="All" | Pending |
| SEARCH-022 | Stats Update | After filter applied | "Showing X destinations" text updates | stats.textContent updates | Pending |
| SEARCH-023 | Featured Spot | render() called | Random featured spot selected from filtered results | displayFeatured() called | Pending |
| SEARCH-024 | Search Input Trim | query="  Cox's Bazar  " (with spaces) | Search performs on trimmed value | Spaces removed, search executes | Pending |
| SEARCH-025 | Budget Filter Options | Select "high" | Profile.budget="high" applied to filtering | High-budget spots shown | Pending |
| SEARCH-026 | Road Condition Filter | Select "challenging" | Only challenging road spots shown | Road condition filtered | Pending |
| SEARCH-027 | Opportunity Filter | Select "wildlife" | Opportunity="wildlife" spots shown | Wildlife opportunity filtered | Pending |
| SEARCH-028 | Filter Combination: All Three | Budget="low" + Road="easy" + Opportunity="family" | Spots matching all three criteria | Intersection results | Pending |
| SEARCH-029 | Division Focus | Click "Chattogram" division card | currentDivision="Chattogram", all filters reset | Division focus applied | Pending |
| SEARCH-030 | Search Hint | Query="beach", results=5 | Text shows 'Found 5 destinations matching "beach"' | Hint text updates | Pending |

---

## Booking Reservation Module Tests

| Test ID | Function Name | Test Input | Expected Output | Example | Status |
|---------|---------------|-----------|-----------------|---------|--------|
| BOOK-001 | searchHotels() | hotelType="Luxury", city="Dhaka", people=2, checkin="2026-05-20", checkout="2026-05-22" | Hotel results displayed with prices and details | 3 hotel cards shown | Pending |
| BOOK-002 | searchHotels() | checkin="" (empty) | Alert "Please select check-in and check-out dates" | Form validation fails | Pending |
| BOOK-003 | searchHotels() | checkout="" (empty) | Alert "Please select check-in and check-out dates" | Form validation fails | Pending |
| BOOK-004 | searchHotels() | API returns error | Error message displayed from API | "Searching hotels..." replaced with error | Pending |
| BOOK-005 | searchHotels() | Network error | "Search failed: [error message]" displayed | Fetch throws error | Pending |
| BOOK-006 | Hotel Card Display | Hotel object | Card shows name, rating, type, features, price/night, total price | 5 details displayed | Pending |
| BOOK-007 | Price Calculation | hotelPrice=3000, nights=2, people=2 | Total = (3000 + VAT + Service) × 2 | VAT=450, Service=300, Total=7500 | Pending |
| BOOK-008 | VAT Calculation | pricePerNight=3000 | VAT = 3000 × 0.15 = 450 | VAT correctly calculated | Pending |
| BOOK-009 | Service Charge | pricePerNight=3000 | Service = 3000 × 0.10 = 300 | Service charge correctly calculated | Pending |
| BOOK-010 | Total Price Display | Hotel with all charges | Total displayed with ৳ symbol | "৳7,500" shown | Pending |
| BOOK-011 | bookHotel() | No token | showLoginModal() triggered | User prompted to login | Pending |
| BOOK-012 | bookHotel() | Token present, profile complete | POST to /user/bookings with booking details | API call succeeds | Pending |
| BOOK-013 | bookHotel() | Token present, profile incomplete (no phone) | Alert "Please complete your profile" + redirect | Profile completion required | Pending |
| BOOK-014 | bookHotel() | Token present, profile incomplete (no address) | Alert "Please complete your profile" + redirect | Profile completion required | Pending |
| BOOK-015 | Booking Confirmation | Successful booking | Alert shows hotel name, total, dates | "Booking confirmed for [hotel]..." | Pending |
| BOOK-016 | Booking Error | API returns error | Alert displays error message from API | API error shown | Pending |
| BOOK-017 | bookHotel() | Network error | Alert "Connection error" | Fetch throws error | Pending |
| BOOK-018 | hireGuide() | No token | showLoginModal() triggered | User prompted to login | Pending |
| BOOK-019 | hireGuide() | Token present, profile complete | POST to /user/bookings with guide details | Guide booking created | Pending |
| BOOK-020 | hireGuide() | Token present, profile incomplete | Alert "Please complete your profile" | Profile completion required | Pending |
| BOOK-021 | Guide Card Display | Guide object | Card shows name, experience, rating, languages, specialties, price | 6 details displayed | Pending |
| BOOK-022 | Guide Rating Display | rating=4.7 | Stars displayed: "★★★★☆" | 4 full stars, 1 empty | Pending |
| BOOK-023 | loadHistory() | User not logged in | "Please login to see your booking history." message | No token, message shown | Pending |
| BOOK-024 | loadHistory() | User logged in, 0 bookings | "No booking history found." message | Empty history | Pending |
| BOOK-025 | loadHistory() | User logged in, 3 bookings | 3 history items displayed with details | Type, name, date, price, status shown | Pending |
| BOOK-026 | History Item Display | Booking object | Shows booking type, target name, date, price, status | All details rendered | Pending |
| BOOK-027 | showPriceBreakdown() | pricePerNight=3500, nights=2 | Breakdown shows base, VAT, service, total | Price details displayed | Pending |
| BOOK-028 | Corporate Rate Display | hasCorporateRate=true | Message "✓ Corporate Rate Available" shown | Green checkmark displayed | Pending |
| BOOK-029 | resetHotelForm() | Form filled with data | All fields cleared, results hidden | Form empty, results.display="none" | Pending |
| BOOK-030 | External Booking Links | Hotel results displayed | Links to Sohoz, GoZayan, bdtickets, etc. shown | 5+ booking site links displayed | Pending |
| BOOK-031 | Hotel Search Results Layout | Multiple hotels returned | Results container visible, list populated | hotelResults.style.display="block" | Pending |
| BOOK-032 | Booking with Spot ID | Spot selected | Booking includes spot_id | payload.spot_id=currentSelectedSpot.id | Pending |
| BOOK-033 | Guide Hiring Confirmation | Successful hire | Alert "Guide [name] hired for ৳[price]/day!" | Confirmation message | Pending |
| BOOK-034 | Date Picker Constraints | Check-in date | Min date = today, max date = today + 5 days | Dates within 5-day window | Pending |

---

## Budget Calculation Module Tests

| Test ID | Function Name | Test Input | Expected Output | Example | Status |
|---------|---------------|-----------|-----------------|---------|--------|
| BUDGET-001 | calculateBudgetLocally() | spot, travelers=1, nights=1, guideDays=0, transport="bus", hotelTier="standard" | Budget object with breakdown returned | {total: 5840, breakdown: {...}} | Pending |
| BUDGET-002 | calculateBudgetLocally() | travelers=0 (invalid) | travelers converted to 1 | Math.max(1, 0) = 1 | Pending |
| BUDGET-003 | calculateBudgetLocally() | nights=-5 (invalid) | nights converted to 1 | Math.max(1, -5) = 1 | Pending |
| BUDGET-004 | calculateBudgetLocally() | travelers="abc" (non-numeric) | Treated as 0, defaults to 1 | Number("abc") = NaN → 1 | Pending |
| BUDGET-005 | calculateBudgetLocally() | Transport="bus" | transport cost = 900 × travelers × multiplier | Base rate 900 BDT | Pending |
| BUDGET-006 | calculateBudgetLocally() | Transport="train" | transport cost = 1200 × travelers × multiplier | Base rate 1200 BDT | Pending |
| BUDGET-007 | calculateBudgetLocally() | Transport="launch" | transport cost = 750 × travelers × multiplier | Base rate 750 BDT | Pending |
| BUDGET-008 | calculateBudgetLocally() | Transport="air" | transport cost = 6500 × travelers × multiplier | Base rate 6500 BDT | Pending |
| BUDGET-009 | calculateBudgetLocally() | Transport="unknown" | Defaults to bus rate (900) | Unknown mode → 900 BDT | Pending |
| BUDGET-010 | calculateBudgetLocally() | hotelTier="budget" | hotel cost = 1800 × nights × travelers × multiplier | Budget tier 1800 BDT/night | Pending |
| BUDGET-011 | calculateBudgetLocally() | hotelTier="standard" | hotel cost = 3500 × nights × travelers × multiplier | Standard tier 3500 BDT/night | Pending |
| BUDGET-012 | calculateBudgetLocally() | hotelTier="premium" | hotel cost = 7000 × nights × travelers × multiplier | Premium tier 7000 BDT/night | Pending |
| BUDGET-013 | calculateBudgetLocally() | profile.budget="high", spot type "Beach" | transport multiplier = 1.2, hotel multiplier = 1.15 | High budget increases costs | Pending |
| BUDGET-014 | calculateBudgetLocally() | profile.budget="low" | multiplier = 1.0 (no increase) | Low budget uses base rates | Pending |
| BUDGET-015 | calculateBudgetLocally() | guideDays=3, hotelTier="standard" | guide cost = 4200 × 3 = 12,600 | Guide rate 4200 BDT/day | Pending |
| BUDGET-016 | calculateBudgetLocally() | guideDays=0 | guide cost = 0 | No guide selected | Pending |
| BUDGET-017 | calculateBudgetLocally() | Activity opportunity="leisure" | activity cost = 1200 × travelers | Leisure activity 1200 BDT | Pending |
| BUDGET-018 | calculateBudgetLocally() | Activity opportunity="adventure" | activity cost = 1800 × travelers | Adventure activity 1800 BDT | Pending |
| BUDGET-019 | calculateBudgetLocally() | Activity opportunity="culture" | activity cost = 1000 × travelers | Culture activity 1000 BDT | Pending |
| BUDGET-020 | calculateBudgetLocally() | Activity opportunity="wildlife" | activity cost = 1500 × travelers | Wildlife activity 1500 BDT | Pending |
| BUDGET-021 | calculateBudgetLocally() | Activity opportunity="eco" | activity cost = 1100 × travelers | Eco activity 1100 BDT | Pending |
| BUDGET-022 | calculateBudgetLocally() | Activity opportunity="family" | activity cost = 900 × travelers | Family activity 900 BDT | Pending |
| BUDGET-023 | calculateBudgetLocally() | All costs calculated | contingency = 10% of (transport + hotel + guide + activity) | Contingency = 0.1 × sum | Pending |
| BUDGET-024 | calculateBudgetLocally() | travelers=4, nights=3 | total = sum of all 5 components | Accurate total calculation | Pending |
| BUDGET-025 | Spot Override - Nilgiri | Nilgiri spot | budget="high", road="challenging", opportunity="adventure" | Override applied | Pending |
| BUDGET-026 | Spot Override - Bandarban | Bandarban spot | budget="high", road="challenging", opportunity="adventure" | Override applied | Pending |
| BUDGET-027 | Spot Override - Chittagong Hill Tracts | Chittagong Hill Tracts spot | budget="high", road="challenging", opportunity="adventure" | Override applied | Pending |
| BUDGET-028 | calculateBudget() | API available | POST to /spots/{id}/budget-estimate, result rendered | API call succeeds | Pending |
| BUDGET-029 | calculateBudget() | API error | Fallback to calculateBudgetLocally() | Local calculation used | Pending |
| BUDGET-030 | calculateBudget() | Network error | Fallback to calculateBudgetLocally() | Local calculation used | Pending |
| BUDGET-031 | renderBudgetResult() | result object | Budget total displayed with ৳ symbol and formatter | "৳5,840" shown | Pending |
| BUDGET-032 | renderBudgetResult() | result with breakdown | All 6 components displayed: travel, hotel, food, guide, activities, contingency | Table rendered | Pending |
| BUDGET-033 | Budget Display Format | Numbers in breakdown | Thousands separators applied | "৳1,200" not "৳1200" | Pending |
| BUDGET-034 | updateBudgetSection() | New spot selected | Budget calculation triggered | calculateBudget() called | Pending |
| BUDGET-035 | updateBudgetSection() | Badge display | Shows "Premium plan" or "Budget plan" | Badge.textContent updates | Pending |
| BUDGET-036 | updateBudgetSection() | Loading state | "Calculating estimate..." message shown | Result text during load | Pending |
| BUDGET-037 | Result Accuracy | travelers=2, nights=3, transport="bus", hotel="standard" | Total = (transport + hotel + guide + activity + contingency) | Calculation verified | Pending |
| BUDGET-038 | Edge Case - Very Large Group | travelers=50 | Budget calculated without overflow | Result accurate for 50 people | Pending |
| BUDGET-039 | Edge Case - Extended Stay | nights=30 | Budget calculated correctly | 30-night total accurate | Pending |
| BUDGET-040 | Rounding | Decimal amounts in calculation | All results rounded to whole numbers | No decimals in final output | Pending |

---

# Detailed Test Suite Descriptions

## 1. Authentication Module - Comprehensive Description

### Overview
The authentication module manages user login/logout, session management, and UI state updates based on authentication status. It uses localStorage to persist user tokens and data, and communicates with the backend API for credential verification.

### Core Functionalities

#### Token & Session Management (AUTH-001 to AUTH-003)
- **Purpose**: Ensure tokens are correctly stored, retrieved, and cleaned up
- **Critical Path**: User login → Token saved → Page refresh → Token recovered
- **Failure Scenarios**: 
  - Corrupted token data in localStorage should be cleared
  - Missing user data should not break session check
  - Expired tokens should not allow API access

#### Login Process (AUTH-004 to AUTH-009)
- **Purpose**: Authenticate user credentials and establish session
- **Input Validation**:
  - Both email and password required
  - Email format validation (basic)
  - Password minimum requirements (if any)
- **API Integration**:
  - POST to `/api/auth/login` with email and password
  - Expects response: `{token: string, user: object}`
  - Handle 401/403 unauthorized responses
  - Verify email requirement before account access
- **Error Handling**:
  - Network errors: "Connection error" alert
  - Invalid credentials: Show API error message
  - Unverified email: Redirect to verification page
  - Server errors: Display appropriate messages

#### UI State Management (AUTH-010 to AUTH-015)
- **Purpose**: Update interface elements based on authentication state
- **Logged-In State**:
  - Hide: Login button, Signup button
  - Show: Logout button, Dashboard link, Login status
  - Dashboard href based on user role (admin vs user)
  - Rating form becomes visible
- **Logged-Out State**:
  - Show: Login button, Signup button
  - Hide: Logout button, Dashboard link
  - Clear login status text
  - Rating form hidden
- **Role-Based Display**:
  - Admin users: "⚙️ Admin Panel" → `/admin-dashboard`
  - Regular users: "📊 Dashboard" → `/user-dashboard`

#### Protected Operations (AUTH-016 to AUTH-020)
- **saveSpot(spotId)**: Requires token, adds Authorization header
- **unsaveSpot(spotId)**: Requires token, DELETE method
- **Flow**: Check token → Show login if missing → Make API call → Handle response
- **Authorization Header Format**: `Authorization: Bearer {token}`

#### Session Persistence (AUTH-021 to AUTH-022)
- **Test**: Close browser/tab → Reopen page → User still logged in
- **Implementation**: localStorage survives page refreshes
- **Logout**: Must clear both token and user from localStorage
- **Security**: Token in Authorization header, not exposed in URL/query params

#### User Data Handling (AUTH-024)
- **Star Rating System**: Click handler updates UI
- **Rating Value**: Data attribute contains 1-5 value
- **Visual Feedback**: Stars update (★ vs ☆) based on selection
- **Persistence**: Rating value sent with review submission

### Test Execution Strategy
1. Mock localStorage operations
2. Mock fetch API for login endpoint
3. Test each authentication state transition
4. Verify UI updates for each state
5. Test error scenarios with various API responses
6. Verify Authorization headers in protected calls

---

## 2. Search Module - Comprehensive Description

### Overview
The search module enables users to discover tourist spots through multiple filtering dimensions: text search, division/district, category, budget, road conditions, and opportunity types. It provides real-time filtering with dynamic result updates.

### Core Functionalities

#### Text Search (SEARCH-001 to SEARCH-004)
- **Purpose**: Find spots by name, district, or category keywords
- **Features**:
  - Case-insensitive search
  - Partial word matching (substring search)
  - Multi-field search: spot name, district, category, opportunity type
  - Trim whitespace from input
- **Search Scope**:
  - Spot name: "Cox's Bazar Beach"
  - District: "Khulna", "Dhaka"
  - Category: "Beach", "Wildlife", "Mountain"
  - Opportunity: "adventure", "leisure", "culture"
- **No Results**: Display "No destinations found. Try different search terms."

#### Division Filtering (SEARCH-005 to SEARCH-013)
- **Divisions** (8 total): Dhaka, Chattogram, Sylhet, Rangpur, Barishal, Jessore, Rajshahi, Mymensingh
- **Division Search**:
  - Filter divisions by name
  - Display spot count for each division
  - Show/hide divisions based on search query
  - Click division → Filter to that division, reset other filters
- **District-to-Division Mapping**:
  - Each district belongs to one division
  - Division filter applies to all districts in that division
- **Search Behavior**:
  - Empty query → Show all divisions
  - Partial match → Filter divisions
  - No matches → "No divisions found" message

#### Category Filtering (SEARCH-020 to SEARCH-021)
- **Categories**: Beach, Wildlife, Island, Mountain, Nature, Historical, Lake
- **Button UI**: Category chips show active state
- **Filtering**:
  - Click category → Filter spots to that category
  - Click "All" → Reset category filter
  - Update active button state
- **Integration**: Works with other filters (intersection)

#### Multi-Dimensional Filters (SEARCH-006 to SEARCH-009, SEARCH-025 to SEARCH-028)
- **Budget Levels**:
  - Low Budget: Economy accommodations, basic services
  - High Budget: Premium services, better facilities
  - All: No budget restriction
- **Road Conditions**:
  - Easy: Well-maintained roads, accessible
  - Moderate: Some rough sections, okay condition
  - Challenging: Difficult terrain, requires planning
- **Opportunity Types**:
  - Leisure: Beach, relaxation-focused
  - Adventure: Trekking, outdoor activities
  - Culture: Historical sites, cultural experiences
  - Wildlife: Animal viewing, nature reserves
  - Eco: Ecological tourism, conservation
  - Family: Kid-friendly, group activities
- **Filter Logic**: All active filters apply (AND operation)
  - Budget="low" AND Road="easy" AND Opportunity="family" → Only spots matching all three

#### Spot Card Display (SEARCH-018 to SEARCH-019)
- **Card Information**:
  - Spot name (heading)
  - District (location)
  - Category badge (Beach, Wildlife, etc.)
  - Budget badge (High Budget / Low Budget)
  - Image (with fallback to placeholder)
  - Save button (heart icon)
- **Interactivity**: Click card → Select spot → Scroll to details
- **Images**: 
  - Use spot-pictures/{imageName} if available
  - Fallback: Gradient placeholder or unsplash image

#### Statistics Display (SEARCH-022)
- **Updates on filter change**:
  - "Showing all X destinations" (no filters)
  - "Found X destinations matching "query"" (search active)
  - "Found X destinations" (filters active)
- **Stat Elements**: Total places, total districts, active filters

#### Featured Spot (SEARCH-023)
- **Selection**: Random spot from filtered results
- **Display**: Featured card with background image and details
- **Click Handler**: Link to detailed view of featured spot

#### State Management (SEARCH-030)
- **Filter State Variables**:
  - `currentDivision`: Current division filter
  - `currentCategory`: Current category filter
  - `currentBudgetFilter`: Budget level
  - `currentRoadFilter`: Road condition
  - `currentOpportunityFilter`: Opportunity type
- **Reset on Division Focus**: All filters except division reset
- **Render Function**: Called whenever state changes

### Test Execution Strategy
1. Create mock spots array with various categories, districts, budgets
2. Test each filter independently
3. Test filter combinations
4. Verify result counts and accuracy
5. Test search text matching across all fields
6. Verify UI updates for cards, buttons, and stats
7. Test edge cases: empty results, special characters, unicode text

---

## 3. Booking Reservation Module - Comprehensive Description

### Overview
The booking module enables users to reserve hotels and hire tour guides. It handles date validation, price calculations including taxes, user profile verification, and booking history tracking.

### Core Functionalities

#### Hotel Search (BOOK-001 to BOOK-005)
- **Search Parameters**:
  - Hotel Type: Luxury, Budget, Boutique, Standard
  - City: Destination name
  - Number of People: Guest count
  - Features: WiFi, AC, Pool, Restaurant, etc.
  - Check-in Date: Start of stay
  - Check-out Date: End of stay
- **Validation**:
  - Both check-in and checkout dates required
  - Alert if either date missing: "Please select check-in and check-out dates"
- **API Call**:
  - POST to `/api/hotels/search`
  - Payload: {hotelType, city, people, features, checkin, checkout}
  - Response: {hotels: [], searchParams: {nights, ...}}
- **Error Handling**:
  - API error: Display error message from server
  - Network error: "Search failed: [error message]"
  - Show "Searching hotels..." loading state during fetch

#### Hotel Card Display (BOOK-006)
- **Information Shown**:
  - Hotel name (heading)
  - Star rating (★/☆ symbols)
  - Rating number (4.5/5)
  - Hotel type (Luxury, Budget, etc.)
  - Features (WiFi, AC, Pool, etc.)
  - Price per night (৳)
  - Total price (৳) for stay duration + VAT + Service
  - Corporate rate indicator (if available)
  - Portal links (Booking.com, Agoda, etc.)
- **Buttons**:
  - "Book Now" → Trigger booking
  - "Price Details" → Show breakdown modal

#### Price Calculations (BOOK-007 to BOOK-010)
- **Base Calculation**:
  - Subtotal = Price per night × Number of nights
- **VAT (15%)**:
  - VAT = Price per night × 0.15
  - Applied per night: VAT × nights
- **Service Charge (10%)**:
  - Service = Price per night × 0.10
  - Applied per night: Service × nights
- **Total**:
  - Total = (Price + VAT + Service) × nights
  - Example: 3000/night for 2 nights
    - VAT = 3000 × 0.15 = 450
    - Service = 3000 × 0.10 = 300
    - Total = (3000 + 450 + 300) × 2 = 7500
- **Display Format**: ৳ symbol with thousands separator (৳7,500)

#### Booking Hotel (BOOK-011 to BOOK-017)
- **Authentication Check**:
  - If no token → showLoginModal()
  - If token present → Check profile completion
- **Profile Requirement**:
  - Phone number required
  - Address required
  - If missing → Alert "Please complete your profile..." and redirect to `/user-dashboard#profile`
- **API Call**:
  - POST to `/api/user/bookings`
  - Headers: Authorization: Bearer {token}
  - Payload: {type: "hotel", target_name, price, booking_date, spot_id}
  - Response: {success: true} or {error: string}
- **Success Flow**:
  - Alert displays: "Booking confirmed for [hotel]!\nTotal: ৳[price]\nCheck-in: [date]\nCheck-out: [date]"
  - loadHistory() called to update booking list
- **Error Handling**:
  - API error: Alert displays error message from server
  - Network error: Alert "Connection error"

#### Guide Hiring (BOOK-018 to BOOK-023)
- **Guide Information**:
  - Name, Experience (years), Rating (0-5)
  - Languages spoken (Bengali, English, Arabic, etc.)
  - Specialties (History, Photography, Wildlife, etc.)
  - Daily rate in ৳
- **Hiring Process**:
  - Same authentication and profile checks as hotel booking
  - POST to `/api/user/bookings` with type="guide"
  - Payload: {type: "guide", target_name: guideName, price, booking_date, spot_id}
  - Success alert: "Guide [name] hired for ৳[price]/day!"
  - loadHistory() called after success

#### Booking History (BOOK-024 to BOOK-027)
- **Unauthenticated**: "Please login to see your booking history."
- **No Bookings**: "No booking history found."
- **With Bookings**: Display list of booking items
- **Booking Item Details**:
  - Type: Hotel, Guide, etc. (capitalized)
  - Target Name: Hotel or guide name
  - Date: Formatted as locale date string
  - Price: ৳ display
  - Status: PENDING, COMPLETED, CANCELLED (uppercase)
  - View Details button for each booking
- **Loading**: API call to GET `/api/user/bookings`

#### Price Breakdown Modal (BOOK-028 to BOOK-029)
- **Display Elements**:
  - Base price per night
  - Number of nights
  - Subtotal
  - VAT calculation (15%)
  - Service charge (10%)
  - Total with all charges
  - Corporate rate note (if applicable)
- **Toggle**: Price Details button opens/closes modal

#### Form Management (BOOK-030)
- **Reset Function**: Clear all input fields
  - hotelType, hotelCity, hotelPeople, hotelFeatures, checkinDate, checkoutDate
  - Hide results container
  - Hide price calculator
- **Field Inputs**:
  - Hotel type dropdown
  - City text input
  - People number input
  - Features text input
  - Date pickers for check-in/checkout

#### External Booking Links (BOOK-031)
- **Platforms**: Sohoz, GoZayan, bdtickets, ShareTrip, Jatri
- **Display**: Multiple buttons/links to external booking sites
- **Action**: Open in new tab when clicked
- **Purpose**: Users can book through preferred platforms

### Test Execution Strategy
1. Mock hotel search API responses
2. Test form validation (required fields)
3. Test price calculations with various inputs
4. Mock user authentication and profile data
5. Test booking confirmation flow
6. Test error scenarios (API errors, network issues)
7. Test history loading with different booking counts
8. Verify all API calls include proper headers

---

## 4. Budget Calculation Module - Comprehensive Description

### Overview
The budget calculation module estimates trip costs based on destination characteristics, travel parameters (travelers, nights, mode), and accommodation/activity preferences. It uses both local calculations and optional backend API with automatic fallback.

### Core Functionalities

#### Input Parameters (BUDGET-001 to BUDGET-004)
- **Travelers**:
  - Valid range: 1 to 50+
  - Default: 1 (if 0 or negative provided)
  - Type: Number input field
  - Affects: Transport, hotel, activity costs
- **Nights**:
  - Valid range: 1 to 30+
  - Default: 1 (if 0 or negative provided)
  - Type: Number input field
  - Affects: Hotel cost (multiplied by nights)
- **Guide Days**:
  - Valid range: 0 (no guide) to multiple days
  - Type: Number input field
  - Default: 0
  - Affects: Guide hiring cost
- **Transport Mode**:
  - Options: bus, train, launch, air
  - Default: bus
  - Type: Dropdown selector
- **Hotel Tier**:
  - Options: budget, standard, premium
  - Default: standard
  - Type: Dropdown selector

#### Transport Cost Calculation (BUDGET-005 to BUDGET-009)
- **Base Rates**:
  - Bus: 900 BDT
  - Train: 1200 BDT
  - Launch: 750 BDT
  - Air: 6500 BDT
  - Unknown mode: defaults to bus (900)
- **Calculation**:
  - Transport = Base Rate × Number of Travelers × Budget Multiplier
  - Budget Multiplier: 1.2 (high budget) or 1.0 (low budget)
  - Example: Bus for 3 travelers, low budget = 900 × 3 × 1.0 = 2700

#### Accommodation Cost Calculation (BUDGET-010 to BUDGET-014)
- **Base Rates per Night**:
  - Budget tier: 1800 BDT/night
  - Standard tier: 3500 BDT/night
  - Premium tier: 7000 BDT/night
- **Calculation**:
  - Hotel = Base Rate × Number of Nights × Number of Travelers × Budget Multiplier
  - Budget Multiplier: 1.15 (high budget) or 1.0 (low budget)
  - Example: Standard hotel, 2 travelers, 3 nights, high budget = 3500 × 3 × 2 × 1.15 = 24,150

#### Guide Cost Calculation (BUDGET-015 to BUDGET-016)
- **Base Rates per Day**:
  - Budget tier: 2800 BDT/day
  - Standard tier: 4200 BDT/day
  - Premium tier: 6500 BDT/day
- **Calculation**:
  - Guide = Base Rate × Number of Guide Days
  - No multiplier applied
  - Example: Standard guide for 3 days = 4200 × 3 = 12,600

#### Activity Cost Calculation (BUDGET-017 to BUDGET-022)
- **Base Rates per Person**:
  - Leisure: 1200 BDT
  - Culture: 1000 BDT
  - Adventure: 1800 BDT
  - Eco: 1100 BDT
  - Wildlife: 1500 BDT
  - Family: 900 BDT
- **Calculation**:
  - Activity = Base Rate × Number of Travelers
  - Determined by spot's opportunity type profile
  - Example: Adventure activity, 4 travelers = 1800 × 4 = 7200

#### Contingency & Total (BUDGET-023 to BUDGET-024)
- **Contingency Calculation**:
  - Contingency = 10% of (Transport + Hotel + Guide + Activity)
  - Provides buffer for unexpected expenses
  - Example: If total costs = 10,000, contingency = 1,000
- **Final Total**:
  - Total = Transport + Hotel + Guide + Activity + Contingency
  - All amounts rounded to whole numbers (no decimals)

#### Spot Profile Classification (BUDGET-025 to BUDGET-027)
- **Default Categories**:
  - Beach: budget=high, road=easy, opportunity=leisure
  - Wildlife: budget=low, road=moderate, opportunity=wildlife
  - Island: budget=high, road=moderate, opportunity=leisure
  - Mountain: budget=high, road=challenging, opportunity=adventure
  - Nature: budget=low, road=easy, opportunity=eco
  - Historical: budget=low, road=easy, opportunity=culture
  - Lake: budget=low, road=easy, opportunity=family
- **Spot-Specific Overrides**:
  - Nilgiri: budget=high, road=challenging, opportunity=adventure
  - Bandarban: budget=high, road=challenging, opportunity=adventure
  - Chittagong Hill Tracts: budget=high, road=challenging, opportunity=adventure
- **Multiplier Application**:
  - High budget multipliers: Transport ×1.2, Hotel ×1.15
  - Low budget multipliers: ×1.0 (no increase)

#### API Call & Fallback (BUDGET-028 to BUDGET-030)
- **Primary Method**:
  - POST to `/api/spots/{spotId}/budget-estimate`
  - Payload: {travelers, nights, guideDays, transportMode, hotelTier}
  - Expected response: {estimate: {total, breakdown: {...}}}
- **Fallback Trigger**:
  - API error (non-200 response)
  - Network error (fetch throws)
  - Automatic fallback to `calculateBudgetLocally()`
- **Fallback Method**:
  - Uses same calculation logic as local method
  - Guarantees budget always displays (no blank results)

#### Result Display (BUDGET-031 to BUDGET-033)
- **Total Display**:
  - Format: "৳[amount]" with thousands separators
  - Example: ৳5,840 (not ৳5840)
  - Positioned as prominent heading
- **Breakdown Display**:
  - Component: Travel tickets (transport)
  - Component: Hotel booking
  - Component: Food & Misc (part of activity/misc)
  - Component: Guide booking
  - Component: Local activities
  - Component: Contingency (buffer)
  - Each line: [Label] [Amount in ৳ with separator]

#### Update Triggers (BUDGET-034 to BUDGET-036)
- **Spot Selection**:
  - `updateBudgetSection(spot)` called
  - Badge updated: "Premium plan" (high budget) or "Budget plan" (low budget)
  - calculateBudget() triggered
  - "Calculating estimate..." message shown during load
- **User Input Change**:
  - Budget form inputs (travelers, nights, mode, tier) when changed
  - calculateBudget() re-triggered
- **Tab Switch**:
  - Budget tab activated
  - Recalculation triggered if needed

#### Edge Cases & Validation (BUDGET-037 to BUDGET-040)
- **Large Groups**: travelers=50
  - Budget calculated without overflow
  - All amounts remain valid numbers
- **Extended Stays**: nights=30
  - Accurate calculation for long trips
  - Hotel costs correctly multiplied
- **Rounding**:
  - All final amounts rounded to whole numbers
  - No floating-point decimals in display
  - Mathematically correct (no truncation errors)
- **Data Type Validation**:
  - Non-numeric inputs treated as 0, then defaulted to minimum
  - NaN values prevented
  - Infinity values prevented

### Calculation Example Walkthrough
**Scenario**: 2 travelers, 3 nights, standard hotel, bus transport, 2 guide days, visiting Cox's Bazar Beach (low budget, leisure)

1. **Transport**: 900 (bus) × 2 (travelers) × 1.0 (low budget) = 1,800
2. **Hotel**: 3,500 (standard) × 3 (nights) × 2 (travelers) × 1.0 (low budget) = 21,000
3. **Guide**: 4,200 (standard) × 2 (days) = 8,400
4. **Activity**: 1,200 (leisure) × 2 (travelers) = 2,400
5. **Subtotal**: 1,800 + 21,000 + 8,400 + 2,400 = 33,600
6. **Contingency**: 33,600 × 0.1 = 3,360
7. **Total**: 33,600 + 3,360 = 36,960 BDT

### Test Execution Strategy
1. Create mock spot objects with various profiles
2. Test each cost component independently
3. Test all multiplier combinations
4. Test spot-specific overrides
5. Mock API responses and errors
6. Verify fallback calculation matches local calculation
7. Test display formatting (separators, currency symbol)
8. Test with edge case inputs (very large, very small)
9. Verify contingency calculation accuracy
10. Test UI updates when inputs change

