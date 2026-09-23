const express = require('express');
const router = express.Router();
const service = require('../services/restaurant_control.service');
const auth = require('../middleware/auth.middleware');
const response = require('../utils/response.util');

// ✅ TOGGLE ONLINE
router.post('/toggle', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.toggleOnline(
      req.user.id,
      req.body.is_online
    );

    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// ✅ SET LOCATION
router.post('/location', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.setLocation(
      req.user.id,
      req.body.lat,
      req.body.lng
    );

    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// ✅ GET LOCATION
router.get('/location', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.getLocation(req.user.id);
    return response.success(res, 'Location', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
