const express = require('express');
const router = express.Router();

const service = require('../../services/admin/restaurant_wallet.service');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data =
      await service.getRestaurantsWallet();

    return response.success(
      res,
      'Restaurant wallets fetched',
      data
    );
  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data =
      await service.getRestaurantWalletDetails(
        req.params.id
      );

    return response.success(
      res,
      'Restaurant wallet fetched',
      data
    );
  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
});
router.post("/pay", async (req, res) => {
  try {
    const data =
      await service.payRestaurant(
        req.body.user_id,
        req.body.amount,
        req.body.method
      );

    return response.success(
      res,
      "Restaurant paid",
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
