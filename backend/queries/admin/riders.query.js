const pool = require('../../config/db');

const getRiders = async () => {
  return pool.query(`
    SELECT
      r.user_id,
      u.name,
      u.mobile,
      u.gmail,
      u.password,
      u.is_blocked,
      rp.driving_license,
      rp.image,
      r.is_online,
      r.active_items,
      r.cod_collected,
      r.cod_submitted,
      r.current_lat,
      r.current_lng,
      r.last_location_update
    FROM riders r
    JOIN users u
      ON u.id = r.user_id
    LEFT JOIN rider_profiles rp
      ON rp.user_id = r.user_id
    ORDER BY u.name
  `);
};

const blockRider = async (user_id) => {
  return pool.query(
    `UPDATE users
     SET is_blocked = true
     WHERE id = $1
     RETURNING id`,
    [user_id]
  );
};

const unblockRider = async (user_id) => {
  return pool.query(
    `UPDATE users
     SET is_blocked = false
     WHERE id = $1
     RETURNING id`,
    [user_id]
  );
};

const getRiderDetails = async (user_id) => {
  return pool.query(`
    SELECT
      r.user_id,
      u.name,
      u.mobile,
      u.gmail,
      u.password,
      u.is_blocked,
      rp.driving_license,
      rp.image,
      r.is_online,
      r.current_lat,
      r.current_lng,
      r.last_location_update,
      r.cod_collected,
      r.cod_submitted,
      u.created_at
    FROM riders r
    JOIN users u ON u.id = r.user_id
    LEFT JOIN rider_profiles rp ON rp.user_id = r.user_id
    WHERE r.user_id = $1
  `,[user_id]);
};

const getRiderBankDetails = async (user_id) => {
  return pool.query(
    `SELECT *
     FROM bank_details
     WHERE user_id = $1`,
    [user_id]
  );
};

const getRiderStats = async (user_id) => {
  return pool.query(
    `SELECT
      COUNT(*) AS total_orders,
      COUNT(*) FILTER (WHERE status = 'delivered') AS delivered_orders
     FROM rider_assignments
     WHERE rider_id IN (
       SELECT id
       FROM riders
       WHERE user_id = $1
     )`,
    [user_id]
  );
};

module.exports = {
  getRiders,
  getRiderDetails,
  getRiderBankDetails,
  getRiderStats,
  blockRider,
  unblockRider
};
