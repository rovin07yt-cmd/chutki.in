const pool = require('../config/db');
const areaService = require("./area.service");


const updateLocation = async ({ rider_id, lat, lng }) => {

  const prevRes = await pool.query(
    `SELECT current_lat, current_lng FROM riders WHERE id = $1`,
    [rider_id]
  );

  const prev = prevRes.rows[0];

  let distance = 0;

  if (prev.current_lat && prev.current_lng) {
    const distRes = await pool.query(
      `SELECT earth_distance(
        ll_to_earth($1, $2),
        ll_to_earth($3, $4)
      ) AS dist`,
      [prev.current_lat, prev.current_lng, lat, lng]
    );

    distance = Number(distRes.rows[0].dist) / 1000; // meters → km
  }

  await pool.query(
    `UPDATE riders
     SET current_lat = $1,
         current_lng = $2,
         last_location_update = CURRENT_TIMESTAMP,
         total_distance_today = total_distance_today + $3
     WHERE id = $4`,
    [lat, lng, distance, rider_id]
  );


  const serviceable = await areaService.isServiceable(lat, lng);

  if (!serviceable) {
    await pool.query(
      `UPDATE riders
       SET is_online = false
       WHERE id = $1`,
      [rider_id]
    );
  }

  return { distance_added_km: distance };
};

module.exports = {
  updateLocation
};

// 🔥 GET RIDER LIVE LOCATION
const getRiderLocation = async (rider_id) => {
  const res = await pool.query(
    `SELECT id, current_lat, current_lng, last_location_update
     FROM riders
     WHERE id = $1`,
    [rider_id]
  );

  if (res.rows.length === 0) {
    throw new Error("Rider not found");
  }

  return res.rows[0];
};

module.exports.getRiderLocation = getRiderLocation;
