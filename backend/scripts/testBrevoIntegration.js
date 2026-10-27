const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const emailConfig = require('../config/emailConfig');
const emailService = require('../services/emailService');
const store = require('../config/store');

async function runTests() {
  console.log('========================================================');
  console.log('    iMovies - Brevo Transactional Email Test Suite     ');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, details = '') {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${details}`);
      failed++;
    }
  }

  // 1. Environment Config Validation
  console.log('--- Step 1: Brevo Environment & Config Validation ---');
  assert(
    Boolean(process.env.BREVO_API_KEY),
    'BREVO_API_KEY configured and formatted properly'
  );
  assert(
    process.env.SENDER_EMAIL === 'en24cs3010933@medicaps.ac.in',
    'SENDER_EMAIL matches configured address (en24cs3010933@medicaps.ac.in)'
  );
  assert(
    process.env.SENDER_NAME === 'iMovies',
    'SENDER_NAME is set to "iMovies"'
  );
  assert(
    emailConfig.isConfigured === true,
    'Centralized emailConfig validated and marked active'
  );

  // 2. Direct Brevo API Account Verification
  console.log('\n--- Step 2: Brevo API Connectivity & Authenticated Account ---');
  try {
    const acc = await emailConfig.brevoClient.account.getAccount();
    assert(
      acc && (acc.email || acc.companyName),
      `Brevo authenticated account verified: ${acc.email} (${acc.companyName})`
    );
  } catch (err) {
    assert(false, 'Brevo API Account Verification', err.message);
  }

  // 3. Live Transactional Email Delivery (to SENDER_EMAIL)
  const testRecipient = process.env.SENDER_EMAIL;
  console.log(`\n--- Step 3: Transactional Email Core Feature Wrappers (To: ${testRecipient}) ---`);

  // 3.1 Verification Email with 6-digit OTP
  try {
    const verRes = await emailService.sendVerificationEmail(testRecipient, {
      name: 'Alex Cinephile',
      otp: '782914',
      verificationToken: 'token_abc123',
    });
    assert(
      verRes && verRes.success === true,
      `sendVerificationEmail sent with OTP 782914 (MessageId: ${verRes?.messageId})`
    );
  } catch (err) {
    assert(false, 'sendVerificationEmail execution', err.message);
  }

  // 3.2 Password Reset Email with OTP
  try {
    const resetRes = await emailService.sendPasswordResetEmail(testRecipient, {
      name: 'Alex Cinephile',
      otp: '319402',
      resetToken: 'reset_xyz789',
    });
    assert(
      resetRes && resetRes.success === true,
      `sendPasswordResetEmail sent with OTP 319402 (MessageId: ${resetRes?.messageId})`
    );
  } catch (err) {
    assert(false, 'sendPasswordResetEmail execution', err.message);
  }

  // 3.3 Booking Confirmation Ticket Email
  try {
    const bookRes = await emailService.sendBookingConfirmationEmail(testRecipient, {
      bookingId: 'IMV-TEST-8899',
      movieName: 'Dune: Part Two (IMAX)',
      theatreName: 'PVR Prime IMAX: Downtown Hub',
      showDate: '2026-10-30',
      showTime: '08:30 PM',
      selectedSeats: ['A4', 'A5'],
      totalAmount: 640,
      paymentMethod: 'Razorpay',
      paymentId: 'pay_test_998877',
    });
    assert(
      bookRes && bookRes.success === true,
      `sendBookingConfirmationEmail sent cinema boarding pass (MessageId: ${bookRes?.messageId})`
    );
  } catch (err) {
    assert(false, 'sendBookingConfirmationEmail execution', err.message);
  }

  // 3.4 Booking Status Update Email
  try {
    const statusRes = await emailService.sendBookingStatusUpdateEmail(testRecipient, {
      bookingId: 'IMV-TEST-8899',
      status: 'Cancelled',
      movieName: 'Dune: Part Two (IMAX)',
      refundAmount: 640,
      notes: 'Customer requested cancellation before showtime. Full refund issued.',
    });
    assert(
      statusRes && statusRes.success === true,
      `sendBookingStatusUpdateEmail sent status notification (MessageId: ${statusRes?.messageId})`
    );
  } catch (err) {
    assert(false, 'sendBookingStatusUpdateEmail execution', err.message);
  }

  // 4. Express REST API Routes & Auth Endpoints Verification
  console.log('\n--- Step 4: Express REST Routes & Authentication Flow ---');
  await store.init();

  const express = require('express');
  const app = express();
  app.use(express.json());

  app.use('/api/auth', require('../routes/authRoutes'));
  app.use('/api/email', require('../routes/emailRoutes'));

  const PORT = 5896;
  const server = app.listen(PORT);

  const client = axios.create({
    baseURL: `http://127.0.0.1:${PORT}`,
    timeout: 30000,
  });

  try {
    // 4.1 Test endpoint POST /api/email/send-test
    const testApiRes = await client.post('/api/email/send-test', {
      email: testRecipient,
    });
    assert(
      testApiRes.data.success === true,
      'POST /api/email/send-test executed successfully'
    );

    // 4.2 Register new user (should require OTP verification)
    const testUserEmail = `viewer_${Date.now()}@example.com`;
    const regRes = await client.post('/api/auth/register', {
      username: 'MovieFanatic',
      email: testUserEmail,
      password: 'password123',
    });

    assert(
      regRes.data.success === true && regRes.data.requiresVerification === true,
      'POST /api/auth/register creates user and returns requiresVerification: true'
    );

    // Find the OTP stored on this user
    const pendingUser = store.users.find((u) => u.email === testUserEmail);
    assert(
      pendingUser && pendingUser.verificationOTP && pendingUser.isVerified === false,
      `Pending user stored with 6-digit OTP: ${pendingUser?.verificationOTP}`
    );

    // 4.3 Attempt login before verification -> Should be rejected with requiresVerification: true
    try {
      await client.post('/api/auth/login', {
        email: testUserEmail,
        password: 'password123',
      });
      assert(false, 'Login before verification should be blocked');
    } catch (loginErr) {
      assert(
        loginErr.response?.status === 403 && loginErr.response?.data?.requiresVerification === true,
        'POST /api/auth/login blocks unverified user with HTTP 403 requiresVerification'
      );
    }

    // 4.4 Verify user with invalid OTP -> Should fail
    try {
      await client.post('/api/auth/verify-otp', {
        email: testUserEmail,
        otp: '000000',
      });
      assert(false, 'Invalid OTP should fail');
    } catch (otpErr) {
      assert(
        otpErr.response?.status === 400,
        'POST /api/auth/verify-otp rejects incorrect OTP code'
      );
    }

    // 4.5 Verify user with VALID OTP -> Should activate account and return JWT token
    const verifyOtpRes = await client.post('/api/auth/verify-otp', {
      email: testUserEmail,
      otp: pendingUser.verificationOTP,
    });

    assert(
      verifyOtpRes.data.success === true && verifyOtpRes.data.token && verifyOtpRes.data.user.role === 'user',
      'POST /api/auth/verify-otp successfully verified account and issued JWT auth token'
    );
    assert(
      pendingUser.isVerified === true,
      'User isVerified state updated to true'
    );

    // 4.6 Forgot Password Flow: Request Reset Code
    const forgotRes = await client.post('/api/auth/forgot-password', {
      email: testUserEmail,
    });
    assert(
      forgotRes.data.success === true,
      'POST /api/auth/forgot-password sent recovery OTP'
    );

    const resetOtp = pendingUser.resetPasswordOTP;
    assert(
      Boolean(resetOtp),
      `Reset OTP generated on user: ${resetOtp}`
    );

    // 4.7 Reset Password using the OTP
    const resetRes = await client.post('/api/auth/reset-password', {
      email: testUserEmail,
      otp: resetOtp,
      newPassword: 'newSecurePassword456',
    });

    assert(
      resetRes.data.success === true,
      'POST /api/auth/reset-password reset user password with OTP'
    );

    // 4.8 Login with new password -> Should succeed
    const newLoginRes = await client.post('/api/auth/login', {
      email: testUserEmail,
      password: 'newSecurePassword456',
    });

    assert(
      newLoginRes.data.success === true && newLoginRes.data.token,
      'POST /api/auth/login successfully authenticated with the new password'
    );

  } catch (apiErr) {
    assert(false, 'Express REST endpoints execution', apiErr.response?.data?.message || apiErr.message);
  } finally {
    server.close();
  }

  console.log('\n========================================================');
  console.log(`  Tests Completed: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((e) => {
  console.error('Fatal Test Suite Error:', e);
  process.exit(1);
});
