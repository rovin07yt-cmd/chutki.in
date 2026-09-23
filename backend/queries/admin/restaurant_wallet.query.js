const pool = require('../../config/db');

const getRestaurantsWallet = async () => {
  return pool.query(
    `
    SELECT
      rp.user_id,
      rp.restaurant_name,
      rp.owner_mobile,
      rp.image,
      COALESCE(SUM(e.restaurant_earning),0) AS total_earnings
    FROM restaurant_profiles rp
    LEFT JOIN order_restaurants r
      ON r.restaurant_id = rp.user_id
    LEFT JOIN earnings e
      ON e.order_id = r.order_id
    GROUP BY
      rp.user_id,
      rp.restaurant_name,
      rp.owner_mobile,
      rp.image
    ORDER BY rp.restaurant_name
    `
  );
};

const getRestaurantProfile = async (user_id) => {
  return pool.query(
    `
    SELECT
      rp.*,
      u.name,
      u.mobile,
      u.gmail,
      u.password
    FROM restaurant_profiles rp
    JOIN users u
      ON u.id = rp.user_id
    WHERE rp.user_id = $1
    `,
    [user_id]
  );
};

const getBankDetails = async (user_id) => {
  return pool.query(
    `
    SELECT
      upi_id,
      account_no,
      ifsc,
      holder_name
    FROM bank_details
    WHERE user_id = $1
    `,
    [user_id]
  );
};

const getRestaurantEarnings = async (restaurant_id) => {
  return pool.query(
    `
    SELECT
      COALESCE(SUM(e.restaurant_earning),0) AS total_earnings
    FROM earnings e
    JOIN order_restaurants r
      ON r.order_id = e.order_id
    WHERE r.restaurant_id = $1
    `,
    [restaurant_id]
  );
};

const getTransactions = async (user_id) => {
  return pool.query(
    `
    SELECT *
    FROM transactions
    WHERE user_id = $1
    ORDER BY created_at DESC
    `,
    [user_id]
  );
};


const getPaidEarnings = async (user_id) => {
  return pool.query(
    `
    SELECT
      COALESCE(SUM(amount),0) AS paid_earnings
    FROM transactions
    WHERE user_id = $1
      AND type = 'debit'
    `,
    [user_id]
  );
};

const getYesterdayEarnings = async (restaurant_id) => {
  return pool.query(
    `
    SELECT
      COALESCE(SUM(e.restaurant_earning),0) AS yesterday_earnings
    FROM earnings e
    JOIN order_restaurants r
      ON r.order_id = e.order_id
    JOIN orders o
      ON o.id = e.order_id
    WHERE r.restaurant_id = $1
      AND DATE(o.created_at) = CURRENT_DATE - 1
    `,
    [restaurant_id]
  );
};


const createPayout = async (user_id, amount, method) => {
  return pool.query(
    `
    INSERT INTO transactions
    (
      user_id,
      amount,
      type,
      method,
      reference_id
    )
    VALUES
    (
      $1,
      $2,
      'debit',
      $3,
      $1
    )
    RETURNING *
    `,
    [user_id, amount, method]
  );
};

module.exports = {
  getRestaurantsWallet,
  getRestaurantProfile,
  getBankDetails,
  getRestaurantEarnings,
  getTransactions,
  getPaidEarnings,
  getYesterdayEarnings,
  createPayout
};
