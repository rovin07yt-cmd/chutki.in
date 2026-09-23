const query = require('../../queries/admin/orders.query');

const getOrders = async () => {
  const result = await query.getOrders();
  return result.rows;
};

const getOrderDetails = async (order_id) => {
  const result = await query.getOrderDetails(order_id);

  if (!result.rows.length) {
    throw new Error('Order not found');
  }

  return result.rows[0];
};

const getAvailableRiders = async () => {
  const result = await query.getAvailableRiders();
  return result.rows;
};

const assignRider = async (order_id, rider_id) => {
  const result = await query.assignRider(order_id, rider_id);

  if (!result.rows.length) {
    throw new Error('Order not found');
  }

  return result.rows[0];
};

module.exports = {
  getOrders,
  getOrderDetails,
  getAvailableRiders,
  assignRider
};
