const Razorpay = require('razorpay');

const key_id = process.env.RAZORPAY_KEY_ID;
const key_secret = process.env.RAZORPAY_KEY_SECRET;

if (!key_id || !key_secret) {
  console.warn('[Razorpay Config] Warning: RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET is missing.');
}

const razorpayInstance = new Razorpay({
  key_id,
  key_secret,
});

module.exports = razorpayInstance;
