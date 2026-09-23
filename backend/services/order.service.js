const notificationService = require('./notification.service');
const orderQuery = require('../queries/order.query');
const areaService = require('./area.service');

const placeOrder = async (data) => {
  const { user_id, address_id } = data;

  // 1. Check address exists
  const addressRes = await orderQuery.getAddressById(address_id, user_id);

  if (addressRes.rows.length === 0) {
    throw new Error('Address not found');
  }

  const address = addressRes.rows[0];

  // 2. Check serviceability
  const isServiceable = await areaService.isServiceable(
    address.latitude,
    address.longitude
  );

  if (!isServiceable) {
    throw new Error('Location not serviceable');
  }

  // 3. Create order
  const orderRes = await orderQuery.createOrder(user_id, address_id);
  const order = orderRes.rows[0];

  // ✅ CORRECT NOTIFICATION
  await notificationService.notify({
    user_id: user_id,
    type: 'order',
    message: 'Order placed successfully'
  });

  return order;
};

module.exports = {
  placeOrder
};
