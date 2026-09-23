const express = require('express');
const router = express.Router();
const service = require('../services/restaurant_order.service');
const auth = require('../middleware/auth.middleware');
const response = require('../utils/response.util');

// ✅ COUNTS
router.get('/counts', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.getCounts(req.user.id);
    return response.success(res, 'Counts', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// ✅ GET ORDERS BY STATUS
router.get('/status/:status', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.getOrdersByStatus(
      req.user.id,
      req.params.status
    );
    return response.success(res, 'Orders', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// ✅ ACTIONS
router.post('/accept', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.updateStatus({
      order_id: req.body.order_id,
      restaurant_id: req.user.id,
      status: 'accepted'
    });
    return response.success(res, data.message);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/preparing', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.updateStatus({
      order_id: req.body.order_id,
      restaurant_id: req.user.id,
      status: 'preparing'
    });
    return response.success(res, data.message);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/ready', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.updateStatus({
      order_id: req.body.order_id,
      restaurant_id: req.user.id,
      status: 'ready'
    });
    return response.success(res, data.message);
  } catch (err) {
    return response.error(res, err.message);
  }
});


// ❌ REJECT (ADD THIS)
router.post('/reject', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.updateStatus({
      order_id: req.body.order_id,
      restaurant_id: req.user.id,
      status: 'rejected'
    });
    return response.success(res, 'Order rejected');
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
