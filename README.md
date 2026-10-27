# iMovies — Prime Video Style Movie Ticket Booking Web Application

A production-ready, full-stack Movie Ticket Booking Web Application named **"iMovies"** featuring a sleek, dark **Amazon Prime Video aesthetic** (`#0f171e` deep dark blue-black, `#1a242f` surface cards, `#00a8e1` vibrant cyan highlights, horizontal carousel rows with smooth card scaling).

---

## 1. Architecture & Tech Stack

### Client
- **Framework**: React.js (Vite bundle)
- **Routing**: React Router DOM (Lazy loading with Suspense)
- **Styling**: Tailwind CSS + Amazon Prime Video Design System
- **Icons**: Lucide React
- **Notifications**: React-Toastify (Dark themed)
- **HTTP Client**: Axios with JWT Bearer Interceptors

### Server
- **Runtime**: Node.js + Express.js REST API
- **Authentication**: JWT (JSON Web Tokens) session validation with HTTP Bearer headers
- **Password Security**: Bcrypt.js password hashing with salt rounds
- **CORS & Middleware**: Strict CORS whitelist, Morgan logging, Error handling

### Database
- **ODM**: MongoDB (Mongoose) with dual-mode fallback persistence engine
- **Schemas**:
  1. `userModel.js`: `username`, `email`, `password`
  2. `adminModel.js`: `username`, `email`, `password`
  3. `movieModel.js`: `movieName`, `description`, `genres`, `releaseDate`, `language`, `duration`, `certification`, `posterUrl` (+ `backdropUrl`, `trailerUrl`, `cast`, `rating`)
  4. `theatreModel.js`: `theatreName`, `location`, `balconySeatPrice`, `middleSeatPrice`, `lowerSeatPrice`, `balconySeats`, `middleSeats`, `lowerSeats`
  5. `showModel.js`: `adminEmail`, `showId`, `movieId`, `theatreName`, `showDate`, `showTime`, `tickets`
  6. `bookingModel.js`: `bookingId`, `userEmail`, `showId`, `selectedSeats`, `totalAmount`, `paymentStatus`
  7. `favoriteModel.js`: `userEmail`, `movieId`
  8. `reviewModel.js`: `userEmail`, `movieId`, `rating`, `reviewText`

### Core Feature: Real-Time Seat Locking with TTL Expiration
- **Seat Lock TTL Timer**: When a customer selects seats, `POST /api/bookings/lock` reserves seats with a 5-minute countdown (`lockExpiresAt`).
- **Interactive Tier Map**: Visual tiered auditorium layout (**Balcony**, **Middle**, **Lower**) with curved glowing cinema screen.
- **Seat Statuses**: Available (dark outline), Selected (Prime cyan `#00a8e1`), Locked (amber outline with lock icon), Booked (dark slate disabled).
- **Auto-Cleanup**: Background cleaner releases expired locks every 15 seconds.

---

## 2. Default Test Credentials

| Role | Email | Password | Access |
|---|---|---|---|
| **User** | `user@imovies.com` | `user123` | Home, Movie Details, Seat Booking, Watchlist, Digital Tickets |
| **Admin** | `admin@imovies.com` | `admin123` | Admin Analytics Dashboard, Add Movie, Add Theatre, Add Show, Moderate Bookings |

*Both accounts are also pre-configured with one-click autofill buttons on the `/login` page.*

---

## 3. Frontend Routes

### Public Views
- `/landing`: Amazon Prime style hero banner with gradient overlays, rotating blockbuster carousel, and Prime Video CTAs.
- `/login`: Dark card form with toast feedback and evaluator demo autofill.
- `/register`: User account creation form with validation.

### User Protected Views (`UserProtection.jsx`)
- `/home`: Prime Video layout with billboard carousel, search bar, language filters, genre pills, and horizontal movie rows (Trending Now, Top Rated, Action, Sci-Fi, Dramas).
- `/moviedetails/:movieId`: Overview with backdrop banner, IMDb score, trailer video modal, cast list, and audience reviews.
- `/movieshows/:movieId`: Showtime listing grouped by theatre with 5-day date picker tabs.
- `/seatslug/:showId`: Interactive tier seat selector grid with 5-minute TTL timer and simulated checkout modal.
- `/bookings`: Digital ticket wallet with barcode, QR code simulation, printable boarding-pass view, and cancellation.
- `/watchlist`: User's saved movie titles in a Prime Video grid.

### Admin Protected Views (`AdminProtection.jsx`)
- `/admin`: Executive dashboard with revenue KPIs, tickets sold, active catalog counts, and recent transactions.
- `/addmovie`: Form for catalog addition with live card preview.
- `/addtheatre`: Form for theatre venue registration and tier seat configuration.
- `/addshow`: Showtime scheduler mapping movie, theatre, date, and time.
- `/adminbookings`: Platform reservation manager with search, status filters, and cancellation moderation.

---

## 4. Backend REST API Endpoints (`/api`)

- **`/api/auth`**:
  - `POST /register`: Register user
  - `POST /login`: Authenticate user or admin
  - `POST /admin/register`: Register admin
  - `POST /admin/login`: Authenticate admin
  - `GET /profile`: Get current authenticated profile

- **`/api/movie` (and `/api/movies`)**:
  - `GET /`: List live market movies from TMDB with search, genre, and language filters
  - `GET /:id`: Get live movie details (TMDB ID or local ID) with cast, trailers, certification
  - `GET /tmdb/now-playing`: Live now playing market movies
  - `GET /tmdb/popular`: Top popular market movies
  - `GET /tmdb/top-rated`: Critically acclaimed titles
  - `GET /tmdb/upcoming`: Upcoming market theatrical releases
  - `POST /`: Admin create movie
  - `PUT /:id`: Admin update movie
  - `DELETE /:id`: Admin delete movie

- **`/api/theatre` (and `/api/theaters`)**:
  - `GET /`: List theatres
  - `GET /:id`: Get theatre details
  - `POST /`: Admin create theatre
  - `PUT /:id`: Admin update theatre
  - `DELETE /:id`: Admin delete theatre

- **`/api/shows`**:
  - `GET /`: List shows (filtered by movieId, theatreName, date)
  - `GET /:id`: Get show with seat tickets matrix
  - `POST /`: Admin schedule show
  - `PUT /:id`: Admin update show
  - `DELETE /:id`: Admin delete show

- **`/api/bookings`**:
  - `POST /lock`: Atomic 5-minute TTL seat locking
  - `POST /unlock`: Release locked seats
  - `POST /`: Confirm booking and generate digital ticket
  - `GET /my-bookings`: Customer booking history
  - `GET /`: Admin list all platform bookings
  - `PUT /:id/cancel`: Cancel booking and release seats

- **`/api/payment`**:
  - `POST /create-order`: Generate Razorpay order (`amount` in paise, `currency: 'INR'`, `key_id`, `order_id`)
  - `POST /verify`: Validate HMAC SHA-256 signature, mark booking `Completed`, transition seats to `booked`
  - `POST /cancel`: Safely unlock seats upon checkout modal dismissal or decline

- **`/api/email`**:
  - `POST /send-verification`: Send account verification email with 6-digit OTP and activation link
  - `POST /send-reset-password`: Send password reset email with recovery OTP and reset link
  - `POST /send-booking-confirmation`: Send cinema ticket boarding pass with QR barcode
  - `POST /send-status-update`: Send booking cancellation or update notification
  - `POST /send-test`: Quick verification test endpoint

- **`/api/favorite`**:
  - `GET /`: Get current user's watchlist
  - `POST /`: Toggle movie in watchlist
  - `DELETE /:movieId`: Remove movie from watchlist

- **`/api/review`**:
  - `GET /:movieId`: Get audience reviews
  - `POST /`: Post rating and review
  - `DELETE /:id`: Delete review

- **`/api/admin`**:
  - `GET /dashboard-stats`: Executive platform KPI metrics
  - `GET /bookings`: Master bookings list

---

## 5. Getting Started & Running

### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 2: Seed the Database
```bash
cd backend
node scripts/seedMongo.js
```

### Step 3: Run Integration Test Suites
```bash
cd backend
# Verify Live TMDB Market API Integration
node scripts/testTmdbIntegration.js

# Verify Razorpay Payment Gateway Integration
node scripts/testRazorpayIntegration.js

# Verify Brevo (Sendinblue) Transactional Email & OTP Integration
node scripts/testBrevoIntegration.js
```

### Step 4: Start the Backend Server
```bash
cd backend
npm start
# Runs on http://localhost:5000
```

### Step 5: Start the Frontend Client
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```
