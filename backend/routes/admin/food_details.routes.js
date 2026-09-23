const express = require('express');
const router = express.Router();

const service = require('../../services/admin/food_details.service');
const response = require('../../utils/response.util');

router.get('/:id', async (req, res) => {
  try {
    const data = await service.getFoodDetails(req.params.id);
    return response.success(res, 'Food details fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
