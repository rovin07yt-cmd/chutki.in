const express = require('express');
const router = express.Router();

const service = require('../../services/admin/dashboard.service');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getDashboard();
    return response.success(res, 'Dashboard fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
