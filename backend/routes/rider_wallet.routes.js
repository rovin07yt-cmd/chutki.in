const express = require('express');
const router = express.Router();
const service = require('../services/rider_wallet.service');
const response = require('../utils/response.util');
const auth = require("../middleware/auth.middleware");


router.get("/summary", auth("rider"), async (req, res) => {
  try {
    const user_id = req.user.id;
    const data = await service.getSummary(user_id);
    return response.success(res, "Summary", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.get("/bank-details", auth("rider"), async (req, res) => {
  try {
    const user_id = req.user.id;
    const data = await service.getBankDetails(user_id);
    return response.success(res, "Bank details", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post("/bank-details", auth("rider"), async (req, res) => {
  try {
    const user_id = req.user.id;
    const data = await service.saveBankDetails(
      user_id,
      req.body
    );

    return response.success(res, "Bank details saved", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.get("/earnings", auth("rider"), async (req, res) => {
  try {
    const user_id = req.user.id;
    const data = await service.getEarnings(user_id);
    return response.success(res, "Earnings", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
