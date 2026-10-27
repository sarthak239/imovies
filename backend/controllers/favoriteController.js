const Favorite = require('../models/favoriteModel');
const store = require('../config/store');

// @desc    Get user's watchlist
// @route   GET /api/favorite
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    let favorites = [];

    try {
      favorites = await Favorite.find({ userEmail }).sort({ createdAt: -1 });
    } catch (e) {
      favorites = store.favorites.filter(f => f.userEmail && f.userEmail.toLowerCase() === userEmail);
    }

    if (!favorites || favorites.length === 0) {
      favorites = store.favorites.filter(f => f.userEmail && f.userEmail.toLowerCase() === userEmail);
    }

    // Populate full movie object
    const populated = favorites.map((f) => {
      const obj = f.toObject ? f.toObject() : { ...f };
      const movie = store.movies.find(m => String(m._id) === String(obj.movieId));
      return {
        ...obj,
        movie: movie || {
          _id: obj.movieId,
          title: obj.movieName || 'Movie Item',
          movieName: obj.movieName || 'Movie Item',
          posterUrl: obj.posterUrl || '',
          genres: ['Action'],
        },
      };
    });

    return res.json({
      success: true,
      count: populated.length,
      favorites: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle or add movie to watchlist
// @route   POST /api/favorite
// @access  Private
const toggleFavorite = async (req, res, next) => {
  try {
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const { movieId, movieName, posterUrl } = req.body;

    if (!movieId) {
      return res.status(400).json({ success: false, message: 'Movie ID is required' });
    }

    let existing = null;
    try {
      existing = await Favorite.findOne({ userEmail, movieId });
      if (existing) {
        await Favorite.deleteOne({ _id: existing._id });
        return res.json({ success: true, message: 'Removed from watchlist', isFavorite: false });
      }
    } catch (e) {
      const idx = store.favorites.findIndex(f => f.userEmail === userEmail && f.movieId === movieId);
      if (idx !== -1) {
        store.favorites.splice(idx, 1);
        return res.json({ success: true, message: 'Removed from watchlist', isFavorite: false });
      }
    }

    // Add to watchlist
    let newFav = null;
    try {
      newFav = await Favorite.create({
        userEmail,
        movieId,
        movieName: movieName || '',
        posterUrl: posterUrl || '',
      });
    } catch (e) {
      newFav = {
        _id: 'fav_' + Date.now(),
        userEmail,
        movieId,
        movieName: movieName || '',
        posterUrl: posterUrl || '',
        createdAt: new Date(),
      };
      store.favorites.push(newFav);
    }

    return res.status(201).json({
      success: true,
      message: 'Added to watchlist',
      isFavorite: true,
      favorite: newFav,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from watchlist
// @route   DELETE /api/favorite/:movieId
// @access  Private
const removeFavorite = async (req, res, next) => {
  try {
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const { movieId } = req.params;

    try {
      await Favorite.deleteMany({ userEmail, movieId });
    } catch (e) {
      store.favorites = store.favorites.filter(
        f => !(f.userEmail === userEmail && (f.movieId === movieId || f._id === movieId))
      );
    }

    return res.json({ success: true, message: 'Removed from watchlist' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFavorites,
  toggleFavorite,
  removeFavorite,
};
