const express = require('express');
const router = express.Router();

const service = require('../../services/admin/request.service');
const response = require('../../utils/response.util');

router.get('/riders', async (req, res) => {
  try {
    const data = await service.getPendingRiders();
    return response.success(res, 'Pending riders fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post("/riders/approve", async (req, res) => {
  try {
    const { user_id } = req.body;

    const data = await service.approveRider(user_id);

    return response.success(res, "Rider approved", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
