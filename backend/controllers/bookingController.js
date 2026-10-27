const Booking = require('../models/bookingModel');
const Show = require('../models/showModel');
const store = require('../config/store');
const { cleanShowSeatLocks } = require('./showController');
const emailService = require('../services/emailService');

// @desc    Temporary Seat Locking with TTL Expiration
// @route   POST /api/bookings/lock
// @access  Private / Public with email
const lockSeats = async (req, res, next) => {
  try {
    const { showId, selectedSeats, userEmail } = req.body;
    const email = userEmail || req.user?.email;

    if (!showId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide showId and at least one seat to lock',
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'User email is required to lock seats',
      });
    }

    // 1. Locate show
    let show = null;
    try {
      show = await Show.findById(showId);
      if (!show) show = await Show.findOne({ showId });
    } catch (e) {
      show = store.shows.find(s => s._id === showId || s.showId === showId);
    }
    if (!show) {
      show = store.shows.find(s => s._id === showId || s.showId === showId);
    }

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Clean any expired locks first
    cleanShowSeatLocks(show);

    const now = Date.now();
    const ttlMinutes = 5;
    const lockExpiresAt = new Date(now + ttlMinutes * 60 * 1000);

    // 2. Validate availability of all selected seats
    const conflicts = [];
    selectedSeats.forEach((seatNum) => {
      const seat = show.tickets ? show.tickets[seatNum] : null;
      if (!seat) {
        conflicts.push(`Seat ${seatNum} does not exist`);
        return;
      }
      if (seat.status === 'booked') {
        conflicts.push(`Seat ${seatNum} is already booked`);
      } else if (seat.status === 'locked' && seat.lockedBy !== email) {
        conflicts.push(`Seat ${seatNum} is temporarily locked by another user`);
      }
    });

    if (conflicts.length > 0) {
      return res.status(409).json({
        success: false,
        message: conflicts.join(', '),
      });
    }

    // 3. Apply lock
    selectedSeats.forEach((seatNum) => {
      if (show.tickets && show.tickets[seatNum]) {
        show.tickets[seatNum].status = 'locked';
        show.tickets[seatNum].lockedBy = email;
        show.tickets[seatNum].lockExpiresAt = lockExpiresAt;
      }
    });

    // Save show changes
    try {
      if (typeof show.save === 'function') {
        show.markModified && show.markModified('tickets');
        await show.save();
      }
    } catch (e) {
      // In-memory fallback
    }

    return res.json({
      success: true,
      message: `Seats locked for ${ttlMinutes} minutes. Complete checkout before timer expires.`,
      lockExpiresAt,
      selectedSeats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unlock Seats (deselection or cancellation)
// @route   POST /api/bookings/unlock
// @access  Public / Private
const unlockSeats = async (req, res, next) => {
  try {
    const { showId, selectedSeats, userEmail } = req.body;
    const email = userEmail || req.user?.email;

    let show = null;
    try {
      show = await Show.findById(showId);
      if (!show) show = await Show.findOne({ showId });
    } catch (e) {
      show = store.shows.find(s => s._id === showId || s.showId === showId);
    }
    if (!show) {
      show = store.shows.find(s => s._id === showId || s.showId === showId);
    }

    if (!show || !show.tickets) {
      return res.json({ success: true, message: 'No action needed' });
    }

    const seatsToUnlock = selectedSeats && selectedSeats.length > 0
      ? selectedSeats
      : Object.keys(show.tickets);

    seatsToUnlock.forEach((seatNum) => {
      const seat = show.tickets[seatNum];
      if (seat && seat.status === 'locked') {
        if (!email || seat.lockedBy === email) {
          seat.status = 'available';
          seat.lockedBy = null;
          seat.lockExpiresAt = null;
        }
      }
    });

    try {
      if (typeof show.save === 'function') {
        show.markModified && show.markModified('tickets');
        await show.save();
      }
    } catch (e) {}

    return res.json({
      success: true,
      message: 'Seats unlocked',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking (Simulated Checkout)
// @route   POST /api/bookings
// @access  Private / Authenticated
const createBooking = async (req, res, next) => {
  try {
    const {
      showId,
      selectedSeats,
      userEmail,
      totalAmount,
      subtotal,
      convenienceFee,
      paymentMethod,
    } = req.body;

    const email = (userEmail || req.user?.email || '').trim().toLowerCase();

    if (!showId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid show ID and selected seats are required',
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'User email is required to confirm booking',
      });
    }

    // Find show
    let show = null;
    try {
      show = await Show.findById(showId);
      if (!show) show = await Show.findOne({ showId });
    } catch (e) {
      show = store.shows.find(s => s._id === showId || s.showId === showId);
    }
    if (!show) {
      show = store.shows.find(s => s._id === showId || s.showId === showId);
    }

    if (!show) {
      return res.status(404).json({ success: false, message: 'Show not found' });
    }

    // Clean expired locks
    cleanShowSeatLocks(show);

    // Verify seats
    const seatDetails = [];
    const invalidSeats = [];

    selectedSeats.forEach((seatNum) => {
      const seat = show.tickets ? show.tickets[seatNum] : null;
      if (!seat) {
        invalidSeats.push(`Seat ${seatNum} does not exist`);
        return;
      }
      if (seat.status === 'booked') {
        invalidSeats.push(`Seat ${seatNum} is already booked`);
      } else if (seat.status === 'locked' && seat.lockedBy !== email) {
        invalidSeats.push(`Seat ${seatNum} is locked by another customer`);
      } else {
        seatDetails.push({
          seatNumber: seat.seatNumber,
          tier: seat.tier,
          price: seat.price,
        });
      }
    });

    if (invalidSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: invalidSeats.join(', '),
      });
    }

    // Mark seats as booked
    selectedSeats.forEach((seatNum) => {
      show.tickets[seatNum].status = 'booked';
      show.tickets[seatNum].lockedBy = email;
      show.tickets[seatNum].lockExpiresAt = null;
    });

    try {
      if (typeof show.save === 'function') {
        show.markModified && show.markModified('tickets');
        await show.save();
      }
    } catch (e) {}

    // Calculate amounts if not supplied
    const calculatedSubtotal = subtotal || seatDetails.reduce((sum, s) => sum + (s.price || 200), 0);
    const calculatedFee = convenienceFee !== undefined ? convenienceFee : Math.round(selectedSeats.length * 28);
    const calculatedTotal = totalAmount || (calculatedSubtotal + calculatedFee);

    const bookingId = `IMV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Get movie & theatre names
    const m = store.movies.find(x => String(x._id) === String(show.movieId));
    const movieName = show.movieName || (m ? (m.movieName || m.title) : 'Movie Feature');
    const theatreName = show.theatreName || 'iMovies Prime Multiplex';

    const bookingPayload = {
      bookingId,
      userEmail: email,
      showId: show.showId || show._id,
      movieName,
      theatreName,
      showDate: show.showDate ? new Date(show.showDate).toISOString().split('T')[0] : 'Today',
      showTime: show.showTime,
      selectedSeats,
      seatDetails,
      subtotal: calculatedSubtotal,
      convenienceFee: calculatedFee,
      totalAmount: calculatedTotal,
      paymentStatus: 'Completed',
      paymentMethod: paymentMethod || 'Prime Pay / UPI',
      paymentId: `PAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date(),
    };

    let booking = null;
    try {
      booking = await Booking.create(bookingPayload);
    } catch (e) {
      booking = {
        _id: 'bkg_' + Date.now(),
        ...bookingPayload,
      };
      store.bookings.unshift(booking);
    }

    // Send transactional booking confirmation email via Brevo
    try {
      emailService.sendBookingConfirmationEmail(email, {
        ...bookingPayload,
        bookingId,
      }).catch((mailErr) => console.warn('[Booking Controller] Brevo email notice:', mailErr.message));
    } catch (mailErr) {}

    return res.status(201).json({
      success: true,
      message: 'Tickets booked successfully! A digital copy has been sent to your email.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's booking history
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const email = (req.user?.email || '').toLowerCase().trim();

    let bookings = [];
    try {
      bookings = await Booking.find({ userEmail: email }).sort({ createdAt: -1 });
    } catch (e) {
      bookings = store.bookings.filter(b => b.userEmail && b.userEmail.toLowerCase() === email);
    }

    if (!bookings || bookings.length === 0) {
      bookings = store.bookings.filter(b => b.userEmail && b.userEmail.toLowerCase() === email);
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

// @desc    Get all bookings (Admin moderation)
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res, next) => {
  try {
    let bookings = [];
    try {
      bookings = await Booking.find().sort({ createdAt: -1 });
    } catch (e) {
      bookings = store.bookings;
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

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let booking = null;

    try {
      booking = await Booking.findById(id);
      if (!booking) booking = await Booking.findOne({ bookingId: id });
    } catch (e) {
      booking = store.bookings.find(b => b._id === id || b.bookingId === id);
    }

    if (!booking) {
      booking = store.bookings.find(b => b._id === id || b.bookingId === id);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    return res.json({ success: true, booking });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    let booking = null;

    try {
      booking = await Booking.findById(id);
      if (!booking) booking = await Booking.findOne({ bookingId: id });
    } catch (e) {
      booking = store.bookings.find(b => b._id === id || b.bookingId === id);
    }
    if (!booking) {
      booking = store.bookings.find(b => b._id === id || b.bookingId === id);
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.paymentStatus = 'Cancelled';

    // Release seats in show
    let show = null;
    try {
      show = await Show.findById(booking.showId);
      if (!show) show = await Show.findOne({ showId: booking.showId });
    } catch (e) {
      show = store.shows.find(s => s._id === booking.showId || s.showId === booking.showId);
    }
    if (!show) {
      show = store.shows.find(s => s._id === booking.showId || s.showId === booking.showId);
    }

    if (show && show.tickets && booking.selectedSeats) {
      booking.selectedSeats.forEach((seatNum) => {
        if (show.tickets[seatNum]) {
          show.tickets[seatNum].status = 'available';
          show.tickets[seatNum].lockedBy = null;
          show.tickets[seatNum].lockExpiresAt = null;
        }
      });
      try {
        if (typeof show.save === 'function') {
          show.markModified && show.markModified('tickets');
          await show.save();
        }
      } catch (e) {}
    }

    try {
      if (typeof booking.save === 'function') {
        await booking.save();
      }
    } catch (e) {}

    // Send status update notification via Brevo
    try {
      if (booking.userEmail) {
        emailService.sendBookingStatusUpdateEmail(booking.userEmail, {
          bookingId: booking.bookingId,
          status: 'Cancelled',
          movieName: booking.movieName,
          refundAmount: booking.totalAmount,
          notes: 'Your ticket reservation has been cancelled and seats have been restored. Full refund processed.',
        }).catch((err) => console.warn('[Booking Controller] Cancellation email notice:', err.message));
      }
    } catch (mailErr) {}

    return res.json({
      success: true,
      message: 'Booking cancelled and seats released successfully',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  lockSeats,
  unlockSeats,
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
};
