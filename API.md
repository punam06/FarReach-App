# Tourism App API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected endpoints require JWT token in `Authorization` header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### 1. User Registration
**POST** `/auth/register`

Register a new user account.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (201):**
```json
{
  "message": "Registration successful. Verify your email with OTP.",
  "otp_sent": true,
  "verificationToken": "eyJhbGciOiJIUzI1NiIs...",
  "email": "john@example.com",
  "deliveryMode": "background"
}
```

**Errors:**
- `400` - Missing required fields
- `400` - Password less than 6 characters
- `400` - Email already registered

---

### 2. User Login
**POST** `/auth/login`

Login with email and password.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepass123"
}
```

**Response (200):**
```json
{
  "message": "Login successful.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_verified": true,
    "profile_pic": "profile-123.jpg",
    "phone": "01712345678",
    "address": "123 Main St"
  }
}
```

**Response (403 - Email not verified):**
```json
{
  "error": "Email not verified. Please verify OTP.",
  "verification_required": true,
  "verificationToken": "eyJhbGciOiJIUzI1NiIs...",
  "email": "john@example.com",
  "deliveryMode": "background"
}
```

**Errors:**
- `400` - Missing email/password
- `400` - Invalid email or password
- `403` - Email not verified (requires OTP verification)

---

### 3. Verify OTP
**POST** `/auth/verify-otp`

Verify email address with OTP code.

**Headers:**
```
Authorization: Bearer <verificationToken>
```

**Request:**
```json
{
  "otp": "123456"
}
```

**Response (200):**
```json
{
  "message": "Email verified successfully.",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_verified": true,
    "profile_pic": "",
    "phone": "",
    "address": ""
  }
}
```

**Errors:**
- `400` - OTP is required
- `400` - Invalid or expired OTP
- `429` - Too many failed attempts

---

### 4. Resend OTP
**POST** `/auth/resend-otp`

Request a new OTP code.

**Headers:**
```
Authorization: Bearer <verificationToken>
```

**Response (200):**
```json
{
  "message": "OTP resent successfully.",
  "deliveryMode": "background"
}
```

**Errors:**
- `429` - Rate limit exceeded (wait before retrying)

---

### 5. Get User Profile
**GET** `/auth/me`

Get authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_verified": true,
    "profile_pic": "profile-123.jpg",
    "phone": "01712345678",
    "address": "123 Main St",
    "created_at": "2024-05-15T10:30:00Z"
  }
}
```

---

### 6. Update User Profile
**PUT** `/auth/profile`

Update user profile information and upload avatar.

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Fields:**
- `name` (string) - Full name
- `phone` (string) - Phone number
- `address` (string) - Address
- `password` (string, optional) - New password
- `profile_pic` (file, optional) - Avatar image

**Response (200):**
```json
{
  "message": "Profile updated.",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_verified": true,
    "profile_pic": "profile-1234567890.jpg",
    "phone": "01712345678",
    "address": "123 Main St"
  }
}
```

---

## 🌍 Public Endpoints

### 1. Health Check
**GET** `/health`

Check server status.

**Response:**
```json
{
  "ok": true,
  "service": "tourismapp-server"
}
```

---

### 2. Browse All Spots
**GET** `/spots`

Get all tourist spots (no authentication required).

**Query Parameters:**
- None

**Response:**
```json
{
  "spots": [
    {
      "id": 1,
      "name": "Cox's Bazar Beach",
      "district_name": "Cox's Bazar",
      "division_name": "Chattogram",
      "category": "Beach",
      "description": "Long sandy beach...",
      "history": "Historical background...",
      "image": "Coxs bazar.jpg",
      "budget_category": "Low",
      "created_at": "2024-05-15T10:30:00Z"
    },
    ...
  ]
}
```

---

### 3. Get Weather
**GET** `/weather`

Get current weather for a district (requires OpenWeather API key or returns mock data).

**Query Parameters:**
- `district` (required) - District name (e.g., "Cox's Bazar")

**Response:**
```json
{
  "weather": [
    {
      "main": "Clear",
      "description": "clear sky",
      "icon": "01d"
    }
  ],
  "main": {
    "temp": 28.5,
    "feels_like": 29.1,
    "humidity": 65,
    "pressure": 1013
  },
  "name": "Cox's Bazar",
  "sys": {
    "country": "BD"
  }
}
```

---

### 4. Get Weather Forecast
**GET** `/forecast`

Get 5-day weather forecast for a district.

**Query Parameters:**
- `district` (required) - District name
- `date` (required) - Date in YYYY-MM-DD format

**Response:**
```json
{
  "district": "Cox's Bazar",
  "date": "2024-05-20",
  "data": {
    "list": [
      {
        "dt_txt": "2024-05-20 12:00:00",
        "main": {
          "temp": 28.5,
          "humidity": 65
        },
        "weather": [
          {
            "description": "clear sky",
            "icon": "01d"
          }
        ]
      },
      ...
    ]
  }
}
```

---

### 5. Public Reviews
**GET** `/reviews/public`

Get all public reviews (no authentication required).

**Response:**
```json
{
  "reviews": [
    {
      "id": 1,
      "spot_id": 5,
      "rating": 5,
      "text": "Amazing place!",
      "user_name": "John Doe",
      "user_email": "john@example.com",
      "created_at": "2024-05-15T10:30:00Z"
    },
    ...
  ]
}
```

---

## 👤 User Dashboard Endpoints

All endpoints require authentication token.

### 1. Dashboard Overview
**GET** `/user/dashboard`

Get user's dashboard statistics.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "savedCount": 5,
  "reviewCount": 3,
  "recentReviews": [...],
  "recentSaved": [...]
}
```

---

### 2. Get User Profile
**GET** `/user/profile`

Get user's profile information.

**Response:**
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "is_verified": true,
    "profile_pic": "profile-123.jpg",
    "phone": "01712345678",
    "address": "123 Main St",
    "created_at": "2024-05-15T10:30:00Z"
  }
}
```

---

### 3. Get Saved Spots
**GET** `/user/saved-spots`

Get user's saved favorite spots.

**Response:**
```json
{
  "spots": [
    {
      "id": 5,
      "name": "Sundarbans",
      "district_name": "Khulna",
      "division_name": "Jessore",
      "category": "Wildlife",
      "image": "Sundarban_Tiger.jpg",
      "saved_at": "2024-05-15T10:30:00Z"
    },
    ...
  ]
}
```

---

### 4. Save a Spot
**POST** `/user/saved-spots/{spotId}`

Save a spot to user's favorites.

**Response:**
```json
{
  "message": "Spot saved successfully."
}
```

**Errors:**
- `400` - Spot already saved

---

### 5. Remove Saved Spot
**DELETE** `/user/saved-spots/{spotId}`

Remove a spot from favorites.

**Response:**
```json
{
  "message": "Spot removed from saved."
}
```

---

### 6. Get User Reviews
**GET** `/user/reviews`

Get user's reviews and ratings.

**Response:**
```json
{
  "reviews": [
    {
      "id": 3,
      "spot_id": 5,
      "rating": 4,
      "text": "Great place to visit",
      "spot_name": "Sundarbans",
      "spot_image": "Sundarban_Tiger.jpg",
      "created_at": "2024-05-15T10:30:00Z"
    },
    ...
  ]
}
```

---

### 7. Create Review
**POST** `/user/reviews`

Write a new review for a spot.

**Request:**
```json
{
  "spot_id": 5,
  "rating": 5,
  "text": "Amazing wildlife experience!"
}
```

**Response:**
```json
{
  "message": "Review submitted successfully.",
  "reviewId": 42
}
```

**Errors:**
- `400` - Rating is required
- `400` - Already reviewed this spot

---

### 8. Update Review
**PUT** `/user/reviews/{reviewId}`

Update an existing review.

**Request:**
```json
{
  "rating": 4,
  "text": "Updated review text"
}
```

**Response:**
```json
{
  "message": "Review updated."
}
```

---

### 9. Delete Review
**DELETE** `/user/reviews/{reviewId}`

Delete a review.

**Response:**
```json
{
  "message": "Review deleted."
}
```

---

### 10. Get Guides
**GET** `/user/guides`

Get guide recommendations for user's saved spots.

**Response:**
```json
{
  "guides": [
    {
      "id": 1,
      "name": "Ahmed Khan",
      "spot_id": 5,
      "spot_name": "Sundarbans",
      "experience": "10 years",
      "rating": 4.8,
      "languages": "Bengali, English",
      "price": 5000,
      "contact": "01712345678"
    },
    ...
  ]
}
```

---

### 11. Get Bookings
**GET** `/user/bookings`

Get user's hotel and guide bookings.

**Response:**
```json
{
  "bookings": [
    {
      "id": 1,
      "type": "hotel",
      "target_name": "Hotel X",
      "price": 3500,
      "booking_date": "2024-05-20",
      "status": "confirmed",
      "created_at": "2024-05-15T10:30:00Z"
    },
    ...
  ]
}
```

---

### 12. Create Booking
**POST** `/user/bookings`

Book a hotel or guide.

**Request:**
```json
{
  "type": "hotel",
  "target_name": "Hotel Paradise",
  "price": 3500,
  "booking_date": "2024-05-25",
  "spot_id": 5
}
```

**Response:**
```json
{
  "message": "Booking confirmed successfully!"
}
```

---

## 👨‍💼 Admin Endpoints

All endpoints require admin authentication.

### 1. Dashboard Stats
**GET** `/admin/stats`

Get platform statistics.

**Response:**
```json
{
  "spots": 45,
  "users": 125,
  "reviews": 340,
  "pending": 12
}
```

---

### 2. Manage Spots

#### Get All Spots
**GET** `/admin/spots`

#### Create Spot
**POST** `/admin/spots`

Multipart form with image upload.

#### Update Spot
**PUT** `/admin/spots/{id}`

#### Delete Spot
**DELETE** `/admin/spots/{id}`

---

### 3. Manage Divisions & Districts

#### Get Divisions
**GET** `/admin/divisions`

#### Create Division
**POST** `/admin/divisions`

#### Delete Division
**DELETE** `/admin/divisions/{id}`

---

### 4. Manage Guides

#### Get All Guides
**GET** `/admin/guides`

#### Create Guide
**POST** `/admin/guides`

#### Update Guide
**PUT** `/admin/guides/{id}`

#### Delete Guide
**DELETE** `/admin/guides/{id}`

---

### 5. User Management
**GET** `/admin/users` - List all users

**PUT** `/admin/users/{id}/role` - Update user role

**DELETE** `/admin/users/{id}` - Delete user

---

### 6. Review Management
**GET** `/admin/reviews` - List all reviews

**DELETE** `/admin/reviews/{id}` - Delete review

---

### 7. Booking Management
**GET** `/admin/bookings` - List all bookings

**PUT** `/admin/bookings/{id}/status` - Update booking status

---

## 🔧 Error Responses

All errors follow this format:

```json
{
  "error": "Error message description"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `429` - Too many requests (rate limited)
- `500` - Server error
- `503` - Service unavailable

---

## 📊 Data Models

### User
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "is_verified": true,
  "profile_pic": "profile-123.jpg",
  "phone": "01712345678",
  "address": "123 Main St",
  "created_at": "2024-05-15T10:30:00Z"
}
```

### Spot
```json
{
  "id": 5,
  "name": "Sundarbans",
  "district_id": 10,
  "division_id": 8,
  "category": "Wildlife",
  "description": "World's largest mangrove forest...",
  "history": "Historical information...",
  "image": "Sundarban_Tiger.jpg",
  "budget_category": "Low",
  "district_name": "Khulna",
  "division_name": "Jessore",
  "created_at": "2024-05-15T10:30:00Z"
}
```

### Review
```json
{
  "id": 3,
  "user_id": 1,
  "spot_id": 5,
  "rating": 4,
  "text": "Great experience",
  "user_name": "John Doe",
  "spot_name": "Sundarbans",
  "created_at": "2024-05-15T10:30:00Z"
}
```

---

## 🧪 Testing with cURL

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Get Spots
curl http://localhost:3000/api/spots

# Get Weather
curl "http://localhost:3000/api/weather?district=Cox's%20Bazar"
```

---

**Last Updated**: May 2026
**API Version**: 1.0.0
