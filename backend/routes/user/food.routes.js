const express = require('express');
const router = express.Router();
const service = require('../../services/user/food.service');
const auth = require('../../middleware/auth.middleware');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getHomeFoods();
    return response.success(res, 'Home foods', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
