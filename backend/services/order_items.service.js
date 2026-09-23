const itemQuery = require('../queries/order_items.query');
const orderQuery = require('../queries/order.query');

// 🔥 CORE LOGIC (single source)
const processAddItem = async (data) => {
  // 🔥 GET FOOD DETAILS
  const foodRes = await itemQuery.getFoodById(data.food_id);

  if (foodRes.rows.length === 0) {
    throw new Error('Food item not found');
  }

  const food = foodRes.rows[0];

  data.restaurant_id = food.restaurant_id;
  data.price = food.price;
  data.mrp = food.mrp;
data.prep_time = food.prep_time;

  const itemRes = await itemQuery.addItem(data);

  const order_id = data.order_id;
  const restaurant_id = data.restaurant_id;

  // ensure restaurant mapping
  await orderQuery.insertOrderRestaurant(order_id, restaurant_id);

  // calculate totals
  const totalsRes = await orderQuery.calculateTotals(order_id);
  const totals = totalsRes.rows[0];

  const total_price = Number(totals.total_price || 0);
  const restaurant_count = Number(totals.restaurant_count || 0);

  const extra_charge = restaurant_count > 1 ? (restaurant_count - 1) * 20 : 0;
  const gst_amount = total_price * 0.05;
  const final_total = total_price + extra_charge + gst_amount;

  await orderQuery.updateOrderTotals(order_id, {
    total_price,
    extra_charge,
    gst_amount,
    final_total
  });

  return itemRes.rows[0];
};

// ✅ NEW (used by routes)
const addItem = async (data) => {
  return processAddItem(data);
};

// ✅ OLD (used by controllers — keep safe)
const addItemToOrder = async (data) => {
  return processAddItem(data);
};

// GET ITEMS
const getItems = async (order_id) => {
  const result = await itemQuery.getItemsByOrder(order_id);
  return result.rows;
};

module.exports = {
  addItem,
  addItemToOrder,
  getItems
};
