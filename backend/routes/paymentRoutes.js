const express = require('express');
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  cancelPayment,
} = require('../controllers/paymentController');

// Razorpay Payment Routes
router.post('/create-order', createOrder);
router.post('/verify', verifyPayment);
router.post('/cancel', cancelPayment);

module.exports = router;
