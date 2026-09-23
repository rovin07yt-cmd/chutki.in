const pool = require('../../config/db');

const getFoodDetails = async (food_id) => {
  return pool.query(`
    SELECT f.is_available, 
      f.id,
      f.name,
      f.restaurant_id,
      p.price,
      p.prep_time,
      p.mrp
    FROM food_items f
    JOIN food_prices p ON f.id = p.food_id
    WHERE f.id = $1
  `, [food_id]);
};

const getSystemSettings = async () => {
  return pool.query(`SELECT * FROM system_settings LIMIT 1`);
};

module.exports = {
  getFoodDetails,
  getSystemSettings
};
