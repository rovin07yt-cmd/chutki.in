const pool = require("../config/db");

const getOrderDetails = async (order_id, rider_id) => {
  return pool.query(
    `
    SELECT
      o.id,
      o.status,
      o.dispatch_status,
      o.total_price,
      o.delivery_charge,
      o.gst_amount,
      o.final_total,
      o.created_at,

      u.name AS customer_name,
      u.mobile AS customer_mobile,

      a.label,
      a.latitude,
      a.longitude,

      oi.food_id,
      oi.quantity,
      oi.price,
      f.name AS food_name,

      rp.user_id AS restaurant_id,
      rp.restaurant_name,
      rp.restaurant_mobile,
      rp.lat,
      rp.lng,

      orr.status AS restaurant_status

    FROM orders o

    JOIN users u
      ON u.id = o.user_id

    LEFT JOIN addresses a
      ON a.id = o.address_id

    JOIN order_items oi
      ON oi.order_id = o.id

    JOIN food_items f
      ON f.id = oi.food_id

    JOIN order_restaurants orr
      ON orr.order_id = o.id

    JOIN restaurant_profiles rp
      ON rp.user_id = orr.restaurant_id

    WHERE o.id = $1
      AND o.assigned_rider_id = $2
    `,
    [order_id, rider_id]
  );
};

module.exports = {
  getOrderDetails
};
