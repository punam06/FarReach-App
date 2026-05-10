const crypto = require('crypto');
const nodemailer = require('nodemailer');

const OTP_EXPIRY_MINUTES = parseInt(process.env.OTP_EXPIRY_MINUTES || '10', 10);
const OTP_TOKEN_EXPIRY_MINUTES = parseInt(process.env.OTP_TOKEN_EXPIRY_MINUTES || '20', 10);

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp)).digest('hex');
}

function buildOtpEmailHtml({ name, otp }) {
  const safeName = name || 'Traveler';
  return `
  <div style="font-family:Arial,sans-serif;line-height:1.6;color:#1f2937;max-width:560px;margin:0 auto;padding:20px;border:1px solid #e5e7eb;border-radius:12px;">
    <h2 style="margin-top:0;color:#0f766e;">Torisom Email Verification</h2>
    <p>Hello ${safeName},</p>
    <p>Your one-time verification code is:</p>
    <div style="font-size:30px;letter-spacing:6px;font-weight:700;background:#f0fdfa;border:1px dashed #14b8a6;padding:12px;text-align:center;border-radius:10px;">
      ${otp}
    </div>
    <p style="margin-top:16px;">This code expires in ${OTP_EXPIRY_MINUTES} minutes.</p>
    <p style="font-size:12px;color:#6b7280;">If you did not create this account, you can ignore this message.</p>
  </div>`;
}

function createTransporter() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const secure = process.env.SMTP_SECURE === 'true';

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

async function sendOtpEmail({ email, name, otp }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[OTP DEV MODE] OTP for ${email}: ${otp}`);
    return { delivered: false, mode: 'console' };
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await transporter.sendMail({
    from,
    to: email,
    subject: 'Your Torisom verification code',
    html: buildOtpEmailHtml({ name, otp })
  });

  return { delivered: true, mode: 'smtp' };
}

module.exports = {
  OTP_EXPIRY_MINUTES,
  OTP_TOKEN_EXPIRY_MINUTES,
  generateOtp,
  hashOtp,
  sendOtpEmail
};
