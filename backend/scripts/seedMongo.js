const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/../.env' });

const User = require('../models/userModel');
const Admin = require('../models/adminModel');
const Movie = require('../models/movieModel');
const Theatre = require('../models/theatreModel');
const Show = require('../models/showModel');
const Booking = require('../models/bookingModel');
const Favorite = require('../models/favoriteModel');
const Review = require('../models/reviewModel');
const store = require('../config/store');

const seedMongo = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/imovies_db';
    console.log('[iMovies Mongo Seeder] Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);

    console.log('[iMovies Mongo Seeder] Clearing existing data for fresh Amazon Prime schema sync...');
    await Promise.all([
      User.deleteMany({}),
      Admin.deleteMany({}),
      Movie.deleteMany({}),
      Theatre.deleteMany({}),
      Show.deleteMany({}),
      Booking.deleteMany({}),
      Favorite.deleteMany({}),
      Review.deleteMany({}),
    ]);

    await store.init();

    console.log('[iMovies Mongo Seeder] Inserting Users & Admins...');
    await User.create({
      username: 'prime_viewer',
      email: 'user@imovies.com',
      password: 'user123',
      role: 'user',
    });

    await Admin.create({
      username: 'admin',
      email: 'admin@imovies.com',
      password: 'admin123',
      role: 'admin',
    });

    console.log('[iMovies Mongo Seeder] Inserting Movies...');
    const movieDocs = store.movies.map(m => ({
      movieName: m.movieName || m.title,
      description: m.description,
      genres: m.genres || m.genre,
      releaseDate: m.releaseDate,
      language: m.language,
      duration: m.duration,
      certification: m.certification,
      posterUrl: m.posterUrl,
      backdropUrl: m.backdropUrl,
      trailerUrl: m.trailerUrl,
      cast: m.cast,
      rating: m.rating,
      featured: m.featured,
    }));
    const insertedMovies = await Movie.insertMany(movieDocs);

    console.log('[iMovies Mongo Seeder] Inserting Theatres...');
    const theatreDocs = store.theatres.map(t => ({
      theatreName: t.theatreName,
      location: t.location,
      balconySeatPrice: t.balconySeatPrice,
      middleSeatPrice: t.middleSeatPrice,
      lowerSeatPrice: t.lowerSeatPrice,
      balconySeats: t.balconySeats,
      middleSeats: t.middleSeats,
      lowerSeats: t.lowerSeats,
      facilities: t.facilities,
    }));
    const insertedTheatres = await Theatre.insertMany(theatreDocs);

    console.log('[iMovies Mongo Seeder] Generating and inserting Shows...');
    const { generateTicketMatrix } = require('../controllers/showController');
    const showTimes = ['10:30 AM', '01:45 PM', '05:15 PM', '08:30 PM', '11:00 PM'];
    const today = new Date();
    const dates = [0, 1, 2, 3, 4].map(offset => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return d;
    });

    const showDocs = [];
    let sCount = 101;
    insertedMovies.slice(0, 5).forEach((movie) => {
      insertedTheatres.forEach((theatre) => {
        dates.slice(0, 3).forEach((dObj, dIdx) => {
          const selectedTimes = [showTimes[dIdx % showTimes.length], showTimes[(dIdx + 2) % showTimes.length]];
          selectedTimes.forEach(time => {
            const tickets = generateTicketMatrix(theatre.balconySeatPrice, theatre.middleSeatPrice, theatre.lowerSeatPrice);
            // Pre-reserve a couple seats
            tickets['C4'].status = 'booked';
            tickets['C5'].status = 'booked';

            showDocs.push({
              adminEmail: 'admin@imovies.com',
              showId: 'SHW-' + sCount,
              movieId: movie._id,
              movieName: movie.movieName,
              theatreName: theatre.theatreName,
              theatreId: theatre._id,
              showDate: dObj,
              showTime: time,
              tierPricing: {
                balcony: theatre.balconySeatPrice,
                middle: theatre.middleSeatPrice,
                lower: theatre.lowerSeatPrice,
              },
              tickets,
              isActive: true,
            });
            sCount++;
          });
        });
      });
    });

    const insertedShows = await Show.insertMany(showDocs);

    console.log('[iMovies Mongo Seeder] Inserting Sample Bookings...');
    await Booking.create({
      bookingId: 'IMV-PRIME-98214',
      userEmail: 'user@imovies.com',
      showId: insertedShows[0]._id.toString(),
      movieName: insertedMovies[0].movieName,
      theatreName: insertedTheatres[0].theatreName,
      showDate: dates[0].toISOString().split('T')[0],
      showTime: '10:30 AM',
      selectedSeats: ['C4', 'C5'],
      seatDetails: [
        { seatNumber: 'C4', tier: 'Middle', price: 240 },
        { seatNumber: 'C5', tier: 'Middle', price: 240 },
      ],
      subtotal: 480,
      convenienceFee: 56,
      totalAmount: 536,
      paymentStatus: 'Completed',
      paymentMethod: 'Prime Pay / UPI',
      paymentId: 'PAY-PRIME-SIM-8742',
    });

    console.log('[iMovies Mongo Seeder] Inserting Sample Watchlist & Reviews...');
    await Favorite.create({
      userEmail: 'user@imovies.com',
      movieId: insertedMovies[0]._id.toString(),
      movieName: insertedMovies[0].movieName,
      posterUrl: insertedMovies[0].posterUrl,
    });

    await Review.create({
      userEmail: 'user@imovies.com',
      movieId: insertedMovies[0]._id.toString(),
      username: 'Prime Cinephile',
      rating: 10,
      reviewText: 'An absolute masterpiece in world-building, sound design, and cinematography. Denis Villeneuve delivered one of the greatest sci-fi spectacles ever made!',
    });

    console.log(`[iMovies Mongo Seeder] SUCCESS! Seeded:
    - Admin: admin@imovies.com / admin123
    - User: user@imovies.com / user123
    - ${insertedMovies.length} Movies
    - ${insertedTheatres.length} Theatres
    - ${insertedShows.length} Shows with Tier Seat Matrix
    - Sample Confirmed Booking (IMV-PRIME-98214)
    - Watchlist & Reviews`);

    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedMongo();
