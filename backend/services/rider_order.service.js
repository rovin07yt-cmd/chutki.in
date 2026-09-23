
const orderQuery = require('../queries/order.query');

const validFlow = {
  ready: ['picked'],
  picked: ['delivered', 'on_the_way_return'],
  on_the_way_return: ['returned'],
};

const updateRiderStatus = async (order_id, status) => {

  const orderRes = await orderQuery.getOrderById(order_id);

  if (orderRes.rows.length === 0) {
    throw new Error('Order not found');
  }

  const currentStatus = orderRes.rows[0].status;

  if (!validFlow[currentStatus] || !validFlow[currentStatus].includes(status)) {
    throw new Error(`Invalid rider transition from ${currentStatus} to ${status}`);
  }

  // 🔥 UPDATE ALL RESTAURANTS
  await orderQuery.updateAllRestaurantsStatus(order_id, status);

  // 🔥 UPDATE ORDER
  await orderQuery.updateOrderStatus(order_id, status);

  return { message: 'Rider status updated' };
};

module.exports = { updateRiderStatus };

