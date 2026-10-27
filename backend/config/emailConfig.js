/**
 * Brevo (Sendinblue) Centralized Configuration and SDK Client
 */
const { BrevoClient } = require('@getbrevo/brevo');
const dotenv = require('dotenv');
const path = require('path');

// Ensure environment variables are loaded
dotenv.config({ path: path.join(__dirname, '../.env') });

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const SENDER_EMAIL = process.env.SENDER_EMAIL || 'en24cs3010933@medicaps.ac.in';
const SENDER_NAME = process.env.SENDER_NAME || 'iMovies';

if (!BREVO_API_KEY) {
  console.warn('[Brevo Config] WARNING: BREVO_API_KEY environment variable is not set.');
}

if (!SENDER_EMAIL) {
  console.warn('[Brevo Config] WARNING: SENDER_EMAIL environment variable is not set.');
}

let brevoClient = null;
try {
  brevoClient = new BrevoClient({
    apiKey: BREVO_API_KEY,
  });
} catch (err) {
  console.error('[Brevo Config] Failed to initialize BrevoClient:', err.message);
}

module.exports = {
  brevoClient,
  BREVO_API_KEY,
  SENDER_EMAIL,
  SENDER_NAME,
  isConfigured: Boolean(BREVO_API_KEY && SENDER_EMAIL),
};
