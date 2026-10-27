const express = require('express');
const router = express.Router();
const {
  lockSeats,
  unlockSeats,
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/lock', lockSeats);
router.post('/unlock', unlockSeats);
router.post('/', protect, createBooking);
router.get('/my-bookings', protect, getMyBookings);
router.get('/', protect, getAllBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);

module.exports = router;
