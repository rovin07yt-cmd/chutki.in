const express = require('express');
const router = express.Router();
const service = require('../services/admin_wallet.service');
const response = require('../utils/response.util');

router.get('/summary', async (req, res) => {
  try {
    const data = await service.getAdminSummary();
    return response.success(res, 'Admin summary', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
