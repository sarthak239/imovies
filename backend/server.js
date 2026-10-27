const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { connectDB } = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB or activate in-memory fallback
connectDB();

const app = express();

// Allowed Origins for CORS
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Health Check & Root Route
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    project: 'iMovies — Movie Ticket Booking Web Application',
    aesthetic: 'Amazon Prime Video (#0f171e, #1a242f, #00a8e1)',
    version: '2.0.0',
    endpoints: {
      auth: '/api/auth',
      movie: '/api/movie',
      movies: '/api/movies',
      theatre: '/api/theatre',
      theaters: '/api/theaters',
      shows: '/api/shows',
      bookings: '/api/bookings',
      favorite: '/api/favorite',
      review: '/api/review',
      admin: '/api/admin',
      payment: '/api/payment',
      email: '/api/email',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Mount Routes (with aliases matching prompt requirements)
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/movie', require('./routes/movieRoutes'));
app.use('/api/movies', require('./routes/movieRoutes'));
app.use('/api/theatre', require('./routes/theaterRoutes'));
app.use('/api/theaters', require('./routes/theaterRoutes'));
app.use('/api/shows', require('./routes/showRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/email', require('./routes/emailRoutes'));
app.use('/api/favorite', require('./routes/favoriteRoutes'));
app.use('/api/review', require('./routes/reviewRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

// Serve Frontend Static Build in Production (Unified Deployment Support)
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
}

// Error Handling Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[iMovies Backend] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
});
