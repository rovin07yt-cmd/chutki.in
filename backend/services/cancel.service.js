
const orderQuery = require('../queries/order.query');

// 🔥 USER CANCEL
const cancelByUser = async (order_id, user_id) => {

  const orderRes = await orderQuery.getOrderById(order_id);

  if (orderRes.rows.length === 0) {
    throw new Error('Order not found');
  }

  if (orderRes.rows[0].user_id !== user_id) {
    throw new Error('Unauthorized');
  }

  // ❌ BLOCK if any restaurant preparing
  const prepCheck = await orderQuery.isAnyRestaurantPreparing(order_id);

  if (Number(prepCheck.rows[0].count) > 0) {
    throw new Error('Cannot cancel, already preparing');
  }

  // ✅ CANCEL FULL ORDER
  await orderQuery.cancelAllRestaurants(order_id);
  await orderQuery.updateOrderStatus(order_id, 'cancelled');

  return { message: 'Order cancelled by user' };
};


// 🔥 RESTAURANT CANCEL
const cancelByRestaurant = async (order_id, restaurant_id) => {

  const check = await orderQuery.checkOrderRestaurant(order_id, restaurant_id);

  if (check.rows.length === 0) {
    throw new Error('Invalid order');
  }

  // ✅ FULL ORDER CANCEL
  await orderQuery.cancelAllRestaurants(order_id);
  await orderQuery.updateOrderStatus(order_id, 'cancelled');

  return { message: 'Order cancelled by restaurant' };
};

module.exports = {
  cancelByUser,
  cancelByRestaurant
};

