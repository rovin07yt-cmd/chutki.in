const pool = require('../config/db');

// 🔥 GET ACTIVE ORDERS OF RIDER
const getRiderOrders = async (rider_id) => {
  return pool.query(
    `SELECT id FROM orders 
     WHERE assigned_rider_id = $1 
     AND dispatch_status IN ('assigned','picked')
     AND status NOT IN ('cancelled','delivered')`,
    [rider_id]
  );
};

// 🔥 GET RESTAURANTS FROM ORDERS
const getRestaurantsFromOrders = async (order_ids) => {
  return pool.query(
    `SELECT o.order_id, o.restaurant_id, rp.lat, rp.lng
     FROM order_restaurants o
     JOIN restaurant_profiles rp 
       ON o.restaurant_id = rp.user_id
     WHERE o.order_id = ANY($1)
       AND rp.lat IS NOT NULL
       AND rp.lng IS NOT NULL`,
    [order_ids]
  );
};

// 🔥 INSERT ROUTE POINT
const insertPoint = async (rider_id, order_id, type, ref_id, seq) => {
  return pool.query(
    `INSERT INTO pickup_sequence 
     (rider_id, order_id, point_type, reference_id, sequence_number)
     VALUES ($1, $2, $3, $4, $5)`,
    [rider_id, order_id, type, ref_id, seq]
  );
};

module.exports = {
  getRiderOrders,
  getRestaurantsFromOrders,
  insertPoint
};
