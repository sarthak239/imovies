const crypto = require('crypto');
const razorpay = require('../config/razorpay');
const Show = require('../models/showModel');
const Booking = require('../models/bookingModel');
const store = require('../config/store');
const { cleanShowSeatLocks } = require('./showController');
const emailService = require('../services/emailService');

/**
 * @desc    Create Razorpay Order
 * @route   POST /api/payment/create-order
 * @access  Public / Authenticated
 */
const createOrder = async (req, res, next) => {
  try {
    const { amount, showId, selectedSeats, userEmail } = req.body;
    const email = (userEmail || req.user?.email || '').trim().toLowerCase();

    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid amount in INR is required to create a payment order.',
      });
    }

    if (!showId || !selectedSeats || !Array.isArray(selectedSeats) || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Show ID and at least one selected seat are required.',
      });
    }

    // 1. Locate show (MongoDB or Store)
    let show = null;
    try {
      show = await Show.findById(showId);
      if (!show) show = await Show.findOne({ showId });
    } catch (e) {
      show = store.shows.find((s) => s._id === showId || s.showId === showId);
    }
    if (!show) {
      show = store.shows.find((s) => s._id === showId || s.showId === showId);
    }

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show not found. Please reselect your showtime.',
      });
    }

    // Clean any expired seat locks first
    cleanShowSeatLocks(show);

    // Verify seats aren't already booked by someone else
    const unavailableSeats = [];
    selectedSeats.forEach((seatNum) => {
      const seat = show.tickets ? show.tickets[seatNum] : null;
      if (!seat) {
        unavailableSeats.push(`Seat ${seatNum} is invalid`);
      } else if (seat.status === 'booked') {
        unavailableSeats.push(`Seat ${seatNum} is already booked`);
      } else if (seat.status === 'locked' && email && seat.lockedBy && seat.lockedBy !== email) {
        unavailableSeats.push(`Seat ${seatNum} is locked by another customer`);
      }
    });

    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        success: false,
        message: unavailableSeats.join(', '),
      });
    }

    // Amount in Paise (INR: 1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    // Short receipt ID (Razorpay allows max 40 chars)
    const receipt = `rcpt_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substring(2, 6)}`;

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt,
      notes: {
        showId: String(showId),
        movieName: show.movieName || 'iMovies Feature',
        userEmail: email,
        seats: selectedSeats.join(','),
      },
    };

    const order = await razorpay.orders.create(options);

    const keyId = process.env.RAZORPAY_KEY_ID;

    return res.status(200).json({
      success: true,
      order_id: order.id,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key_id: keyId,
      keyId,
      receipt: order.receipt,
    });
  } catch (error) {
    console.error('[Payment Controller] Error creating Razorpay order:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to create Razorpay payment order. ' + (error.error?.description || error.message),
    });
  }
};

/**
 * @desc    Verify Razorpay Payment Signature and Finalize Booking
 * @route   POST /api/payment/verify
 * @access  Public / Authenticated
 */
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      bookingDetails = {},
    } = req.body;

    const orderId = razorpay_order_id || razorpayOrderId;
    const paymentId = razorpay_payment_id || razorpayPaymentId;
    const signature = razorpay_signature || razorpaySignature;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'Order ID, Payment ID, and Signature are required for payment verification.',
      });
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // 1. Validate HMAC SHA256 signature
    const hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${orderId}|${paymentId}`);
    const generatedSignature = hmac.digest('hex');

    const showId = bookingDetails.showId;
    const selectedSeats = bookingDetails.selectedSeats || [];
    const email = (bookingDetails.userEmail || req.user?.email || '').trim().toLowerCase();

    // 2. Signature Validation Failed
    if (generatedSignature !== signature) {
      console.warn(`[Payment Controller] Signature verification failed for order ${orderId}`);

      // Unlock seats upon verification failure
      if (showId && selectedSeats.length > 0) {
        try {
          let show = null;
          try {
            show = await Show.findById(showId);
            if (!show) show = await Show.findOne({ showId });
          } catch (e) {
            show = store.shows.find((s) => s._id === showId || s.showId === showId);
          }
          if (!show) {
            show = store.shows.find((s) => s._id === showId || s.showId === showId);
          }

          if (show && show.tickets) {
            selectedSeats.forEach((seatNum) => {
              if (show.tickets[seatNum] && show.tickets[seatNum].status === 'locked') {
                show.tickets[seatNum].status = 'available';
                show.tickets[seatNum].lockedBy = null;
                show.tickets[seatNum].lockExpiresAt = null;
              }
            });
            if (typeof show.save === 'function') {
              show.markModified && show.markModified('tickets');
              await show.save();
            }
          }
        } catch (unlockErr) {
          console.error('[Payment Controller] Error unlocking seats on payment failure:', unlockErr.message);
        }
      }

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed: Invalid Razorpay cryptographic signature. Seats have been unlocked.',
      });
    }

    // 3. Signature Match Succeeded - Update Show Seat Map and Booking
    let show = null;
    try {
      if (showId) {
        show = await Show.findById(showId);
        if (!show) show = await Show.findOne({ showId });
      }
    } catch (e) {
      show = store.shows.find((s) => s._id === showId || s.showId === showId);
    }
    if (!show && showId) {
      show = store.shows.find((s) => s._id === showId || s.showId === showId);
    }

    if (!show) {
      return res.status(404).json({
        success: false,
        message: 'Show could not be found to confirm seats.',
      });
    }

    // Mark seats as booked in showModel
    const seatDetails = [];
    selectedSeats.forEach((seatNum) => {
      const seat = show.tickets ? show.tickets[seatNum] : null;
      if (seat) {
        seat.status = 'booked';
        seat.lockedBy = email;
        seat.lockExpiresAt = null;
        seatDetails.push({
          seatNumber: seat.seatNumber,
          tier: seat.tier || 'Middle',
          price: seat.price || 200,
        });
      }
    });

    try {
      if (typeof show.save === 'function') {
        show.markModified && show.markModified('tickets');
        await show.save();
      }
    } catch (e) {
      console.warn('[Payment Controller] In-memory update for show tickets saved');
    }

    // Calculate or take pricing
    const subtotal = bookingDetails.subtotal || seatDetails.reduce((sum, s) => sum + (s.price || 200), 0);
    const convenienceFee = bookingDetails.convenienceFee !== undefined
      ? bookingDetails.convenienceFee
      : Math.round(selectedSeats.length * 28);
    const totalAmount = bookingDetails.totalAmount || (subtotal + convenienceFee);

    // Generate Unique Booking ID
    const bookingId = `IMV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    // Get movie & theatre names
    const m = store.movies.find((x) => String(x._id) === String(show.movieId) || String(x.tmdbId) === String(show.movieId));
    const movieName = show.movieName || bookingDetails.movieName || (m ? (m.movieName || m.title) : 'Movie Feature');
    const theatreName = show.theatreName || bookingDetails.theatreName || 'iMovies Prime Multiplex';
    const showDate = show.showDate ? new Date(show.showDate).toISOString().split('T')[0] : (bookingDetails.showDate || 'Today');
    const showTime = show.showTime || bookingDetails.showTime || '07:00 PM';

    const bookingPayload = {
      bookingId,
      userEmail: email,
      showId: show.showId || show._id,
      movieName,
      theatreName,
      showDate,
      showTime,
      selectedSeats,
      seatDetails: seatDetails.length > 0 ? seatDetails : (bookingDetails.seatDetails || []),
      subtotal,
      convenienceFee,
      totalAmount,
      paymentStatus: 'Completed',
      paymentMethod: 'Razorpay',
      paymentId,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      razorpaySignature: signature,
      createdAt: new Date(),
    };

    let booking = null;
    try {
      booking = await Booking.create(bookingPayload);
    } catch (createErr) {
      booking = {
        _id: 'bkg_' + Date.now(),
        ...bookingPayload,
      };
      store.bookings.unshift(booking);
    }

    // Send ticket confirmation email via Brevo
    try {
      emailService.sendBookingConfirmationEmail(email, {
        ...bookingPayload,
        bookingId,
      }).catch((mailErr) => console.warn('[Payment Controller] Brevo email notice:', mailErr.message));
    } catch (mailErr) {}

    return res.status(200).json({
      success: true,
      message: 'Payment verified successfully and tickets confirmed! Confirmation email dispatched.',
      booking,
    });
  } catch (error) {
    console.error('[Payment Controller] Error verifying payment:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error during payment verification: ' + error.message,
    });
  }
};

/**
 * @desc    Cancel Payment & Release Locked Seats
 * @route   POST /api/payment/cancel
 * @access  Public / Authenticated
 */
const cancelPayment = async (req, res, next) => {
  try {
    const { showId, selectedSeats, userEmail } = req.body;

    if (!showId || !selectedSeats || !Array.isArray(selectedSeats)) {
      return res.status(400).json({
        success: false,
        message: 'Show ID and selected seats are required to release locks.',
      });
    }

    let show = null;
    try {
      show = await Show.findById(showId);
      if (!show) show = await Show.findOne({ showId });
    } catch (e) {
      show = store.shows.find((s) => s._id === showId || s.showId === showId);
    }
    if (!show) {
      show = store.shows.find((s) => s._id === showId || s.showId === showId);
    }

    if (show && show.tickets) {
      selectedSeats.forEach((seatNum) => {
        if (show.tickets[seatNum] && show.tickets[seatNum].status === 'locked') {
          show.tickets[seatNum].status = 'available';
          show.tickets[seatNum].lockedBy = null;
          show.tickets[seatNum].lockExpiresAt = null;
        }
      });

      if (typeof show.save === 'function') {
        show.markModified && show.markModified('tickets');
        await show.save();
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Payment dismissed and seats unlocked successfully.',
    });
  } catch (error) {
    console.error('[Payment Controller] Error in cancelPayment:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to release seats: ' + error.message,
    });
  }
};

module.exports = {
  createOrder,
  verifyPayment,
  cancelPayment,
};
