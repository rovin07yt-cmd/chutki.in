const pool = require('../config/db');

// Check if location is inside any serviceable area
const checkServiceable = async (lat, lng) => {
  const query = `
    SELECT id
    FROM serviceable_area_circles
    WHERE earth_distance(
      ll_to_earth($1, $2),
      ll_to_earth(center_lat, center_lng)
    ) <= (radius * 1000)
    LIMIT 1;
  `;

  return pool.query(query, [lat, lng]);
};

module.exports = {
  checkServiceable
};
