const Show = require('../models/Show');
const Movie = require('../models/Movie');
const Theater = require('../models/Theater');

// Helper to generate a realistic seat layout for a show
const generateSeats = (tierPricing = { silver: 180, gold: 250, vip: 420 }) => {
  const seats = [];

  // Silver rows (A, B) - 8 seats each
  ['A', 'B'].forEach((row) => {
    for (let col = 1; col <= 8; col++) {
      seats.push({
        seatNumber: `${row}${col}`,
        row,
        col,
        tier: 'Silver',
        price: tierPricing.silver || 180,
        isBooked: false,
        bookedBy: null,
        bookingReference: null,
      });
    }
  });

  // Gold rows (C, D, E, F) - 10 seats each
  ['C', 'D', 'E', 'F'].forEach((row) => {
    for (let col = 1; col <= 10; col++) {
      seats.push({
        seatNumber: `${row}${col}`,
        row,
        col,
        tier: 'Gold',
        price: tierPricing.gold || 250,
        isBooked: false,
        bookedBy: null,
        bookingReference: null,
      });
    }
  });

  // VIP rows (G, H) - 8 luxury recliner seats each
  ['G', 'H'].forEach((row) => {
    for (let col = 1; col <= 8; col++) {
      seats.push({
        seatNumber: `${row}${col}`,
        row,
        col,
        tier: 'VIP',
        price: tierPricing.vip || 420,
        isBooked: false,
        bookedBy: null,
        bookingReference: null,
      });
    }
  });

  return seats;
};

// @desc    Get shows with filters (movie, theater, date, city)
// @route   GET /api/shows
// @access  Public
const getAllShows = async (req, res, next) => {
  try {
    const { movie, theater, showDate, city } = req.query;
    let query = { isActive: true };

    if (movie) query.movie = movie;
    if (theater) query.theater = theater;
    if (showDate) query.showDate = showDate;

    let shows = await Show.find(query)
      .populate('movie', 'title genre duration language rating posterUrl censorRating status')
      .populate('theater', 'name location city address facilities')
      .sort({ showDate: 1, showTime: 1 });

    // Optional city filter
    if (city && city !== 'All') {
      shows = shows.filter(
        (show) => show.theater && show.theater.city.toLowerCase() === city.toLowerCase()
      );
    }

    // Exclude seatMatrix from list view for performance, but retain availableSeats
    const sanitizedShows = shows.map((s) => {
      const obj = s.toObject();
      delete obj.seatMatrix;
      return obj;
    });

    return res.json({
      success: true,
      count: sanitizedShows.length,
      shows: sanitizedShows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single show by ID (including full seat matrix)
// @route   GET /api/shows/:id
// @access  Public
const getShowById = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id)
      .populate('movie')
      .populate('theater');

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    return res.json({
      success: true,
      show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new show
// @route   POST /api/shows
// @access  Private/Admin
const createShow = async (req, res, next) => {
  try {
    const { movie, theater, screenName, showDate, showTime, tierPricing } = req.body;

    if (!movie || !theater || !showDate || !showTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide movie, theater, showDate, and showTime',
      });
    }

    const movieExists = await Movie.findById(movie);
    if (!movieExists) {
      return res.status(404).json({ success: false, message: 'Movie not found' });
    }

    const theaterExists = await Theater.findById(theater);
    if (!theaterExists) {
      return res.status(404).json({ success: false, message: 'Theater not found' });
    }

    const pricing = tierPricing || { silver: 180, gold: 250, vip: 420 };
    const seatMatrix = generateSeats(pricing);

    const show = await Show.create({
      movie,
      theater,
      screenName: screenName || 'Screen 1',
      showDate,
      showTime,
      tierPricing: pricing,
      seatMatrix,
      totalSeats: seatMatrix.length,
      availableSeats: seatMatrix.length,
      isActive: true,
    });

    const populatedShow = await Show.findById(show._id)
      .populate('movie', 'title posterUrl')
      .populate('theater', 'name city');

    return res.status(201).json({
      success: true,
      message: 'Show scheduled successfully',
      show: populatedShow,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a show
// @route   PUT /api/shows/:id
// @access  Private/Admin
const updateShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    const { screenName, showDate, showTime, isActive } = req.body;
    if (screenName) show.screenName = screenName;
    if (showDate) show.showDate = showDate;
    if (showTime) show.showTime = showTime;
    if (isActive !== undefined) show.isActive = isActive;

    await show.save();

    return res.json({
      success: true,
      message: 'Show updated successfully',
      show,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a show
// @route   DELETE /api/shows/:id
// @access  Private/Admin
const deleteShow = async (req, res, next) => {
  try {
    const show = await Show.findById(req.params.id);
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    await show.deleteOne();

    return res.json({
      success: true,
      message: 'Show deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllShows,
  getShowById,
  createShow,
  updateShow,
  deleteShow,
  generateSeats,
};
