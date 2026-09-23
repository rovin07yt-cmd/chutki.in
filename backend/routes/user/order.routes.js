const express = require('express');
const router = express.Router();
const service = require('../../services/user/order.service');
const auth = require('../../middleware/auth.middleware');
const response = require('../../utils/response.util');

// place order
router.post('/place', auth('user'), async (req, res) => {
  try {
    const data = await service.placeOrder(req.user.id, req.body);
    return response.success(res, 'Order placed', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// my orders
router.get('/my', auth('user'), async (req, res) => {
  try {
    const data = await service.getMyOrders(req.user.id);
    return response.success(res, 'My orders', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// cancel order
router.post('/:id/cancel', auth('user'), async (req, res) => {
  try {
    const data = await service.cancelOrder(req.user.id, req.params.id);
    return response.success(res, 'Order cancelled', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// reorder
router.post('/:id/reorder', auth('user'), async (req, res) => {
  try {
    const data = await service.reorder(req.user.id, req.params.id);
    return response.success(res, 'Reorder data', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// timeline (IMPORTANT: before :id)
router.get('/:id/timeline', auth('user'), async (req, res) => {
  try {
    const data = await service.getOrderTimeline(req.user.id, req.params.id);
    return response.success(res, 'Order timeline', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// order details
router.get('/:id', auth('user'), async (req, res) => {
  try {
    const data = await service.getOrderDetails(req.user.id, req.params.id);
    return response.success(res, 'Order details', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
