const express = require('express');
const router = express.Router();
const {
  getFavorites,
  toggleFavorite,
  removeFavorite,
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getFavorites)
  .post(protect, toggleFavorite);

router.delete('/:movieId', protect, removeFavorite);

module.exports = router;
