const Movie = require('../models/Movie');
const Theater = require('../models/Theater');
const Show = require('../models/Show');
const Booking = require('../models/Booking');
const User = require('../models/User');

// @desc    Get Admin Dashboard Key Metrics & Statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalMovies,
      totalTheaters,
      totalShows,
      totalUsers,
      totalBookings,
      revenueResult,
      recentBookings,
    ] = await Promise.all([
      Movie.countDocuments(),
      Theater.countDocuments(),
      Show.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Booking.countDocuments(),
      Booking.aggregate([
        { $match: { bookingStatus: 'confirmed' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalTickets: { $sum: '$ticketCount' },
          },
        },
      ]),
      Booking.find()
        .populate('user', 'name email phone')
        .populate('movie', 'title posterUrl')
        .populate('theater', 'name city')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;
    const totalTicketsSold = revenueResult[0]?.totalTickets || 0;

    return res.json({
      success: true,
      stats: {
        totalMovies,
        totalTheaters,
        totalShows,
        totalUsers,
        totalBookings,
        totalRevenue,
        totalTicketsSold,
      },
      recentBookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings with filters for Admin
// @route   GET /api/admin/bookings
// @access  Private/Admin
const getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingReference: { $regex: search, $options: 'i' } },
        { movieTitle: { $regex: search, $options: 'i' } },
        { theaterName: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email phone')
      .populate('movie', 'title posterUrl')
      .populate('theater', 'name city')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllBookingsAdmin,
};
