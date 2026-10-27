const express = require('express');
const router = express.Router();
const {
  sendVerification,
  sendPasswordReset,
  sendBookingConfirmation,
  sendBookingStatusUpdate,
  sendTestEmail,
} = require('../controllers/emailController');

router.post('/send-verification', sendVerification);
router.post('/send-reset-password', sendPasswordReset);
router.post('/send-booking-confirmation', sendBookingConfirmation);
router.post('/send-status-update', sendBookingStatusUpdate);
router.post('/send-test', sendTestEmail);

module.exports = router;
