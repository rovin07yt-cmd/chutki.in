const express = require('express');
const router = express.Router();
const areaService = require('../services/area.service');

// CHECK AREA
router.post('/check', async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (!lat || !lng) {
      return res.json({ success: false, message: 'lat/lng required' });
    }

    const allowed = await areaService.isServiceable(lat, lng);

    return res.json({
      success: true,
      serviceable: allowed
    });

  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

module.exports = router;
