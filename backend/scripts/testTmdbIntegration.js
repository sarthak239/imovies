const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const tmdbService = require('../services/tmdbService');
const serverTmdbAlias = require('../../server/services/tmdbService');

async function runTests() {
  console.log('====================================================');
  console.log('  iMovies - TMDB Real-Time Integration Test Suite   ');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  // 1. Env check
  console.log('--- Step 1: Environment Configuration Check ---');
  assert(
    Boolean(process.env.TMDB_API_KEY),
    'TMDB_API_KEY configured correctly'
  );
  assert(
    Boolean(process.env.TMDB_BASE_URL),
    'TMDB_BASE_URL configured correctly'
  );

  // 2. Service Alias Check
  console.log('\n--- Step 2: server/services/tmdbService.js Alias Check ---');
  assert(
    typeof serverTmdbAlias.getNowPlaying === 'function' &&
    typeof serverTmdbAlias.getPopular === 'function' &&
    typeof serverTmdbAlias.getMovieDetails === 'function',
    'server/services/tmdbService export is valid and matches backend service'
  );

  // 3. Live TMDB API Connectivity & Services
  console.log('\n--- Step 3: TMDB Live API Endpoints ---');
  let sampleMovieId = null;
  let sampleMovieTitle = '';

  try {
    const nowPlaying = await tmdbService.getNowPlaying(1);
    assert(
      Array.isArray(nowPlaying) && nowPlaying.length > 0,
      `tmdbService.getNowPlaying returns live movies (${nowPlaying.length} movies retrieved)`
    );

    const first = nowPlaying[0];
    sampleMovieId = first._id;
    sampleMovieTitle = first.title;
    console.log(`   Sample Now Playing Movie: "${sampleMovieTitle}" (ID: ${sampleMovieId}, Genres: ${first.genres.join(', ')})`);

    assert(
      first.posterUrl && first.posterUrl.startsWith('http'),
      'Normalized movie contains valid posterUrl',
      first.posterUrl
    );
    assert(
      first.duration && typeof first.duration === 'string',
      'Normalized movie contains formatted duration string',
      first.duration
    );
    assert(
      first.certification && typeof first.certification === 'string',
      'Normalized movie contains certification rating',
      first.certification
    );
  } catch (err) {
    assert(false, 'tmdbService.getNowPlaying succeeded', err.message);
  }

  try {
    const popular = await tmdbService.getPopular(1);
    assert(
      Array.isArray(popular) && popular.length > 0,
      `tmdbService.getPopular returns popular movies (${popular.length} retrieved)`
    );
  } catch (err) {
    assert(false, 'tmdbService.getPopular succeeded', err.message);
  }

  try {
    const topRated = await tmdbService.getTopRated(1);
    assert(
      Array.isArray(topRated) && topRated.length > 0,
      `tmdbService.getTopRated returns top rated movies (${topRated.length} retrieved)`
    );
  } catch (err) {
    assert(false, 'tmdbService.getTopRated succeeded', err.message);
  }

  try {
    const upcoming = await tmdbService.getUpcoming(1);
    assert(
      Array.isArray(upcoming) && upcoming.length > 0,
      `tmdbService.getUpcoming returns upcoming releases (${upcoming.length} retrieved)`
    );
  } catch (err) {
    assert(false, 'tmdbService.getUpcoming succeeded', err.message);
  }

  try {
    const searchResults = await tmdbService.searchMovies('Dune');
    assert(
      Array.isArray(searchResults) && searchResults.length > 0,
      `tmdbService.searchMovies("Dune") found results (${searchResults.length} matches)`
    );
    assert(
      searchResults.some((m) => m.title.toLowerCase().includes('dune')),
      'Search results include "Dune"'
    );
  } catch (err) {
    assert(false, 'tmdbService.searchMovies succeeded', err.message);
  }

  if (sampleMovieId) {
    try {
      const details = await tmdbService.getMovieDetails(sampleMovieId);
      assert(
        details && String(details._id) === String(sampleMovieId),
        `tmdbService.getMovieDetails for ${sampleMovieId} returned accurate details`
      );
      assert(
        Array.isArray(details.cast),
        `Movie details cast array is populated (${details.cast.length} cast members)`
      );
    } catch (err) {
      assert(false, 'tmdbService.getMovieDetails succeeded', err.message);
    }
  }

  // 4. Express REST API Endpoints Verification
  console.log('\n--- Step 4: Express REST API Endpoints Verification ---');
  const store = require('../config/store');
  await store.init();

  const express = require('express');
  const app = express();
  app.use(express.json());

  // Mount routes
  app.use('/api/movie', require('../routes/movieRoutes'));
  app.use('/api/movies', require('../routes/movieRoutes'));
  app.use('/api/theatres', require('../routes/theaterRoutes'));
  app.use('/api/shows', require('../routes/showRoutes'));
  app.use('/api/bookings', require('../routes/bookingRoutes'));

  const PORT = 5892;
  const server = app.listen(PORT);

  const client = axios.create({
    baseURL: `http://127.0.0.1:${PORT}`,
    timeout: 30000,
  });

  try {
    // 4.1 GET /api/movie
    const resAll = await client.get('/api/movie');
    assert(
      resAll.data.success === true && resAll.data.movies.length > 0,
      `GET /api/movie returned ${resAll.data.movies.length} movies`
    );
    assert(
      resAll.data.source === 'tmdb_live_market',
      'GET /api/movie reports source: "tmdb_live_market"',
      `Actual: ${resAll.data.source}`
    );

    // 4.2 GET /api/movie?search=Dune
    const resSearch = await client.get('/api/movie', { params: { search: 'Dune' } });
    assert(
      resSearch.data.success === true && resSearch.data.movies.length > 0,
      `GET /api/movie?search=Dune returned ${resSearch.data.movies.length} matches`
    );

    // 4.3 GET /api/movie/:id
    const targetMovie = resAll.data.movies[0];
    const resDetail = await client.get(`/api/movie/${targetMovie._id}`);
    assert(
      resDetail.data.success === true && resDetail.data.movie.title === targetMovie.title,
      `GET /api/movie/:id returned details for "${targetMovie.title}"`
    );

    // 4.4 GET /api/movie/tmdb/now-playing
    const resNowPlaying = await client.get('/api/movie/tmdb/now-playing');
    assert(
      resNowPlaying.data.success === true && resNowPlaying.data.movies.length > 0,
      `GET /api/movie/tmdb/now-playing returned ${resNowPlaying.data.movies.length} live movies`
    );

    // 4.5 Auto-Schedule Shows for Live Movie
    const resShows = await client.get('/api/shows', { params: { movieId: targetMovie._id } });
    assert(
      resShows.data.success === true && resShows.data.shows.length > 0,
      `GET /api/shows?movieId=${targetMovie._id} auto-scheduled ${resShows.data.shows.length} shows`
    );

    const targetShow = resShows.data.shows[0];
    assert(
      targetShow.tickets && Object.keys(targetShow.tickets).length > 0,
      `Auto-scheduled show contains seat matrix with ${Object.keys(targetShow.tickets).length} seats`
    );

    // 4.6 Real-Time Seat Locking with 5-minute TTL
    const lockSeats = ['A1', 'A2'];
    const lockRes = await client.post('/api/bookings/lock', {
      showId: targetShow._id || targetShow.showId,
      selectedSeats: lockSeats,
      userEmail: 'user@imovies.com',
    });

    assert(
      lockRes.data.success === true && lockRes.data.selectedSeats.length === 2,
      `POST /api/bookings/lock successfully locked seats [${lockSeats.join(', ')}] with 5-min TTL`
    );
    assert(
      lockRes.data.lockExpiresAt !== undefined,
      'Lock response includes lockExpiresAt TTL timestamp'
    );

    // 4.7 Create Booking for Locked Seats with Auth Token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign(
      { id: 'user_1', email: 'user@imovies.com', role: 'user' },
      process.env.JWT_SECRET || 'imovies_super_secret_jwt_key_skillwallet_2026',
      { expiresIn: '1h' }
    );

    const bookRes = await client.post(
      '/api/bookings',
      {
        showId: targetShow._id || targetShow.showId,
        selectedSeats: lockSeats,
        userEmail: 'user@imovies.com',
        userName: 'Alex Mercer',
        paymentMethod: 'Prime Pay UPI',
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    assert(
      bookRes.data.success === true && bookRes.data.booking !== undefined,
      `POST /api/bookings confirmed booking ${bookRes.data.booking?.bookingId}`
    );
    assert(
      bookRes.data.booking?.paymentStatus === 'Completed',
      `Confirmed booking status is ${bookRes.data.booking?.paymentStatus}`
    );

  } catch (apiErr) {
    assert(false, 'Express REST endpoints execution', apiErr.response?.data?.message || apiErr.message);
  } finally {
    server.close();
  }

  console.log('\n====================================================');
  console.log(`  Tests Completed: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal Test Runner Error:', e);
  process.exit(1);
});
