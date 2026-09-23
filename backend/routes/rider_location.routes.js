const express = require('express');
const router = express.Router();
const service = require('../services/rider_location.service');
const response = require('../utils/response.util');

router.post('/update', async (req, res) => {
  try {
    const data = await service.updateLocation(req.body);
    return response.success(res, 'Location updated', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// EXPORT MOVED

// 🔥 GET RIDER LOCATION
router.get("/:rider_id", async (req, res) => {
  try {
    const data = await service.getRiderLocation(req.params.rider_id);
    return response.success(res, "Rider location", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});
module.exports = router;
