const express = require('express');
const router = express.Router();

const service = require('../../services/admin/profile.service');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getAdminProfile();
    return response.success(res, 'Admin profile fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/update', async (req, res) => {
  try {
    const data = await service.updateAdminProfile(req.body);
    return response.success(res, 'Admin profile updated', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/password', async (req, res) => {
  try {
    const data = await service.updateAdminPassword(req.body);
    return response.success(res, 'Password updated', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
