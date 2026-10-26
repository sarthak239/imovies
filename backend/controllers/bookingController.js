const Booking = require('../models/Booking');
const Show = require('../models/Show');

// @desc    Create a new seat booking (Concurrency-Safe)
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const { showId, selectedSeats, paymentMethod, paymentDetails } = req.body;

    if (!showId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid showId and at least one selected seat',
      });
    }

    // 1. Fetch current show
    const show = await Show.findById(showId).populate('movie').populate('theater');
    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found',
      });
    }

    if (!show.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This show is no longer active for booking',
      });
    }

    // 2. Validate requested seats exist and are currently unbooked
    const requestedSeatObjects = [];
    const alreadyBookedSeats = [];

    for (const seatNum of selectedSeats) {
      const foundSeat = show.seatMatrix.find((s) => s.seatNumber === seatNum);
      if (!foundSeat) {
        return res.status(400).json({
          success: false,
          message: `Seat ${seatNum} is invalid for this auditorium layout`,
        });
      }
      if (foundSeat.isBooked) {
        alreadyBookedSeats.push(seatNum);
      } else {
        requestedSeatObjects.push(foundSeat);
      }
    }

    if (alreadyBookedSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: `Seat(s) ${alreadyBookedSeats.join(', ')} have just been booked by another user. Please select different seats.`,
      });
    }

    // 3. Concurrency-Safe Atomic Update:
    // Update only if none of the requested seats have been marked as isBooked: true in the interim
    const bookingRef = `IMV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const simPaymentId = `PAY-SIM-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // Perform atomic update on Show document
    // We update the specific seats in seatMatrix
    const atomicUpdateResult = await Show.findOneAndUpdate(
      {
        _id: showId,
        // Ensure no seat in requestedSeats is booked
        seatMatrix: {
          $not: {
            $elemMatch: {
              seatNumber: { $in: selectedSeats },
              isBooked: true,
            },
          },
        },
      },
      {
        $set: selectedSeats.reduce((acc, seatNum) => {
          // Find index in seatMatrix
          const idx = show.seatMatrix.findIndex((s) => s.seatNumber === seatNum);
          if (idx !== -1) {
            acc[`seatMatrix.${idx}.isBooked`] = true;
            acc[`seatMatrix.${idx}.bookedBy`] = req.user._id;
            acc[`seatMatrix.${idx}.bookingReference`] = bookingRef;
          }
          return acc;
        }, {}),
        $inc: { availableSeats: -selectedSeats.length },
      },
      { new: true }
    );

    if (!atomicUpdateResult) {
      return res.status(409).json({
        success: false,
        message: 'Conflict detected: One or more selected seats were locked by another user just now. Please try again.',
      });
    }

    // 4. Calculate pricing directly from backend seat configurations
    const seatDetails = requestedSeatObjects.map((s) => ({
      seatNumber: s.seatNumber,
      tier: s.tier,
      price: s.price,
    }));

    const subtotal = seatDetails.reduce((sum, s) => sum + s.price, 0);
    // Standard convenience fee: ₹25 flat per ticket + GST
    const convenienceFee = Math.round(selectedSeats.length * 28);
    const totalAmount = subtotal + convenienceFee;

    // 5. Create Booking Record
    const booking = await Booking.create({
      bookingReference: bookingRef,
      user: req.user._id,
      movie: show.movie._id,
      theater: show.theater._id,
      show: show._id,
      movieTitle: show.movie.title,
      theaterName: show.theater.name,
      theaterCity: show.theater.city,
      screenName: show.screenName,
      showDate: show.showDate,
      showTime: show.showTime,
      seats: selectedSeats,
      seatDetails,
      ticketCount: selectedSeats.length,
      subtotal,
      convenienceFee,
      totalAmount,
      paymentStatus: 'completed',
      paymentMethod: paymentMethod || 'UPI',
      paymentId: simPaymentId,
      bookingStatus: 'confirmed',
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate('movie', 'title posterUrl duration language censorRating')
      .populate('theater', 'name location city address')
      .populate('user', 'name email phone');

    return res.status(201).json({
      success: true,
      message: 'Tickets booked successfully!',
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's bookings
// @route   GET /api/bookings/my-bookings
// @access  Private
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('movie', 'title posterUrl duration language censorRating')
      .populate('theater', 'name location city address')
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

// @desc    Get single booking details
// @route   GET /api/bookings/:id
// @access  Private
const getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('movie')
      .populate('theater')
      .populate('user', 'name email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Only owner or admin can view
    if (
      booking.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking',
      });
    }

    return res.json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a booking and release seats
// @route   PUT /api/bookings/:id/cancel
// @access  Private
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
      });
    }

    // Only owner or admin can cancel
    if (
      booking.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking',
      });
    }

    if (booking.bookingStatus === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking has already been cancelled',
      });
    }

    // 1. Mark booking as cancelled
    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancelledAt = new Date();
    await booking.save();

    // 2. Release seats in Show atomically
    const show = await Show.findById(booking.show);
    if (show) {
      const updateFields = {};
      booking.seats.forEach((seatNum) => {
        const idx = show.seatMatrix.findIndex((s) => s.seatNumber === seatNum);
        if (idx !== -1) {
          updateFields[`seatMatrix.${idx}.isBooked`] = false;
          updateFields[`seatMatrix.${idx}.bookedBy`] = null;
          updateFields[`seatMatrix.${idx}.bookingReference`] = null;
        }
      });

      await Show.findByIdAndUpdate(booking.show, {
        $set: updateFields,
        $inc: { availableSeats: booking.seats.length },
      });
    }

    return res.json({
      success: true,
      message: 'Booking cancelled successfully. Seats have been released and refund initiated.',
      booking,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
};
