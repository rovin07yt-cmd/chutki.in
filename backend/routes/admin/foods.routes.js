const express = require('express');
const router = express.Router();

const service = require('../../services/admin/foods.service');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getFoods();

    return response.success(
      res,
      'Foods fetched',
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/update', async (req, res) => {
  try {
    const data = await service.updateFood(req.body);

    return response.success(
      res,
      'Food updated',
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/delete', async (req, res) => {
  try {
    const data = await service.deleteFood(
      req.body.food_id
    );

    const message =
      data.mode === 'scheduled'
        ? 'Food unavailable and scheduled for deletion after 1 hour'
        : 'Food deleted';

    return response.success(
      res,
      message,
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
