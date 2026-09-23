const pool = require('../../config/db');

const getPendingRiders = async () => {
  return pool.query(`
    SELECT
      u.id,
      u.name,
      u.dob,
      u.mobile,
      u.gmail,
      u.password,
      rp.driving_license,
      rp.image
    FROM users u
    JOIN rider_profiles rp
      ON rp.user_id = u.id
    WHERE u.role = 'rider'
      AND u.is_verified = false
    ORDER BY u.created_at DESC
  `);
};

const approveRider = async (user_id) => {
  return pool.query(
    `UPDATE users
     SET is_verified = true
     WHERE id = $1
     RETURNING id`,
    [user_id]
  );
};

module.exports = {
  getPendingRiders,
  approveRider
};
