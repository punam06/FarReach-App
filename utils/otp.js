const crypto = require('crypto');

// OTP configuration
const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
const OTP_TOKEN_EXPIRY_MINUTES = parseInt(process.env.OTP_TOKEN_EXPIRY_MINUTES || '30', 10);

/**
 * Generate a 6‑digit numeric OTP as a string.
 */
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

/**
 * Hash the OTP using SHA‑256 for storage.
 * Returns a hex string.
 */
function hashOtp(otp) {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

/**
 * Stub for sending an OTP email. In production this should integrate with an email service.
 * For now we simply log the OTP details – the front‑end expects a `mode` field in the response.
 */
async function sendOtpEmail({ email, name, otp }) {
  // In a real app, replace this with actual email sending logic.
  console.log(`Sending OTP to ${email} (name: ${name}): ${otp}`);
  // Simulate a response object compatible with existing code.
  return { mode: 'email', otpSent: true };
}

module.exports = {
  generateOtp,
  hashOtp,
  sendOtpEmail,
  OTP_EXPIRY_MINUTES,
  OTP_TOKEN_EXPIRY_MINUTES,
};
