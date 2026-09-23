
const express = require('express');
const router = express.Router();
const service = require('../services/food.service');
const auth = require('../middleware/auth.middleware');
const response = require('../utils/response.util');

// ADD FOOD
router.post('/add', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.addFood({
      ...req.body,
      restaurant_id: req.user.id
    });

    return response.success(res, 'Food added', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// GET FOODS
router.get('/list', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.getFoods(req.user.id);
    return response.success(res, 'Food list', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// DELETE
router.post('/delete', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.deleteFood(
      req.body.food_id,
      req.user.id
    );

    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// TOGGLE
router.post('/toggle', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.toggleAvailability(
      req.body.food_id,
      req.user.id,
      req.body.is_available
    );

    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;


// GET SINGLE FOOD
router.get('/:id', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.getFoodById(
      req.params.id,
      req.user.id
    );
    return response.success(res, 'Food', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// UPDATE FOOD
router.post('/update', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.updateFood({
      ...req.body,
      restaurant_id: req.user.id
    });

    return response.success(res, data.message);
  } catch (err) {
    return response.error(res, err.message);
  }
});
