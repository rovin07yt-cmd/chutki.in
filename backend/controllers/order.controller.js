const orderService = require('../services/order.service');

const placeOrder = async (req, res) => {
  try {
    const order = await orderService.placeOrder(req.body);
    res.json({ message: 'Order placed', order });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  placeOrder
};
