const express = require('express');
const router = express.Router();

const service = require('../../services/admin/restaurants.service');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getRestaurants();
    return response.success(res, 'Restaurants fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/block', async (req, res) => {
  try {
    const data = await service.blockRestaurant(req.body.user_id);
    return response.success(res, 'Restaurant blocked', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/unblock', async (req, res) => {
  try {
    const data = await service.unblockRestaurant(req.body.user_id);
    return response.success(res, 'Restaurant unblocked', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await service.getRestaurantDetails(req.params.id);
    return response.success(res, "Restaurant details fetched", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
