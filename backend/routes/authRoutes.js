const express = require('express');
const router = express.Router();
const {
  registerUser,
  verifyOtp,
  verifyEmailLink,
  resendOtp,
  forgotPassword,
  resetPassword,
  loginUser,
  registerAdmin,
  loginAdmin,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// User Registration & Verification
router.post('/register', registerUser);
router.post('/verify-otp', verifyOtp);
router.get('/verify-email', verifyEmailLink);
router.post('/resend-otp', resendOtp);

// Password Recovery
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Authentication
router.post('/login', loginUser);
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);

// Profile
router.get('/profile', protect, getUserProfile);
router.get('/me', protect, getUserProfile);

module.exports = router;
