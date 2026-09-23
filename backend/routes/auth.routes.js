const express = require('express');
const router = express.Router();
const service = require('../services/auth.service');
const response = require('../utils/response.util');

// STEP 1 → SEND OTP
router.post('/register', async (req, res) => {
  try {
    const data = await service.registerUser(req.body);
    return response.success(res, 'OTP sent', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// STEP 2 → VERIFY OTP + CREATE USER
router.post('/verify', async (req, res) => {
  try {
    const data = await service.verifyAndCreateUser(req.body);
    return response.success(res, 'User created', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// LOGIN
// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { identifier, email, password, role } = req.body;
    const finalIdentifier = identifier || email;

    const data = await service.loginUser(finalIdentifier, password, role);

    return response.success(res, "Login successful", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
