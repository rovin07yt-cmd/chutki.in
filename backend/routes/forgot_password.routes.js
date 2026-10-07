const express = require('express');
const router = express.Router();

const service = require('../services/forgot_password.service');
const response = require('../utils/response.util');

// STEP 1 — SEND RESET OTP
router.post('/send-otp', async (req, res) => {
  try {
    const data = await service.sendResetOTP(req.body.gmail);
    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// STEP 2 — VERIFY RESET OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { gmail, otp } = req.body;
    const data = await service.verifyResetOTP(gmail, otp);
    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// STEP 3 — RESET PASSWORD
router.post('/reset-password', async (req, res) => {
  try {
    const { gmail, otp, newPassword } = req.body;

    const data = await service.resetPassword(
      gmail,
      otp,
      newPassword
    );

    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
