/**
 * Brevo Transactional Email Controller
 */
const emailService = require('../services/emailService');

/**
 * @desc    Send account verification email (link + OTP)
 * @route   POST /api/email/send-verification
 * @access  Public / Authenticated
 */
const sendVerification = async (req, res, next) => {
  try {
    const { email, otp, name, verificationToken, verificationLink } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required.',
      });
    }

    const generatedOtp = otp || Math.floor(100000 + Math.random() * 900000).toString();

    const result = await emailService.sendVerificationEmail(email, {
      otp: generatedOtp,
      name,
      verificationToken,
      verificationLink,
    });

    return res.status(200).json({
      success: true,
      message: `Verification email sent successfully to ${email}.`,
      data: result,
    });
  } catch (error) {
    console.error('[Email Controller] sendVerification error:', error.message);
    const statusCode = error.response?.status === 429 ? 429 : 500;
    return res.status(statusCode).json({
      success: false,
      message: 'Failed to send verification email: ' + error.message,
    });
  }
};

/**
 * @desc    Send password reset email (link + OTP)
 * @route   POST /api/email/send-reset-password
 * @access  Public
 */
const sendPasswordReset = async (req, res, next) => {
  try {
    const { email, otp, name, resetToken, resetLink } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email is required.',
      });
    }

    const generatedOtp = otp || Math.floor(100000 + Math.random() * 900000).toString();

    const result = await emailService.sendPasswordResetEmail(email, {
      otp: generatedOtp,
      name,
      resetToken,
      resetLink,
    });

    return res.status(200).json({
      success: true,
      message: `Password reset email sent to ${email}.`,
      data: result,
    });
  } catch (error) {
    console.error('[Email Controller] sendPasswordReset error:', error.message);
    const statusCode = error.response?.status === 429 ? 429 : 500;
    return res.status(statusCode).json({
      success: false,
      message: 'Failed to send password recovery email: ' + error.message,
    });
  }
};

/**
 * @desc    Send digital ticket booking confirmation
 * @route   POST /api/email/send-booking-confirmation
 * @access  Public / Authenticated
 */
const sendBookingConfirmation = async (req, res, next) => {
  try {
    const { email, bookingDetails } = req.body;

    if (!email || !bookingDetails) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email and bookingDetails are required.',
      });
    }

    const result = await emailService.sendBookingConfirmationEmail(email, bookingDetails);

    return res.status(200).json({
      success: true,
      message: `Booking confirmation ticket sent to ${email}.`,
      data: result,
    });
  } catch (error) {
    console.error('[Email Controller] sendBookingConfirmation error:', error.message);
    const statusCode = error.response?.status === 429 ? 429 : 500;
    return res.status(statusCode).json({
      success: false,
      message: 'Failed to send booking confirmation email: ' + error.message,
    });
  }
};

/**
 * @desc    Send booking status update (cancellation, updates)
 * @route   POST /api/email/send-status-update
 * @access  Public / Authenticated
 */
const sendBookingStatusUpdate = async (req, res, next) => {
  try {
    const { email, statusDetails } = req.body;

    if (!email || !statusDetails) {
      return res.status(400).json({
        success: false,
        message: 'Recipient email and statusDetails are required.',
      });
    }

    const result = await emailService.sendBookingStatusUpdateEmail(email, statusDetails);

    return res.status(200).json({
      success: true,
      message: `Booking status update email sent to ${email}.`,
      data: result,
    });
  } catch (error) {
    console.error('[Email Controller] sendBookingStatusUpdate error:', error.message);
    const statusCode = error.response?.status === 429 ? 429 : 500;
    return res.status(statusCode).json({
      success: false,
      message: 'Failed to send booking status email: ' + error.message,
    });
  }
};

/**
 * @desc    Send direct test email to verify credentials right away
 * @route   POST /api/email/send-test
 * @access  Public
 */
const sendTestEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const targetEmail = email || process.env.SENDER_EMAIL || 'en24cs3010933@medicaps.ac.in';

    const result = await emailService.sendEmail({
      to: targetEmail,
      subject: '[iMovies] Brevo Transactional Email Service Test',
      htmlContent: `
        <div style="font-family: sans-serif; background: #0f171e; color: #fff; padding: 24px; border-radius: 8px;">
          <h2 style="color: #00a8e1;">✓ Brevo Email Service Online</h2>
          <p>Congratulations! Your Brevo transactional email integration with iMovies is working perfectly.</p>
          <p>Timestamp: <strong>${new Date().toISOString()}</strong></p>
        </div>
      `,
      textContent: `Brevo email service test successful at ${new Date().toISOString()}`,
    });

    return res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${targetEmail}`,
      data: result,
    });
  } catch (error) {
    console.error('[Email Controller] sendTestEmail error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Test email failed: ' + error.message,
    });
  }
};

module.exports = {
  sendVerification,
  sendPasswordReset,
  sendBookingConfirmation,
  sendBookingStatusUpdate,
  sendTestEmail,
};
