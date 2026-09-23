const express = require('express');
const router = express.Router();
const service = require('../services/restaurant_wallet.service');
const auth = require('../middleware/auth.middleware');
const response = require('../utils/response.util');

// 🔐 SET PASSWORD
router.post('/set-password', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.setPassword(req.user.id, req.body.password);
    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// 🔐 LOGIN
router.post('/login', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.login(req.user.id, req.body.password);
    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// 🔐 CHANGE PASSWORD
router.post('/change-password', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.changePassword(
      req.user.id,
      req.body.old_password,
      req.body.new_password
    );
    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// 🏦 BANK
router.get('/bank', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.getBank(req.user.id);
    return response.success(res, 'Bank details', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/bank', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.saveBank(req.user.id, req.body);
    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// 💰 SUMMARY
router.get('/summary', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.getRestaurantSummary(req.user.id);
    return response.success(res, 'Wallet summary', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// 📜 HISTORY
router.get('/history', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.getHistory(req.user.id);
    return response.success(res, 'Wallet history', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
