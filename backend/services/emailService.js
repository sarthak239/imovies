/**
 * iMovies Brevo (Sendinblue) Transactional Email Service
 * Production-grade transactional emails with Amazon Prime Video aesthetics.
 */
const axios = require('axios');
const { brevoClient, BREVO_API_KEY, SENDER_EMAIL, SENDER_NAME } = require('../config/emailConfig');

/**
 * Common Base Email Sender
 * Uses @getbrevo/brevo SDK with Axios REST fallback for maximum resilience.
 */
const sendEmail = async ({ to, subject, htmlContent, textContent, replyTo, tags }) => {
  if (!to) {
    throw new Error('[Email Service] "to" recipient is required.');
  }

  const recipientEmail = typeof to === 'string' ? to : to.email;
  const recipientName = typeof to === 'object' && to.name ? to.name : recipientEmail.split('@')[0];

  const payload = {
    sender: {
      name: SENDER_NAME || 'iMovies',
      email: SENDER_EMAIL || 'en24cs3010933@medicaps.ac.in',
    },
    to: [
      {
        email: recipientEmail,
        name: recipientName,
      },
    ],
    subject: subject || 'Notification from iMovies',
    htmlContent: htmlContent || '<p>Hello from iMovies</p>',
    textContent: textContent || 'Hello from iMovies',
  };

  if (replyTo) {
    payload.replyTo = typeof replyTo === 'string' ? { email: replyTo } : replyTo;
  }

  if (tags && Array.isArray(tags)) {
    payload.tags = tags;
  }

  // 1. Primary: Send via official @getbrevo/brevo SDK
  if (brevoClient && brevoClient.transactionalEmails) {
    try {
      const response = await brevoClient.transactionalEmails.sendTransacEmail(payload);
      const messageId = response?.messageId || response?.data?.messageId || 'sent_via_sdk';
      console.log(`[Email Service] Email sent successfully to ${recipientEmail} (ID: ${messageId})`);
      return {
        success: true,
        messageId,
        recipient: recipientEmail,
      };
    } catch (sdkError) {
      console.warn(`[Email Service] Brevo SDK call failed, invoking direct REST fallback: ${sdkError.message}`);
    }
  }

  // 2. Direct HTTPS fallback to Brevo v3 SMTP API
  try {
    const res = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      timeout: 12000,
    });

    const messageId = res.data?.messageId || 'sent_via_rest';
    console.log(`[Email Service] REST fallback delivered to ${recipientEmail} (ID: ${messageId})`);
    return {
      success: true,
      messageId,
      recipient: recipientEmail,
    };
  } catch (restError) {
    const errMsg = restError.response?.data?.message || restError.message;
    console.error(`[Email Service] Error sending email to ${recipientEmail}:`, errMsg);
    throw new Error(`Failed to send email via Brevo: ${errMsg}`);
  }
};

/**
 * Base Template Email Sender
 */
const sendTemplateEmail = async ({ to, templateId, params = {}, subject }) => {
  const recipientEmail = typeof to === 'string' ? to : to.email;
  const recipientName = typeof to === 'object' && to.name ? to.name : recipientEmail.split('@')[0];

  const payload = {
    sender: {
      name: SENDER_NAME,
      email: SENDER_EMAIL,
    },
    to: [{ email: recipientEmail, name: recipientName }],
    templateId: Number(templateId),
    params,
  };

  if (subject) payload.subject = subject;

  try {
    if (brevoClient?.transactionalEmails) {
      const response = await brevoClient.transactionalEmails.sendTransacEmail(payload);
      return { success: true, messageId: response?.messageId || 'sent_via_sdk' };
    }

    const res = await axios.post('https://api.brevo.com/v3/smtp/email', payload, {
      headers: { 'api-key': BREVO_API_KEY, 'Content-Type': 'application/json' },
    });
    return { success: true, messageId: res.data?.messageId || 'sent_via_rest' };
  } catch (err) {
    console.error(`[Email Service] Error sending template email ${templateId}:`, err.message);
    throw err;
  }
};

// ============================================================================
// HTML Email Template Generators (Amazon Prime Video Dark Aesthetic)
// ============================================================================

const emailWrapper = (content, previewText = 'iMovies Cinema Notification') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>iMovies Cinema</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b1116; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #ffffff;">
  <!-- Preview Text -->
  <div style="display: none; max-height: 0px; overflow: hidden; opacity: 0; font-size: 1px;">
    ${previewText}
  </div>

  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #0b1116; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #141d26; border-radius: 12px; overflow: hidden; border: 1px solid #233446; box-shadow: 0 10px 30px rgba(0,0,0,0.6);">
          <!-- Header Banner -->
          <tr>
            <td style="padding: 24px 32px; background: linear-gradient(135deg, #0f171e 0%, #1a242f 100%); border-bottom: 2px solid #00a8e1;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td>
                    <span style="font-size: 26px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;">
                      i<span style="color: #00a8e1;">Movies</span>
                    </span>
                    <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color: #8ea3b0; margin-top: 3px;">
                      Prime Multiplex & Live Cinema
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: rgba(0, 168, 225, 0.15); color: #00a8e1; border: 1px solid rgba(0, 168, 225, 0.4); padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                      Verified
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px; color: #d1dbe3; font-size: 14px; line-height: 1.6;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #0d151d; border-top: 1px solid #1f2d3d; text-align: center; color: #6d8494; font-size: 12px;">
              <p style="margin: 0 0 8px 0; color: #8ea3b0;">
                iMovies Inc. • Premium Movie Reservation Platform
              </p>
              <p style="margin: 0 0 12px 0;">
                Need assistance? Contact us at <a href="mailto:${SENDER_EMAIL}" style="color: #00a8e1; text-decoration: none;">${SENDER_EMAIL}</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #4e6373;">
                This is an automated transactional security email from iMovies. Please do not reply directly.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

// ============================================================================
// Core Feature Wrappers
// ============================================================================

/**
 * 1. Send Account Verification Email (with OTP & Activation Link)
 */
const sendVerificationEmail = async (email, { verificationToken, verificationLink, otp, name } = {}) => {
  const userName = name || email.split('@')[0];
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const directLink = verificationLink || `${clientUrl}/register?token=${verificationToken || ''}&email=${encodeURIComponent(email)}`;

  const content = `
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px; font-weight: 800;">
      Welcome to iMovies, ${userName}! 🍿
    </h2>
    <p style="color: #a0b2c1; font-size: 14px; line-height: 1.6;">
      Thank you for registering. To ensure security and activate your account, please verify your email address using the One-Time Password (OTP) below:
    </p>

    <!-- OTP Display Box -->
    <div style="text-align: center; margin: 32px 0; padding: 24px; background-color: #0e1620; border-radius: 10px; border: 1px solid #23374d;">
      <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #8ea3b0; margin-bottom: 12px;">
        Your 6-Digit Verification Code (OTP)
      </div>
      <div style="display: inline-block; background-color: #1a2736; border: 2px dashed #00a8e1; border-radius: 8px; padding: 14px 28px; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #00a8e1; font-family: monospace;">
        ${otp || '123456'}
      </div>
      <div style="font-size: 12px; color: #f59e0b; margin-top: 14px; font-weight: 600;">
        ⏱ Expires in 10 minutes. Enter this code on the verification screen.
      </div>
    </div>

    <p style="color: #a0b2c1; font-size: 13px; text-align: center; margin: 20px 0 10px 0;">
      Alternatively, you can activate your account immediately by clicking the button below:
    </p>

    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${directLink}" style="display: inline-block; background-color: #00a8e1; color: #ffffff; padding: 13px 32px; border-radius: 6px; text-decoration: none; font-weight: 800; font-size: 14px; box-shadow: 0 4px 15px rgba(0, 168, 225, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
        Verify Account Online &rarr;
      </a>
    </div>

    <div style="background-color: #1a242f; border-left: 4px solid #00a8e1; padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 12px; color: #8ea3b0;">
      If you did not create an account on iMovies, please disregard this email. Your email address remains safe.
    </div>
  `;

  return sendEmail({
    to: { email, name: userName },
    subject: `[iMovies] ${otp} is your verification code`,
    htmlContent: emailWrapper(content, `Your verification code is ${otp}`),
    textContent: `Welcome to iMovies! Your verification OTP code is: ${otp}. It expires in 10 minutes. Direct verification link: ${directLink}`,
    tags: ['account_verification', 'registration_otp'],
  });
};

/**
 * 2. Send Secure Password Recovery Email (with OTP & Reset Link)
 */
const sendPasswordResetEmail = async (email, { resetToken, resetLink, otp, name } = {}) => {
  const userName = name || email.split('@')[0];
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const directLink = resetLink || `${clientUrl}/login?resetToken=${resetToken || ''}&email=${encodeURIComponent(email)}`;

  const content = `
    <h2 style="color: #ffffff; margin-top: 0; font-size: 22px; font-weight: 800;">
      Password Reset Request 🔐
    </h2>
    <p style="color: #a0b2c1; font-size: 14px; line-height: 1.6;">
      We received a request to reset the password for your iMovies account (<strong>${email}</strong>). Use the secure recovery code below:
    </p>

    <!-- Reset OTP Box -->
    <div style="text-align: center; margin: 32px 0; padding: 24px; background-color: #0e1620; border-radius: 10px; border: 1px solid #23374d;">
      <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px; color: #8ea3b0; margin-bottom: 12px;">
        Password Recovery Code (OTP)
      </div>
      <div style="display: inline-block; background-color: #1a2736; border: 2px dashed #e50914; border-radius: 8px; padding: 14px 28px; font-size: 34px; font-weight: 900; letter-spacing: 10px; color: #ff4d58; font-family: monospace;">
        ${otp || '654321'}
      </div>
      <div style="font-size: 12px; color: #f59e0b; margin-top: 14px; font-weight: 600;">
        ⏱ Valid for 15 minutes. Never share your recovery OTP.
      </div>
    </div>

    <div style="text-align: center; margin-bottom: 28px;">
      <a href="${directLink}" style="display: inline-block; background-color: #e50914; color: #ffffff; padding: 13px 32px; border-radius: 6px; text-decoration: none; font-weight: 800; font-size: 14px; box-shadow: 0 4px 15px rgba(229, 9, 20, 0.4); text-transform: uppercase; letter-spacing: 0.5px;">
        Reset Password Now &rarr;
      </a>
    </div>

    <div style="background-color: #1a242f; border-left: 4px solid #e50914; padding: 12px 16px; border-radius: 0 6px 6px 0; font-size: 12px; color: #8ea3b0;">
      <strong>Security Notice:</strong> If you did not request a password reset, your credentials are still secure. You can safely ignore this email.
    </div>
  `;

  return sendEmail({
    to: { email, name: userName },
    subject: `[iMovies] Password Recovery Code: ${otp}`,
    htmlContent: emailWrapper(content, `Your iMovies password reset code is ${otp}`),
    textContent: `Your iMovies password recovery code is: ${otp}. It expires in 15 minutes. Reset link: ${directLink}`,
    tags: ['password_reset', 'recovery_otp'],
  });
};

/**
 * 3. Send Booking Confirmation Email (Digital Ticket Boarding Pass)
 */
const sendBookingConfirmationEmail = async (email, bookingDetails = {}) => {
  const {
    bookingId = 'IMV-XXXXX',
    movieName = 'Movie Feature',
    theatreName = 'iMovies Prime Multiplex',
    showDate = 'Today',
    showTime = '07:30 PM',
    selectedSeats = [],
    seatDetails = [],
    totalAmount = 0,
    paymentMethod = 'Razorpay',
    paymentId = '',
  } = bookingDetails;

  const seatsList = Array.isArray(selectedSeats) ? selectedSeats.join(', ') : 'Seats reserved';
  const formattedAmount = `₹${totalAmount}`;

  const content = `
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="display: inline-block; background-color: rgba(16, 185, 129, 0.15); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
        ✓ Ticket Booking Confirmed
      </span>
      <h2 style="color: #ffffff; margin: 12px 0 4px 0; font-size: 24px; font-weight: 900;">
        Get Ready for the Show! 🎬
      </h2>
      <p style="color: #8ea3b0; font-size: 13px; margin: 0;">
        Booking Reference: <strong style="color: #00a8e1; letter-spacing: 0.5px;">${bookingId}</strong>
      </p>
    </div>

    <!-- Digital Boarding Pass Ticket Card -->
    <div style="background: linear-gradient(180deg, #182330 0%, #101820 100%); border: 1px solid #2b3d52; border-radius: 12px; overflow: hidden; margin: 24px 0;">
      <!-- Ticket Header -->
      <div style="padding: 20px; background-color: #1a2838; border-bottom: 1px dashed #34485f;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td>
              <div style="font-size: 11px; text-transform: uppercase; color: #00a8e1; font-weight: 800; letter-spacing: 1px;">
                Movie Title
              </div>
              <div style="font-size: 20px; font-weight: 900; color: #ffffff; margin-top: 2px;">
                ${movieName}
              </div>
            </td>
            <td align="right">
              <div style="font-size: 11px; text-transform: uppercase; color: #8ea3b0; font-weight: bold;">
                Total Paid
              </div>
              <div style="font-size: 22px; font-weight: 900; color: #10b981; margin-top: 2px;">
                ${formattedAmount}
              </div>
            </td>
          </tr>
        </table>
      </div>

      <!-- Ticket Details Grid -->
      <div style="padding: 20px;">
        <table width="100%" border="0" cellspacing="0" cellpadding="8" style="font-size: 13px;">
          <tr>
            <td width="50%" style="border-bottom: 1px solid #213042;">
              <span style="color: #6d8494; font-size: 11px; text-transform: uppercase; display: block;">Cinema Venue</span>
              <strong style="color: #ffffff;">${theatreName}</strong>
            </td>
            <td width="50%" style="border-bottom: 1px solid #213042;">
              <span style="color: #6d8494; font-size: 11px; text-transform: uppercase; display: block;">Date & Time</span>
              <strong style="color: #00a8e1;">${showDate} • ${showTime}</strong>
            </td>
          </tr>
          <tr>
            <td style="padding-top: 14px;">
              <span style="color: #6d8494; font-size: 11px; text-transform: uppercase; display: block;">Confirmed Seats</span>
              <strong style="color: #ffffff; font-size: 16px; background-color: #00a8e1; padding: 2px 8px; border-radius: 4px; display: inline-block; margin-top: 4px;">${seatsList}</strong>
            </td>
            <td style="padding-top: 14px;">
              <span style="color: #6d8494; font-size: 11px; text-transform: uppercase; display: block;">Payment Ref</span>
              <span style="color: #8ea3b0; font-family: monospace; font-size: 12px;">${paymentId || paymentMethod}</span>
            </td>
          </tr>
        </table>
      </div>

      <!-- Barcode / QR Simulation Strip -->
      <div style="background-color: #0c1218; padding: 16px 20px; border-top: 2px dashed #28394d; text-align: center;">
        <div style="font-family: monospace; font-size: 18px; letter-spacing: 6px; color: #4e677c; font-weight: bold; margin-bottom: 4px;">
          ||| | ||||| || |||| ||| |||| | |||
        </div>
        <div style="font-size: 11px; color: #8ea3b0; letter-spacing: 1px;">
          SCAN AT MULTIPLEX TURNSTILE • ${bookingId}
        </div>
      </div>
    </div>

    <!-- Quick instructions -->
    <div style="background-color: #141f2b; border-radius: 8px; padding: 14px 18px; font-size: 12px; color: #8ea3b0; margin-bottom: 24px;">
      <strong style="color: #ffffff;">Multiplex Entry Instructions:</strong>
      <ul style="margin: 6px 0 0 0; padding-left: 18px;">
        <li>Please display this digital confirmation or QR barcode on your mobile device at the entrance.</li>
        <li>Outside food and beverages are not allowed inside the auditorium.</li>
        <li>Doors open 15 minutes prior to showtime.</li>
      </ul>
    </div>

    <div style="text-align: center;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/bookings" style="display: inline-block; background-color: #00a8e1; color: #ffffff; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 800; font-size: 13px; text-transform: uppercase;">
        View Ticket in My Account &rarr;
      </a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `[iMovies] Ticket Confirmed! ${movieName} (${bookingId})`,
    htmlContent: emailWrapper(content, `Your tickets for ${movieName} at ${theatreName} are confirmed!`),
    textContent: `Ticket Confirmed! Booking ID: ${bookingId}. Movie: ${movieName}. Theatre: ${theatreName}. Showtime: ${showDate} ${showTime}. Seats: ${seatsList}. Total: ${formattedAmount}.`,
    tags: ['booking_confirmation', 'ticket_receipt'],
  });
};

/**
 * 4. Send Booking Status Update Email (Confirmed, Updated, Cancelled)
 */
const sendBookingStatusUpdateEmail = async (email, statusDetails = {}) => {
  const {
    bookingId = 'IMV-XXXXX',
    status = 'Updated',
    movieName = 'Movie Feature',
    refundAmount = null,
    notes = '',
  } = statusDetails;

  const isCancelled = status.toLowerCase().includes('cancel');
  const badgeColor = isCancelled ? '#ef4444' : '#10b981';
  const badgeBg = isCancelled ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';

  const content = `
    <div style="text-align: center; margin-bottom: 20px;">
      <span style="display: inline-block; background-color: ${badgeBg}; color: ${badgeColor}; border: 1px solid ${badgeColor}; padding: 5px 14px; border-radius: 20px; font-size: 12px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase;">
        Booking Status: ${status}
      </span>
      <h2 style="color: #ffffff; margin: 12px 0 4px 0; font-size: 22px; font-weight: 900;">
        Reservation Update
      </h2>
      <p style="color: #8ea3b0; font-size: 13px; margin: 0;">
        Booking Reference: <strong style="color: #ffffff;">${bookingId}</strong>
      </p>
    </div>

    <div style="background-color: #16202c; border: 1px solid #283749; border-radius: 10px; padding: 20px; margin: 20px 0; font-size: 13px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="6">
        <tr>
          <td style="color: #8ea3b0;" width="40%">Movie Feature:</td>
          <td style="color: #ffffff; font-weight: bold;">${movieName}</td>
        </tr>
        <tr>
          <td style="color: #8ea3b0;">Current Status:</td>
          <td style="color: ${badgeColor}; font-weight: bold; text-transform: uppercase;">${status}</td>
        </tr>
        ${refundAmount ? `
        <tr>
          <td style="color: #8ea3b0;">Refund Status:</td>
          <td style="color: #10b981; font-weight: bold;">₹${refundAmount} credited back to original payment method</td>
        </tr>` : ''}
        ${notes ? `
        <tr>
          <td style="color: #8ea3b0;">Notes:</td>
          <td style="color: #d1dbe3;">${notes}</td>
        </tr>` : ''}
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/bookings" style="display: inline-block; background-color: #1a2736; border: 1px solid #00a8e1; color: #00a8e1; padding: 10px 24px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 13px;">
        Manage My Bookings &rarr;
      </a>
    </div>
  `;

  return sendEmail({
    to: email,
    subject: `[iMovies] Booking Status Update: ${status} (${bookingId})`,
    htmlContent: emailWrapper(content, `Status update for booking ${bookingId}: ${status}`),
    textContent: `Status update for booking ${bookingId}: ${status}. Movie: ${movieName}. ${notes}`,
    tags: ['booking_status_update'],
  });
};

module.exports = {
  sendEmail,
  sendTemplateEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendBookingConfirmationEmail,
  sendBookingStatusUpdateEmail,
};
