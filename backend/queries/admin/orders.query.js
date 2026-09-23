const pool = require('../../config/db');

const getOrders = async () => {
  return pool.query(
    `
    SELECT
      o.id,
      o.status,
      o.dispatch_status,
      o.final_total,
      o.created_at,
      u.name AS customer_name,
      ru.name AS rider_name
    FROM orders o
    JOIN users u
      ON u.id = o.user_id
    LEFT JOIN riders r
      ON r.id = o.assigned_rider_id
    LEFT JOIN users ru
      ON ru.id = r.user_id
    WHERE o.status NOT IN ('delivered','cancelled','returned')
    ORDER BY o.created_at DESC
    `
  );
};

const getOrderDetails = async (order_id) => {
  return pool.query(
    `
    SELECT
      o.*,
      u.name AS customer_name,
      u.mobile,
      u.gmail
    FROM orders o
    JOIN users u
      ON u.id = o.user_id
    WHERE o.id = $1
    `,
    [order_id]
  );
};

const getAvailableRiders = async () => {
  return pool.query(
    `
    SELECT
      r.id,
      r.user_id,
      u.name,
      r.active_items
    FROM riders r
    JOIN users u
      ON u.id = r.user_id
    WHERE r.is_online = true
      AND u.is_blocked = false
    ORDER BY u.name
    `
  );
};

const assignRider = async (order_id, rider_id) => {
  return pool.query(
    `
    UPDATE orders
    SET
      assigned_rider_id = $1,
      dispatch_status = 'assigned',
      assigned_at = NOW()
      WHERE id = $2 AND dispatch_status = 'waiting'
    RETURNING id, assigned_rider_id
    `,
    [rider_id, order_id]
  );
};

module.exports = {
  getOrders,
  getOrderDetails,
  getAvailableRiders,
  assignRider
};
