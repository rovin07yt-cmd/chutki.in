const express = require('express');
const router = express.Router();
const service = require('../../services/user/cart.service');
const auth = require('../../middleware/auth.middleware');
const response = require('../../utils/response.util');

router.post('/summary', async (req, res) => {
  try {
    const data = await service.getCartSummary(req.body.items || []);
    return response.success(res, 'Cart summary', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
