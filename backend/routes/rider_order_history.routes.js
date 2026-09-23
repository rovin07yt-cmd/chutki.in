const express = require('express');
const router = express.Router();

const auth =
  require('../middleware/auth.middleware');

const response =
  require('../utils/response.util');

const historyService =
  require('../services/rider_order_history.service');

router.get(
  '/',
  auth('rider'),
  async (req, res) => {

    try {

      const data =
        await historyService.getHistory(
          req.user.id
        );

      return response.success(
        res,
        'Order history',
        data
      );

    } catch (err) {

      return response.error(
        res,
        err.message
      );

    }

  }
);

module.exports = router;
