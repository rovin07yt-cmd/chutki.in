const express = require('express');
const router = express.Router();
const service = require('../services/order_items.service');
const response = require('../utils/response.util');

router.post('/add', async (req, res) => {
  try {
    const item = await service.addItem(req.body);
    return response.success(res, 'Item added', item);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.get('/:order_id', async (req, res) => {
  try {
    const items = await service.getItems(req.params.order_id);
    return response.success(res, 'Items fetched', items);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
