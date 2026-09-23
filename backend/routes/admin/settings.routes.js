const express = require('express');
const router = express.Router();

const service = require('../../services/admin/settings.service');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getSettings();
    return response.success(res, 'Settings fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.put('/', async (req, res) => {
  try {
    const data = await service.updateSettings(req.body);
    return response.success(res, 'Settings updated', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;