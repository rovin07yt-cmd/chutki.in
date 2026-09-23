const express = require('express');
const router = express.Router();

const service = require('../../services/admin/restaurant_orders.service');
const response = require('../../utils/response.util');

router.get('/:id/orders', async (req, res) => {
  try {

    const data =
      await service.getRestaurantOrders(
        req.params.id,
        req.query.filter,
        req.query.date
      );

    return response.success(
      res,
      'Restaurant orders fetched',
      data
    );

  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
