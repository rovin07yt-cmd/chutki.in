const express = require('express');
const router = express.Router();
const service = require('../../services/user/restaurantFood.service');
const auth = require('../../middleware/auth.middleware');
const response = require('../../utils/response.util');

router.get('/:id', async (req, res) => {
  try {
    const data = await service.getFoodsByRestaurant(req.params.id);
    return response.success(res, 'Restaurant foods', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
