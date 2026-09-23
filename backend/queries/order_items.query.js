const pool = require('../config/db');

// Add item to order
const addItem = async (data) => {
  const { order_id, food_id, quantity, price } = data;

  return pool.query(
    `INSERT INTO order_items (order_id, food_id, restaurant_id, quantity, price, mrp, prep_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [order_id, food_id, data.restaurant_id, quantity, price, data.mrp, data.prep_time]
  );
};

// Get all items of an order
const getItemsByOrder = async (order_id) => {
  return pool.query(
    `SELECT * FROM order_items WHERE order_id = $1`,
    [order_id]
  );
};

module.exports = {
  addItem,
  getItemsByOrder
};

// 🔥 GET FOOD DETAILS
const getFoodById = async (food_id) => {
  return pool.query(
    `SELECT f.id, f.restaurant_id, p.price, p.mrp, p.prep_time FROM food_items f JOIN food_prices p ON f.id = p.food_id WHERE f.id = $1`,
    [food_id]
  );
};

module.exports.getFoodById = getFoodById;

