const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const response = require('../utils/response.util');
const service = require('../services/user_profile.service');

router.get('/', auth('user'), async (req, res) => {
  try {
    const data = await service.getProfile(req.user.id);
    return response.success(res, 'Profile', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/update', auth('user'), async (req, res) => {
  try {
    const data = await service.updateProfile(
      req.user.id,
      req.body
    );

    return response.success(
      res,
      data.message,
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/password', auth('user'), async (req, res) => {
  try {
    const data = await service.changePassword(
      req.user.id,
      req.body.old_password,
      req.body.new_password
    );

    return response.success(
      res,
      data.message,
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
