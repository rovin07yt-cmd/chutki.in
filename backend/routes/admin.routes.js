const express = require('express');
const router = express.Router();
const service = require('../services/admin.service');
const response = require('../utils/response.util');

// ✅ Approve Restaurant
router.post('/approve-restaurant', async (req, res) => {
  try {
    const { user_id } = req.body;
    const data = await service.approveRestaurant(user_id);
    return response.success(res, 'Restaurant approved', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// ✅ Approve WorkWithUs
router.post('/approve-work', async (req, res) => {
  try {
    const { user_id } = req.body;
    const data = await service.approveWork(user_id);
    return response.success(res, 'Work profile approved', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// ✅ Block User
router.post('/block-user', async (req, res) => {
  try {
    const { user_id } = req.body;
    const data = await service.blockUser(user_id);
    return response.success(res, 'User blocked', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
