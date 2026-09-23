const orderQuery = require('../queries/restaurant_order.query');
const notificationService = require('./notification.service');

const validFlow = {
  pending: ['accepted','rejected'],
  accepted: ['preparing','rejected'],
  preparing: ['ready'],
  ready: [],
};

const updateStatus = async (data) => {
  const { order_id, restaurant_id, status } = data;

  const currentRes = await orderQuery.checkOrderRestaurant(order_id, restaurant_id);

  if (currentRes.rows.length === 0) {
    throw new Error('Unauthorized or invalid order');
  }

  const currentStatus = currentRes.rows[0].status;

  if (currentStatus === status) {
    return { message: `Order already ${status}` };
  }

  if (!validFlow[currentStatus] || !validFlow[currentStatus].includes(status)) {
    throw new Error(`Invalid transition from ${currentStatus} to ${status}`);
  }

  const updateRes = await orderQuery.updateRestaurantStatus(
    order_id,
    restaurant_id,
    status,
    currentStatus
  );

  if (updateRes.rowCount === 0) {
    throw new Error('Order already updated');
  }

  // 🔥 GLOBAL ORDER STATUS SYNC

// 🔥 GLOBAL ORDER STATUS SYNC (FIXED LOGIC)
const allStatusRes = await orderQuery.getAllRestaurantStatuses(order_id);

const statuses = allStatusRes.rows.map(r => r.status);

let finalStatus = "pending";

if (statuses.includes("preparing")) {
  finalStatus = "preparing";
} else if (statuses.every(s => s === "ready")) {
  finalStatus = "ready";
} else if (statuses.includes("accepted")) {
  finalStatus = "accepted";
}

  await orderQuery.updateOrderStatus(order_id, finalStatus);

  // 🔥 AUTO DISPATCH
  if (finalStatus === 'ready') {
    console.log("🔥 DISPATCH TRIGGER", order_id, finalStatus);
    const dispatchService = require('./dispatch.service');
    const result = await dispatchService.tryDispatch(order_id);
    console.log("🔥 DISPATCH RESULT", result);
  }

  // 🔔 NOTIFICATION
  const orderRes = await orderQuery.getOrderById(order_id);
  const user_id = orderRes.rows[0].user_id;

  await notificationService.notify({
    user_id,
    type: 'order',
    message: `Restaurant ${status} your order`
  });

  return { message: 'Status updated' };
};

// ✅ FIXED COUNTS (FINAL)
const getCounts = async (restaurant_id) => {
  const res = await orderQuery.getCounts(restaurant_id);
  const row = res.rows[0] || {};

  return {
    pending: Number(row.pending || 0),
    accepted: Number(row.accepted || 0),
    preparing: Number(row.preparing || 0),
    ready: Number(row.ready || 0),
    picked: Number(row.picked || 0),
    delivered: Number(row.delivered || 0),
    cancelled: Number(row.cancelled || 0)
  };
};

// ✅ ORDERS
const getOrdersByStatus = async (restaurant_id, status) => {
  const res = await orderQuery.getOrdersByStatus(restaurant_id, status);
  return res.rows;
};

module.exports = {
  updateStatus,
  getCounts,
  getOrdersByStatus
};
