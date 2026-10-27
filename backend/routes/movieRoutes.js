const express = require('express');
const router = express.Router();
const {
  getAllMovies,
  getMovieById,
  getNowPlayingLive,
  getPopularLive,
  getTopRatedLive,
  getUpcomingLive,
  createMovie,
  updateMovie,
  deleteMovie,
} = require('../controllers/movieController');
const { protect, admin } = require('../middleware/authMiddleware');

// Dedicated live TMDB market endpoints
router.get('/tmdb/now-playing', getNowPlayingLive);
router.get('/tmdb/popular', getPopularLive);
router.get('/tmdb/top-rated', getTopRatedLive);
router.get('/tmdb/upcoming', getUpcomingLive);

// Primary CRUD & Catalog
router.route('/')
  .get(getAllMovies)
  .post(protect, admin, createMovie);

router.route('/:id')
  .get(getMovieById)
  .put(protect, admin, updateMovie)
  .delete(protect, admin, deleteMovie);

module.exports = router;
