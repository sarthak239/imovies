const axios = require('axios');
const path = require('path');
const dotenv = require('dotenv');
const crypto = require('crypto');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const razorpay = require('../config/razorpay');
const store = require('../config/store');

async function runTests() {
  console.log('========================================================');
  console.log('  iMovies - Razorpay Gateway Integration Test Suite     ');
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

  // 1. Environment Variables Check
  console.log('--- Step 1: Razorpay Environment Configuration ---');
  assert(
    Boolean(process.env.RAZORPAY_KEY_ID),
    'RAZORPAY_KEY_ID configured correctly'
  );
  assert(
    Boolean(process.env.RAZORPAY_KEY_SECRET),
    'RAZORPAY_KEY_SECRET configured correctly'
  );

  // 2. Direct Razorpay Order Creation via SDK
  console.log('\n--- Step 2: Razorpay Node.js SDK Direct Order Creation ---');
  let sampleOrder = null;
  try {
    const testOrder = await razorpay.orders.create({
      amount: 48000, // 480 INR in paise
      currency: 'INR',
      receipt: `test_rcpt_${Date.now().toString().slice(-8)}`,
      notes: { test: 'sdk_integration' },
    });

    assert(
      testOrder && testOrder.id && testOrder.id.startsWith('order_'),
      `Direct Razorpay order created with ID: ${testOrder?.id}`
    );
    assert(
      testOrder.amount === 48000 && testOrder.currency === 'INR',
      `Direct order amount and currency match (48000 paise / INR)`
    );
    sampleOrder = testOrder;
  } catch (err) {
    assert(false, 'Direct Razorpay order creation via SDK', err.message);
  }

  // 3. Express REST API Endpoints Verification
  console.log('\n--- Step 3: Express Payment REST API Endpoints ---');
  await store.init();

  const express = require('express');
  const app = express();
  app.use(express.json());

  // Mount routes
  app.use('/api/movie', require('../routes/movieRoutes'));
  app.use('/api/shows', require('../routes/showRoutes'));
  app.use('/api/bookings', require('../routes/bookingRoutes'));
  app.use('/api/payment', require('../routes/paymentRoutes'));

  const PORT = 5894;
  const server = app.listen(PORT);

  const client = axios.create({
    baseURL: `http://127.0.0.1:${PORT}`,
    timeout: 30000,
  });

  try {
    // 3.1 Fetch a show or auto-schedule one
    const showsRes = await client.get('/api/shows');
    assert(
      showsRes.data.success && showsRes.data.shows.length > 0,
      `Retrieved ${showsRes.data.shows.length} shows from catalogue`
    );
    const testShow = showsRes.data.shows[0];
    const showId = testShow._id || testShow.showId;

    // 3.2 Lock seats first
    const lockSeats = ['B3', 'B4'];
    const lockRes = await client.post('/api/bookings/lock', {
      showId,
      selectedSeats: lockSeats,
      userEmail: 'user@imovies.com',
    });
    assert(
      lockRes.data.success === true,
      `Successfully locked seats [${lockSeats.join(', ')}] for payment test`
    );

    // 3.3 POST /api/payment/create-order
    const orderRes = await client.post('/api/payment/create-order', {
      amount: 560, // 560 INR
      showId,
      selectedSeats: lockSeats,
      userEmail: 'user@imovies.com',
    });

    assert(
      orderRes.data.success === true && orderRes.data.order_id && orderRes.data.order_id.startsWith('order_'),
      `POST /api/payment/create-order returned order_id: ${orderRes.data.order_id}`
    );
    assert(
      orderRes.data.amount === 56000 && orderRes.data.currency === 'INR',
      `Order amount converted to paise: ${orderRes.data.amount} paise (INR)`
    );
    assert(
      orderRes.data.key_id === process.env.RAZORPAY_KEY_ID,
      `Order response includes public key_id: ${orderRes.data.key_id}`
    );

    const generatedOrderId = orderRes.data.order_id;
    const fakePaymentId = `pay_${Date.now().toString().slice(-8)}_${Math.random().toString(36).substring(2, 6)}`;

    // 3.4 POST /api/payment/verify with INVALID signature -> Expect 400 & seat unlocking
    try {
      await client.post('/api/payment/verify', {
        razorpay_order_id: generatedOrderId,
        razorpay_payment_id: fakePaymentId,
        razorpay_signature: 'invalid_tampered_signature_1234567890',
        bookingDetails: {
          showId,
          selectedSeats: lockSeats,
          userEmail: 'user@imovies.com',
          totalAmount: 560,
        },
      });
      assert(false, 'POST /api/payment/verify with invalid signature should fail');
    } catch (err) {
      assert(
        err.response && err.response.status === 400,
        'POST /api/payment/verify rejects invalid signature with 400 Bad Request'
      );
    }

    // Verify seats were unlocked by the failure
    const showAfterFail = await client.get(`/api/shows/${showId}`);
    const seatB3 = showAfterFail.data.show?.tickets?.['B3'];
    assert(
      seatB3 && seatB3.status === 'available',
      'Seats were safely unlocked after signature verification failure'
    );

    // 3.5 Re-lock seats for valid signature test
    await client.post('/api/bookings/lock', {
      showId,
      selectedSeats: lockSeats,
      userEmail: 'user@imovies.com',
    });

    // 3.6 Generate VALID HMAC SHA-256 signature
    const validHmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
    validHmac.update(`${generatedOrderId}|${fakePaymentId}`);
    const validSignature = validHmac.digest('hex');

    // 3.7 POST /api/payment/verify with VALID signature
    const verifyRes = await client.post('/api/payment/verify', {
      razorpay_order_id: generatedOrderId,
      razorpay_payment_id: fakePaymentId,
      razorpay_signature: validSignature,
      bookingDetails: {
        showId,
        selectedSeats: lockSeats,
        userEmail: 'user@imovies.com',
        movieName: testShow.movieName || 'Live Market Movie',
        theatreName: testShow.theatreName || 'iMovies Prime Multiplex',
        totalAmount: 560,
      },
    });

    assert(
      verifyRes.data.success === true && verifyRes.data.booking !== undefined,
      `POST /api/payment/verify succeeded and created booking ${verifyRes.data.booking?.bookingId}`
    );
    assert(
      verifyRes.data.booking?.paymentStatus === 'Completed',
      `Booking paymentStatus is marked "Completed"`
    );
    assert(
      verifyRes.data.booking?.paymentMethod === 'Razorpay' &&
      verifyRes.data.booking?.razorpayOrderId === generatedOrderId &&
      verifyRes.data.booking?.razorpayPaymentId === fakePaymentId,
      `Booking preserves Razorpay order ID and payment ID reference`
    );

    // 3.8 Confirm seats are now marked "booked" in showModel
    const showAfterSuccess = await client.get(`/api/shows/${showId}`);
    const confirmedSeatB3 = showAfterSuccess.data.show?.tickets?.['B3'];
    assert(
      confirmedSeatB3 && confirmedSeatB3.status === 'booked',
      'Seat map in showModel was transitioned from locked to "booked"'
    );

    // 3.9 Test POST /api/payment/cancel
    const cancelSeats = ['C1'];
    await client.post('/api/bookings/lock', {
      showId,
      selectedSeats: cancelSeats,
      userEmail: 'user@imovies.com',
    });
    const cancelRes = await client.post('/api/payment/cancel', {
      showId,
      selectedSeats: cancelSeats,
      userEmail: 'user@imovies.com',
    });
    assert(
      cancelRes.data.success === true,
      'POST /api/payment/cancel successfully unlocked seats on dismissal'
    );

  } catch (err) {
    assert(false, 'Express REST payment execution', err.response?.data?.message || err.message);
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
  console.error('Fatal Test Error:', e);
  process.exit(1);
});
