const pool = require('../config/db');

const getAllOrders = () => {
  return pool.query(`
    SELECT id, user_id, final_total, status, dispatch_status, created_at
    FROM orders
    ORDER BY created_at DESC
  `);
};

const getDeliveredOrders = () => {
  return pool.query(`
    SELECT id, final_total, created_at
    FROM orders
    WHERE status = 'delivered'
    ORDER BY created_at DESC
  `);
};

const getProfitData = () => {
  return pool.query(`
    SELECT o.created_at,
           o.final_total,
           e.restaurant_earning,
           e.rider_earning,
           (o.final_total - e.restaurant_earning - e.rider_earning) AS admin_profit
    FROM orders o
    JOIN earnings e ON o.id = e.order_id
    WHERE o.status = 'delivered'
    ORDER BY o.created_at DESC
  `);
};

const getUserGrowth = () => {
  return pool.query(`
    SELECT created_at
    FROM users
    ORDER BY created_at DESC
  `);
};

module.exports = {
  getAllOrders,
  getDeliveredOrders,
  getProfitData,
  getUserGrowth
};
