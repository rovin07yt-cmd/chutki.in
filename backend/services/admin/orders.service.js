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
    throw new Error(
      'Order cannot be assigned. It may already be picked, delivered, cancelled, or unavailable.'
    );
  }

  return result.rows[0];
};

const cancelOrder = async (order_id) => {
  const result = await query.cancelOrder(order_id);

  if (!result.rows.length) {
    throw new Error(
      'Order cannot be cancelled. It may already be delivered, returned, or cancelled.'
    );
  }

  return result.rows[0];
};

const deleteOrder = async (order_id) => {
  return query.deleteOrder(order_id);
};

module.exports = {
  getOrders,
  getOrderDetails,
  getAvailableRiders,
  assignRider,
  cancelOrder,
  deleteOrder
};
