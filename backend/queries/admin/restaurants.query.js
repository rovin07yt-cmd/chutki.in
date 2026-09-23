const pool = require('../../config/db');

const getRestaurants = async () => {
  return pool.query(`
    SELECT
      rp.user_id,
      rp.restaurant_name,
      rp.owner_name,
      rp.owner_mobile,
      rp.restaurant_mobile,
      rp.is_online,
      rp.is_approved,
      rp.image,
      u.gmail,
      u.is_blocked,
      u.created_at
    FROM restaurant_profiles rp
    JOIN users u
      ON u.id = rp.user_id
    ORDER BY rp.restaurant_name
  `);
};

const blockRestaurant = async (user_id) => {
  return pool.query(
    `UPDATE users
     SET is_blocked = true
     WHERE id = $1
     RETURNING id`,
    [user_id]
  );
};

const unblockRestaurant = async (user_id) => {
  return pool.query(
    `UPDATE users
     SET is_blocked = false
     WHERE id = $1
     RETURNING id`,
    [user_id]
  );
};

const getRestaurantDetails = async (user_id) => {
  return pool.query(`
    SELECT
      rp.user_id,
      rp.restaurant_name,
      rp.owner_name,
      rp.owner_mobile,
      rp.restaurant_mobile,
      rp.image,
      rp.is_online,
      rp.is_approved,
      rp.lat,
      rp.lng,
      u.gmail,
      u.password,
      u.is_blocked,
      u.created_at
    FROM restaurant_profiles rp
    JOIN users u
      ON u.id = rp.user_id
    WHERE rp.user_id = $1
  `,[user_id]);
};

const getRestaurantBankDetails = async (user_id) => {
  return pool.query(
    `SELECT
      upi_id,
      account_no,
      ifsc,
      holder_name
     FROM bank_details
     WHERE user_id = $1`,
    [user_id]
  );
};

const getRestaurantStats = async (restaurant_id) => {
  return pool.query(
    `SELECT
      COUNT(*) AS total_orders,
      COUNT(*) FILTER (WHERE o.status NOT IN ( 'delivered', 'cancelled' )) AS active_orders,
      COUNT(*) FILTER (WHERE DATE(o.created_at)=CURRENT_DATE) AS today_orders
     FROM order_restaurants r
     JOIN orders o ON o.id = r.order_id
     WHERE r.restaurant_id = $1`,
    [restaurant_id]
  );
};

const getRestaurantTotalEarnings = async (restaurant_id) => {
  return pool.query(
    `SELECT
      COALESCE(SUM(e.restaurant_earning),0) AS total_earned
     FROM earnings e
     JOIN order_restaurants r
       ON r.order_id = e.order_id
     WHERE r.restaurant_id = $1`,
    [restaurant_id]
  );
};

module.exports = {
  getRestaurants,
  getRestaurantDetails,
  getRestaurantBankDetails,
  getRestaurantStats,
  getRestaurantTotalEarnings,
  blockRestaurant,
  unblockRestaurant
};
