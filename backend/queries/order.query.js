const pool = require('../config/db');

// 🔥 CLEAN GET ORDERS (ACTIVE ONLY)
const getOrdersByRestaurant = async (restaurant_id) => {
  return pool.query(
    `SELECT 
        o.id,
        o.user_id,
        o.address_id,
        o.status AS order_status,
        o.created_at,
        orr.status AS restaurant_status
     FROM orders o
     JOIN order_restaurants orr 
       ON o.id = orr.order_id
     WHERE orr.restaurant_id = $1
     AND o.status NOT IN ('delivered', 'cancelled', 'cancelled_returned')
     AND EXISTS (
        SELECT 1 FROM order_items oi 
        WHERE oi.order_id = o.id 
        AND oi.restaurant_id = $1
     )
     ORDER BY o.created_at DESC`,
    [restaurant_id]
  );
};

// 🔥 ITEMS
const getOrderItemsByRestaurant = async (order_id, restaurant_id) => {
  return pool.query(
    `SELECT food_id, quantity, price, mrp, prep_time
     FROM order_items
     WHERE order_id = $1 AND restaurant_id = $2`,
    [order_id, restaurant_id]
  );
};

// 🔥 TOTAL ITEMS
const getTotalItems = async (order_id, restaurant_id) => {
  return pool.query(
    `SELECT COALESCE(SUM(quantity),0)::int AS total_items
     FROM order_items
     WHERE order_id = $1 AND restaurant_id = $2`,
    [order_id, restaurant_id]
  );
};

// 🔥 PREP TIME
const getMaxPrepTime = async (order_id, restaurant_id) => {
  return pool.query(
    `SELECT COALESCE(MAX(prep_time),0)::int AS prep_time
     FROM order_items
     WHERE order_id = $1 AND restaurant_id = $2`,
    [order_id, restaurant_id]
  );
};

// 🔥 CHECK EXISTING
const checkOrderRestaurant = async (order_id, restaurant_id) => {
  return pool.query(
    `SELECT * FROM order_restaurants 
     WHERE order_id = $1 AND restaurant_id = $2`,
    [order_id, restaurant_id]
  );
};

// 🔥 SAFE UPDATE (LOCKED)
const updateRestaurantStatus = async (order_id, restaurant_id, status, currentStatus) => {
  return pool.query(
    `UPDATE order_restaurants
     SET status = $1
     WHERE order_id = $2 
     AND restaurant_id = $3
     AND status = $4`,
    [status, order_id, restaurant_id, currentStatus]
  );
};

// 🔥 READY CHECK
const areAllRestaurantsReady = async (order_id) => {
  return pool.query(
    `SELECT COUNT(*) FILTER (WHERE status != 'ready') AS not_ready
     FROM order_restaurants
     WHERE order_id = $1`,
    [order_id]
  );
};

// 🔥 GET ORDER
const getOrderById = async (order_id) => {
  return pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [order_id]
  );
};

module.exports = {
  getOrdersByRestaurant,
  getOrderItemsByRestaurant,
  getTotalItems,
  getMaxPrepTime,
  checkOrderRestaurant,
  updateRestaurantStatus,
  areAllRestaurantsReady,
  getOrderById
};

// 🔥 HISTORY ORDERS
const getHistoryOrders = async (restaurant_id) => {
  return pool.query(
    `SELECT 
        o.id,
        o.status AS order_status,
        o.created_at,
        orr.status AS restaurant_status
     FROM orders o
     JOIN order_restaurants orr 
       ON o.id = orr.order_id
     WHERE orr.restaurant_id = $1
     AND o.status IN ('delivered', 'cancelled', 'cancelled_returned')
     ORDER BY o.created_at DESC`,
    [restaurant_id]
  );
};

module.exports.getHistoryOrders = getHistoryOrders;

// 🔥 UPDATE ORDER STATUS
const updateOrderStatus = async (order_id, status) => {
  return pool.query(
    `UPDATE orders SET status = $1 WHERE id = $2`,
    [status, order_id]
  );
};

module.exports.updateOrderStatus = updateOrderStatus;

// 🔥 UPDATE ORDER + DISPATCH STATUS
const updateOrderAndDispatchStatus = async (order_id, status) => {
  return pool.query(
    `UPDATE orders
     SET status = $1,
         dispatch_status = $1
     WHERE id = $2`,
    [status, order_id]
  );
};

module.exports.updateOrderAndDispatchStatus = updateOrderAndDispatchStatus;

// 🔥 UPDATE RIDER ASSIGNMENT STATUS
const updateRiderAssignmentStatus = async (order_id, status) => {
  return pool.query(
    `UPDATE rider_assignments
     SET status = $1
     WHERE order_id = $2`,
    [status, order_id]
  );
};

module.exports.updateRiderAssignmentStatus = updateRiderAssignmentStatus;


// 🔥 CHECK IF ANY RESTAURANT PREPARING
const isAnyRestaurantPreparing = async (order_id) => {
  return pool.query(
    `SELECT COUNT(*) AS count
     FROM order_restaurants
     WHERE order_id = $1 AND status = 'preparing'`,
    [order_id]
  );
};

// 🔥 CANCEL ALL RESTAURANTS
const cancelAllRestaurants = async (order_id) => {
  return pool.query(
    `UPDATE order_restaurants
     SET status = 'cancelled'
     WHERE order_id = $1`,
    [order_id]
  );
};

module.exports.isAnyRestaurantPreparing = isAnyRestaurantPreparing;
module.exports.cancelAllRestaurants = cancelAllRestaurants;


// 🔥 GET ORDER COUNTS (PER RESTAURANT)
const getOrderCounts = async (restaurant_id) => {
  return pool.query(
    `
    SELECT 
      status,
      COUNT(*)::int AS count
    FROM order_restaurants
    WHERE restaurant_id = $1
    GROUP BY status
    `,
    [restaurant_id]
  );
};

module.exports.getOrderCounts = getOrderCounts;


// 🔥 GET ALL RESTAURANT STATUSES FOR ORDER
const getAllRestaurantStatuses = async (order_id) => {
  return pool.query(
    `SELECT status FROM order_restaurants WHERE order_id = $1`,
    [order_id]
  );
};

module.exports.getAllRestaurantStatuses = getAllRestaurantStatuses;


// 🔥 UPDATE ALL RESTAURANTS STATUS (RIDER FLOW)
const updateAllRestaurantsStatus = async (order_id, status) => {
  return pool.query(
    `UPDATE order_restaurants
     SET status = $1
     WHERE order_id = $2`,
    [status, order_id]
  );
};

module.exports.updateAllRestaurantsStatus = updateAllRestaurantsStatus;

