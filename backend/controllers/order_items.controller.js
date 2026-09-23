const itemService = require('../services/order_items.service');

const addItem = async (req, res) => {
  try {
    const item = await itemService.addItemToOrder(req.body);
    res.json({ message: 'Item added', item });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getItems = async (req, res) => {
  try {
    const items = await itemService.getOrderItems(req.params.order_id);
    res.json({ items });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addItem,
  getItems
};
