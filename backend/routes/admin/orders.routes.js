const express = require('express');
const router = express.Router();

const service = require('../../services/admin/orders.service');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getOrders();
    return response.success(res, 'Orders fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await service.getOrderDetails(req.params.id);
    return response.success(res, 'Order details fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.get('/:id/riders', async (req, res) => {
  try {
    const data = await service.getAvailableRiders();
    return response.success(res, 'Available riders fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/assign', async (req, res) => {
  try {
    const data = await service.assignRider(
      req.body.order_id,
      req.body.rider_id
    );

    return response.success(res, 'Rider assigned', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
