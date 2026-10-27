const store = require('../config/store');
const Movie = require('../models/movieModel');
const Theatre = require('../models/theatreModel');
const Show = require('../models/showModel');
const Booking = require('../models/bookingModel');
const User = require('../models/userModel');

// @desc    Get Admin Dashboard Key Metrics & Statistics
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
const getDashboardStats = async (req, res, next) => {
  try {
    let totalMovies = 0;
    let totalTheaters = 0;
    let totalShows = 0;
    let totalUsers = 0;
    let totalBookings = 0;
    let totalRevenue = 0;
    let totalTicketsSold = 0;
    let recentBookings = [];

    try {
      [totalMovies, totalTheaters, totalShows, totalUsers, totalBookings] = await Promise.all([
        Movie.countDocuments(),
        Theatre.countDocuments(),
        Show.countDocuments(),
        User.countDocuments({ role: 'user' }),
        Booking.countDocuments(),
      ]);

      const rev = await Booking.aggregate([
        { $match: { paymentStatus: 'Completed' } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            totalTickets: { $sum: { $size: '$selectedSeats' } },
          },
        },
      ]);
      totalRevenue = rev[0]?.totalRevenue || 0;
      totalTicketsSold = rev[0]?.totalTickets || 0;

      recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(10);
    } catch (e) {
      // Store fallback
      totalMovies = store.movies.length;
      totalTheaters = store.theatres.length;
      totalShows = store.shows.length;
      totalUsers = store.users.length;
      totalBookings = store.bookings.length;

      store.bookings.forEach((b) => {
        if (b.paymentStatus === 'Completed') {
          totalRevenue += (b.totalAmount || 0);
          totalTicketsSold += (b.selectedSeats ? b.selectedSeats.length : 1);
        }
      });

      recentBookings = store.bookings.slice(0, 10);
    }

    if (totalMovies === 0 && store.movies.length > 0) {
      totalMovies = store.movies.length;
      totalTheaters = store.theatres.length;
      totalShows = store.shows.length;
      totalUsers = store.users.length;
      totalBookings = store.bookings.length;
      recentBookings = store.bookings.slice(0, 10);
      store.bookings.forEach((b) => {
        if (b.paymentStatus === 'Completed') {
          totalRevenue += (b.totalAmount || 0);
          totalTicketsSold += (b.selectedSeats ? b.selectedSeats.length : 1);
        }
      });
    }

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
    let bookings = [];

    try {
      let query = {};
      if (status && status !== 'all') {
        query.paymentStatus = status;
      }
      if (search) {
        query.$or = [
          { bookingId: { $regex: search, $options: 'i' } },
          { userEmail: { $regex: search, $options: 'i' } },
          { movieName: { $regex: search, $options: 'i' } },
          { theatreName: { $regex: search, $options: 'i' } },
        ];
      }
      bookings = await Booking.find(query).sort({ createdAt: -1 });
    } catch (e) {
      bookings = store.bookings.filter((b) => {
        const sMatch = !status || status === 'all' || b.paymentStatus === status;
        const qMatch = !search ||
          (b.bookingId && b.bookingId.toLowerCase().includes(search.toLowerCase())) ||
          (b.userEmail && b.userEmail.toLowerCase().includes(search.toLowerCase())) ||
          (b.movieName && b.movieName.toLowerCase().includes(search.toLowerCase())) ||
          (b.theatreName && b.theatreName.toLowerCase().includes(search.toLowerCase()));
        return sMatch && qMatch;
      });
    }

    if (!bookings || bookings.length === 0) {
      bookings = store.bookings;
    }

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
