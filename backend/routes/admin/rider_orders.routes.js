const express = require('express');
const router = express.Router();

const service = require('../../services/admin/rider_orders.service');
const response = require('../../utils/response.util');

router.get('/:id/orders', async (req, res) => {
  try {
    const data = await service.getRiderOrders(
      req.params.id,
      req.query.filter,
      req.query.date
    );

    return response.success(
      res,
      'Rider orders fetched',
      data
    );
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
