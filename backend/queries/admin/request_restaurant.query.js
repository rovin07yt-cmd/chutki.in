const pool = require('../../config/db');

const getPendingRestaurants = async () => {
  return pool.query(`
    SELECT
      rp.user_id,
      rp.restaurant_name,
      rp.owner_name,
      rp.owner_mobile,
      rp.restaurant_mobile,
      rp.image,
      u.gmail,
      u.password
    FROM restaurant_profiles rp
    JOIN users u
      ON u.id = rp.user_id
    WHERE rp.is_approved = false
    ORDER BY u.created_at DESC
  `);
};

const approveRestaurant = async (user_id) => {
  return pool.query(
    `UPDATE restaurant_profiles
     SET is_approved = true
     WHERE user_id = $1
     RETURNING user_id`,
    [user_id]
  );
};

module.exports = {
  getPendingRestaurants,
  approveRestaurant
};
