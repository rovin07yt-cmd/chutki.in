const pool = require("../config/db");
const areaService = require("./area.service");

const updateLocation = async ({ user_id, lat, lng }) => {

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    throw new Error("Invalid location");
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    throw new Error("Invalid location");
  }

  const riderRes = await pool.query(
    `
      SELECT
        id,
        current_lat,
        current_lng
      FROM riders
      WHERE user_id = $1
    `,
    [user_id]
  );

  if (!riderRes.rows.length) {
    throw new Error("Rider not found");
  }

  const rider = riderRes.rows[0];

  let distance = 0;

  if (
    rider.current_lat !== null &&
    rider.current_lng !== null
  ) {

    const distRes = await pool.query(
      `
        SELECT earth_distance(
          ll_to_earth($1, $2),
          ll_to_earth($3, $4)
        ) AS dist
      `,
      [
        rider.current_lat,
        rider.current_lng,
        latitude,
        longitude
      ]
    );

    distance =
      Number(distRes.rows[0].dist) / 1000;
  }

  const serviceable =
    await areaService.isServiceable(
      latitude,
      longitude
    );

  await pool.query(
    `
      UPDATE riders
      SET
        current_lat = $1,
        current_lng = $2,
        last_location_update = CURRENT_TIMESTAMP,
        total_distance_today =
          total_distance_today + $3,
        is_online =
          CASE
            WHEN $4 = false THEN false
            ELSE is_online
          END
      WHERE id = $5
    `,
    [
      latitude,
      longitude,
      distance,
      serviceable,
      rider.id
    ]
  );

  return {
    distance_added_km: distance,
    serviceable
  };
};


const getRiderLocation = async (rider_id) => {

  const res = await pool.query(
    `
      SELECT
        id,
        current_lat,
        current_lng,
        last_location_update
      FROM riders
      WHERE id = $1
    `,
    [rider_id]
  );

  if (!res.rows.length) {
    throw new Error("Rider not found");
  }

  return res.rows[0];
};


module.exports = {
  updateLocation,
  getRiderLocation
};
