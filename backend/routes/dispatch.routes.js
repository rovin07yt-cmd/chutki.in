const express = require('express');
const router = express.Router();
const dispatchService = require('../services/dispatch.service');

// 🔥 MANUAL DISPATCH TEST
router.post('/run/:order_id', async (req, res) => {
  try {
    const result = await dispatchService.tryDispatch(req.params.order_id);
    return res.json({ success: true, data: result });
  } catch (err) {
    return res.json({ success: false, message: err.message });
  }
});

module.exports = router;
