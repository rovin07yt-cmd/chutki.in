const express = require('express');
const router = express.Router();

const service = require('../../services/admin/riders.service');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getRiders();
    return response.success(res, 'Riders fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post("/block", async (req, res) => {
  try {
    const data = await service.blockRider(req.body.user_id);
    return response.success(res, "Rider blocked", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post("/unblock", async (req, res) => {
  try {
    const data = await service.unblockRider(req.body.user_id);
    return response.success(res, "Rider unblocked", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const data = await service.getRiderDetails(req.params.id);
    return response.success(res, "Rider details fetched", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
