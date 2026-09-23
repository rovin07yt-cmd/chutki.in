const express = require('express');
const router = express.Router();

const service = require('../../services/admin/request_restaurant.service');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getPendingRestaurants();
    return response.success(res, 'Pending restaurants fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/approve', async (req, res) => {
  try {
    const { user_id } = req.body;

    const data = await service.approveRestaurant(user_id);

    return response.success(
      res,
      'Restaurant approved',
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
