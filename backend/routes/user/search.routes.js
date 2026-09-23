const express = require('express');
const router = express.Router();
const service = require('../../services/user/search.service');
const auth = require('../../middleware/auth.middleware');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    const data = await service.searchAll(q);
    return response.success(res, 'Search results', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
