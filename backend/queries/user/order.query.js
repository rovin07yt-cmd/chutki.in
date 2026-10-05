const pool = require("../../config/db");

const getUserOrders = async (user_id) => {
  return pool.query(`
    SELECT
      o.id,
      o.status,
      o.dispatch_status,
      o.final_total,
      o.created_at,
      EXISTS (
        SELECT 1
        FROM order_restaurants orr
        WHERE orr.order_id = o.id
          AND orr.status = 'rejected'
      ) AS has_rejection
    FROM orders o
    WHERE o.user_id = $1
    ORDER BY o.id DESC
  `, [user_id]);
};

module.exports.getUserOrders = getUserOrders;

const getOrderDetails = async (order_id, user_id) => {
  return pool.query(`
    SELECT
      o.id,
      o.status,
      o.dispatch_status,
      o.total_price,
      o.delivery_charge,
      o.gst_amount,
      o.final_total,
      o.created_at,

      oi.food_id,
      oi.quantity,
      oi.price,
      f.name AS food_name,

      r.user_id AS restaurant_id,
      r.restaurant_name AS restaurant_name,
      orr.status AS restaurant_status

    FROM orders o
    JOIN order_items oi ON o.id = oi.order_id
    JOIN food_items f ON f.id = oi.food_id
    JOIN order_restaurants orr ON orr.order_id = o.id
    JOIN restaurant_profiles r ON r.user_id = orr.restaurant_id

    WHERE o.id = $1 AND o.user_id = $2
  `, [order_id, user_id]);
};

module.exports.getOrderDetails = getOrderDetails;
