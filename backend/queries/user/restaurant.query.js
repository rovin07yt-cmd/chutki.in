const pool = require('../../config/db');

const getRestaurants = async () => {
  return pool.query(`
    SELECT 
      rp.user_id,
      rp.restaurant_name,
      rp.image,
      rp.is_online,
      rp.is_approved
    FROM restaurant_profiles rp
    WHERE rp.is_approved = true
    ORDER BY rp.is_online DESC, rp.user_id DESC
  `);
};

module.exports = { getRestaurants };
