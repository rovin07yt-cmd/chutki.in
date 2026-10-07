const pool = require('../config/db');

const findUserByGmail = async (gmail) => {
  return pool.query(
    `SELECT id, gmail
     FROM users
     WHERE LOWER(TRIM(gmail)) = LOWER(TRIM($1))
     LIMIT 1`,
    [gmail]
  );
};

const getLatestResetOTP = async (gmail) => {
  return pool.query(
    `SELECT
       id,
       created_at,
       is_verified,
       EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - created_at)) AS elapsed_seconds
     FROM otp_logs
     WHERE LOWER(TRIM(gmail)) = LOWER(TRIM($1))
       AND type = 'reset'
     ORDER BY created_at DESC
     LIMIT 1`,
    [gmail]
  );
};

const saveResetOTP = async (gmail, otp, expiresAt) => {
  return pool.query(
    `INSERT INTO otp_logs (gmail, otp, type, expires_at)
     VALUES ($1, $2, 'reset', $3)
     RETURNING id, created_at`,
    [gmail, otp, expiresAt]
  );
};

const invalidatePreviousResetOTPs = async (gmail) => {
  return pool.query(
    `UPDATE otp_logs
     SET is_verified = true
     WHERE LOWER(TRIM(gmail)) = LOWER(TRIM($1))
       AND type = 'reset'
       AND is_verified = false`,
    [gmail]
  );
};

const verifyResetOTP = async (gmail, otp) => {
  return pool.query(
    `SELECT *
     FROM otp_logs
     WHERE LOWER(TRIM(gmail)) = LOWER(TRIM($1))
       AND otp = $2
       AND type = 'reset'
       AND is_verified = false
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`,
    [gmail, otp]
  );
};

const markOTPVerified = async (id) => {
  return pool.query(
    `UPDATE otp_logs
     SET is_verified = true
     WHERE id = $1`,
    [id]
  );
};

const updatePassword = async (gmail, hashedPassword) => {
  return pool.query(
    `UPDATE users
     SET password = $1
     WHERE LOWER(TRIM(gmail)) = LOWER(TRIM($2))`,
    [hashedPassword, gmail]
  );
};

module.exports = {
  findUserByGmail,
  getLatestResetOTP,
  saveResetOTP,
  invalidatePreviousResetOTPs,
  verifyResetOTP,
  markOTPVerified,
  updatePassword
};
