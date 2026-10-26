const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllBookingsAdmin,
} = require('../controllers/adminController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/dashboard-stats', protect, admin, getDashboardStats);
router.get('/bookings', protect, admin, getAllBookingsAdmin);

module.exports = router;
