const pool = require('../config/db');

// ✅ CHECK ORDER BELONGS TO RESTAURANT
const checkOrderRestaurant = (order_id, restaurant_id) => {
  return pool.query(
    `SELECT status FROM order_restaurants 
     WHERE order_id = $1 AND restaurant_id = $2`,
    [order_id, restaurant_id]
  );
};

// ✅ UPDATE STATUS
const updateRestaurantStatus = (order_id, restaurant_id, new_status, current_status) => {
  return pool.query(
    `UPDATE order_restaurants
     SET status = $3
     WHERE order_id = $1
     AND restaurant_id = $2
     AND status = $4`,
    [order_id, restaurant_id, new_status, current_status]
  );
};

// ✅ GET ALL RESTAURANT STATUSES
const getAllRestaurantStatuses = (order_id) => {
  return pool.query(
    `SELECT status FROM order_restaurants WHERE order_id = $1`,
    [order_id]
  );
};

// ✅ UPDATE MAIN ORDER STATUS
const updateOrderStatus = (order_id, status) => {
  return pool.query(
    `UPDATE orders SET status = $2 WHERE id = $1`,
    [order_id, status]
  );
};

// ✅ GET ORDER
const getOrderById = (order_id) => {
  return pool.query(
    `SELECT user_id FROM orders WHERE id = $1`,
    [order_id]
  );
};

// ✅ COUNTS (FINAL CORRECT)
const getCounts = async (restaurant_id) => {
  return pool.query(`
    SELECT
      COUNT(*) FILTER (WHERE orr.status = 'pending') AS pending,
      COUNT(*) FILTER (WHERE orr.status = 'accepted') AS accepted,
      COUNT(*) FILTER (WHERE orr.status = 'preparing') AS preparing,

      -- READY = ready + assigned
      COUNT(*) FILTER (
        WHERE orr.status = 'ready'
          AND o.dispatch_status IN ('waiting','assigned')
      ) AS ready,

      -- PICKED = only picked
      COUNT(*) FILTER (
        WHERE o.dispatch_status = 'picked'
      ) AS picked,

      -- DELIVERED
      COUNT(*) FILTER (
        WHERE o.dispatch_status = 'delivered'
      ) AS delivered,
      COUNT(*) FILTER (WHERE o.dispatch_status = 'delivered') AS history,

      -- CANCELLED (ONLY ON THE WAY RETURN ✅)
      COUNT(*) FILTER (
        WHERE o.dispatch_status = 'on_the_way_return'
      ) AS cancelled

    FROM order_restaurants orr
    JOIN orders o ON o.id = orr.order_id
    WHERE orr.restaurant_id = $1
  `, [restaurant_id]);
};

// ✅ GET ORDERS BY STATUS (FINAL CLEAN)
const getOrdersByStatus = async (restaurant_id, status) => {

  let condition = "";
  let params = [restaurant_id];

  if (status === "ready") {
    condition = `
      orr.status = 'ready'
        AND o.dispatch_status IN ('waiting','assigned')
    `;
  } 
  else if (status === "picked") {
    condition = `o.dispatch_status = 'picked'`;
  } 
  else if (status === "delivered") {
    condition = `o.dispatch_status = 'delivered'`;
  }
  else if (status === "cancelled") {
    // ONLY on the way cancel
    condition = `o.dispatch_status = 'on_the_way_return'`;
  }
  else if (status === "returned") {
    condition = `o.dispatch_status = 'returned'`;
  }
  else if (status === "rejected") {
    condition = `orr.status = 'rejected'`;
  }
  else if (status === "history") {
    condition = `DATE(o.created_at) = CURRENT_DATE`;
  }
  else {
    condition = `orr.status = $2`;
    params.push(status);
  }

  return pool.query(
    `SELECT 
        o.id as order_id, o.created_at,
        o.total_price,
        o.final_total,
        o.status,
        o.dispatch_status,
        o.assigned_rider_id,
        orr.status as restaurant_status,

        (
          SELECT json_agg(
            json_build_object(
              'name', fi.name,
              'quantity', oi.quantity
            )
          )
          FROM order_items oi
          LEFT JOIN food_items fi ON fi.id = oi.food_id
          WHERE oi.order_id = o.id
        ) as items,

        CASE 
          WHEN r.id IS NOT NULL THEN json_build_object(
            'id', r.id,
            'name', u.name,
            'mobile', u.mobile
          )
          ELSE NULL
        END as rider

     FROM order_restaurants orr
     JOIN orders o ON o.id = orr.order_id
     LEFT JOIN riders r ON r.id = o.assigned_rider_id
     LEFT JOIN users u ON u.id = r.user_id

     WHERE orr.restaurant_id = $1
     AND ${condition}

     ORDER BY o.id DESC`,
    params
  );
};

module.exports = {
  checkOrderRestaurant,
  updateRestaurantStatus,
  getAllRestaurantStatuses,
  updateOrderStatus,
  getOrderById,
  getCounts,
  getOrdersByStatus
};