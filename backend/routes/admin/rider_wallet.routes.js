const express = require('express');
const router = express.Router();

const service = require('../../services/admin/rider_wallet.service');
const response = require('../../utils/response.util');

router.get("/", async (req, res) => {
  try {
    const data = await service.getRidersWallet();

    return response.success(
      res,
      "Rider wallets fetched",
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await service.getRiderWallet(req.params.id);

    return response.success(
      res,
      'Rider wallet fetched',
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post("/salary-pay", async (req, res) => {
  try {
    const data =
      await service.paySalary(
        req.body.user_id,
        req.body.amount,
        req.body.method
      );

    return response.success(
      res,
      "Salary paid",
      data
    );
  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
});

router.post("/cod-submit", async (req, res) => {
  try {
    const data =
      await service.submitCod(
        req.body.user_id,
        req.body.amount
      );

    return response.success(
      res,
      "COD submitted",
      data
    );
  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
});

module.exports = router;
