const pool = require('../config/db');

// ✅ TOGGLE ONLINE/OFFLINE
const toggleOnline = async (user_id, is_online) => {

  // update online status
  await pool.query(
    `UPDATE restaurant_profiles
     SET is_online = $1
     WHERE user_id = $2`,
    [is_online, user_id]
  );

  // 🔥 IF OFF → disable all items
  if (!is_online) {
    await pool.query(
      `UPDATE food_items
       SET is_available = false
       WHERE restaurant_id = $1`,
      [user_id]
    );
  }

  return { message: is_online ? 'Restaurant online' : 'Restaurant offline' };
};

// ✅ SET LOCATION
const setLocation = async (user_id, lat, lng) => {
  await pool.query(
    `UPDATE restaurant_profiles
     SET lat = $1, lng = $2
     WHERE user_id = $3`,
    [lat, lng, user_id]
  );

  return { message: 'Location updated' };
};

// ✅ GET LOCATION
const getLocation = async (user_id) => {
  const res = await pool.query(
    `SELECT lat, lng FROM restaurant_profiles WHERE user_id = $1`,
    [user_id]
  );

  return res.rows[0];
};

module.exports = {
  toggleOnline,
  setLocation,
  getLocation
};
