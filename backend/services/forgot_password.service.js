const bcrypt = require('bcrypt');
const query = require('../queries/forgot_password.query');
const { sendOTPEmail } = require('./email.service');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// STEP 1 — SEND / RESEND RESET OTP
const sendResetOTP = async (gmail) => {
  gmail = (gmail || '').toString().trim().toLowerCase();

  if (!gmail) {
    throw new Error('Gmail is required');
  }

  const userResult = await query.findUserByGmail(gmail);

  if (userResult.rows.length === 0) {
    throw new Error('Please enter a correct Gmail');
  }

  // Prevent resend before 30 seconds
  const latestResult = await query.getLatestResetOTP(gmail);

  if (latestResult.rows.length > 0) {
    const elapsedSeconds = Number(latestResult.rows[0].elapsed_seconds);

    if (elapsedSeconds < 30) {
      const remaining = Math.ceil(30 - elapsedSeconds);
      throw new Error(
        `Please wait ${remaining} seconds before requesting another OTP`
      );
    }
  }

  // Invalidate previous unused reset OTPs
  await query.invalidatePreviousResetOTPs(gmail);

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

  const otpResult = await query.saveResetOTP(gmail, otp, expiresAt);
  const otpId = otpResult.rows[0].id;

  try {
    await sendOTPEmail(gmail, otp, 'reset');
  } catch (err) {
    await query.markOTPVerified(otpId);
    console.error('RESET OTP EMAIL ERROR:', err.message);
    throw new Error('Unable to send OTP email. Please try again.');
  }

  return {
    message: 'Reset OTP sent'
  };
};

// STEP 2 — VERIFY RESET OTP
const verifyResetOTP = async (gmail, otp) => {
  gmail = (gmail || '').toString().trim().toLowerCase();
  otp = (otp || '').toString().trim();

  if (!gmail || !otp) {
    throw new Error('Gmail and OTP are required');
  }

  const result = await query.verifyResetOTP(gmail, otp);

  if (result.rows.length === 0) {
    throw new Error('Invalid or expired OTP');
  }

  return {
    message: 'OTP verified',
    otp_id: result.rows[0].id
  };
};

// STEP 3 — RESET PASSWORD
const resetPassword = async (gmail, otp, newPassword) => {
  gmail = (gmail || '').toString().trim().toLowerCase();
  otp = (otp || '').toString().trim();

  if (!gmail || !otp || !newPassword) {
    throw new Error('Gmail, OTP and new password are required');
  }

  if (newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters');
  }

  const otpResult = await query.verifyResetOTP(gmail, otp);

  if (otpResult.rows.length === 0) {
    throw new Error('Invalid or expired OTP');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await query.updatePassword(gmail, hashedPassword);
  await query.markOTPVerified(otpResult.rows[0].id);

  return {
    message: 'Password reset successful'
  };
};

module.exports = {
  sendResetOTP,
  verifyResetOTP,
  resetPassword
};
