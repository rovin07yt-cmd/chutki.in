const express = require('express');
const router = express.Router();
const service = require('../services/order.service');
const response = require('../utils/response.util');

router.post('/place', async (req, res) => {
  try {
    const order = await service.placeOrder(req.body);
    return response.success(res, 'Order placed', order);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
