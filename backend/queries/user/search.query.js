const pool = require('../../config/db');

const searchAll = async (q) => {
  return pool.query(`
    -- FOOD RESULTS
    SELECT 
      'food' AS type,
      f.id,
      f.name,
      r.restaurant_name,
      r.is_online,
      f.is_available
    FROM food_items f
    JOIN restaurant_profiles r 
      ON r.user_id = f.restaurant_id
    WHERE LOWER(f.name) LIKE LOWER($1)

    UNION

    -- RESTAURANT RESULTS
    SELECT 
      'restaurant' AS type,
      r.user_id AS id,
      r.restaurant_name AS name,
      r.restaurant_name,
      r.is_online,
      true AS is_available
    FROM restaurant_profiles r
    WHERE LOWER(r.restaurant_name) LIKE LOWER($1)

    ORDER BY 
      is_online DESC,
      is_available DESC,
      name ASC

    LIMIT 20
  `, [`${q}%`]);
};

module.exports = {
  searchAll
};
