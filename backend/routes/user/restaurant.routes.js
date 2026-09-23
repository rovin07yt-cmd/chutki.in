const express = require('express');
const router = express.Router();
const service = require('../../services/user/restaurant.service');
const auth = require('../../middleware/auth.middleware');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getRestaurants();
    return response.success(res, 'Restaurants', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
