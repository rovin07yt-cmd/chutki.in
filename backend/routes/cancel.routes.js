const express = require('express');
const router = express.Router();
const service = require('../services/cancel.service');
const auth = require('../middleware/auth.middleware');
const response = require('../utils/response.util');

// 🔥 USER CANCEL
router.post('/user', auth('user'), async (req, res) => {
  try {
    const result = await service.cancelByUser(
      req.body.order_id,
      req.user.id
    );

    return response.success(res, result.message, result);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// 🔥 RESTAURANT CANCEL
router.post('/restaurant', auth('restaurant'), async (req, res) => {
  try {
    const result = await service.cancelByRestaurant(
      req.body.order_id,
      req.user.id
    );

    return response.success(res, result.message, result);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
