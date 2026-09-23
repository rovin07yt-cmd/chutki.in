const express = require('express');
const router = express.Router();
const service = require('../services/report.service');
const response = require('../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getReport();
    return response.success(res, 'Report fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
