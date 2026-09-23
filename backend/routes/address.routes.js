const express = require('express');
const router = express.Router();
const service = require('../services/address.service');
const auth = require('../middleware/auth.middleware');
const response = require('../utils/response.util');

router.post('/add', auth('user'), async (req, res) => {
  try {
    const data = await service.addAddress(req.user.id, req.body);
    return response.success(res, 'Address added', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});
router.get('/my', auth('user'), async (req, res) => {
  try {
    const data = await service.getAddresses(req.user.id);
    return response.success(res, 'Addresses fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});


router.post('/delete', auth('user'), async (req, res) => {
  try {
    const data = await service.deleteAddress(req.body.id, req.user.id);
    return response.success(res, 'Address deleted', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
