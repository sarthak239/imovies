const Review = require('../models/reviewModel');
const store = require('../config/store');

// @desc    Get reviews for a movie
// @route   GET /api/review/:movieId
// @access  Public
const getMovieReviews = async (req, res, next) => {
  try {
    const { movieId } = req.params;
    let reviews = [];

    try {
      reviews = await Review.find({ movieId }).sort({ createdAt: -1 });
    } catch (e) {
      reviews = store.reviews.filter(r => String(r.movieId) === String(movieId));
    }

    if (!reviews || reviews.length === 0) {
      reviews = store.reviews.filter(r => String(r.movieId) === String(movieId));
    }

    return res.json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review
// @route   POST /api/review
// @access  Private
const createReview = async (req, res, next) => {
  try {
    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const { movieId, rating, reviewText } = req.body;

    if (!movieId || !rating || !reviewText) {
      return res.status(400).json({
        success: false,
        message: 'Movie ID, rating, and review text are required',
      });
    }

    const username = req.user?.username || req.user?.name || userEmail.split('@')[0];

    let review = null;
    try {
      review = await Review.create({
        userEmail,
        movieId,
        rating: Number(rating),
        reviewText,
        username,
      });
    } catch (e) {
      review = {
        _id: 'rev_' + Date.now(),
        userEmail,
        movieId,
        rating: Number(rating),
        reviewText,
        username,
        createdAt: new Date(),
      };
      store.reviews.unshift(review);
    }

    return res.status(201).json({
      success: true,
      message: 'Review posted successfully',
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/review/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const { id } = req.params;
    try {
      await Review.findByIdAndDelete(id);
    } catch (e) {
      store.reviews = store.reviews.filter(r => r._id !== id);
    }
    return res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMovieReviews,
  createReview,
  deleteReview,
};
