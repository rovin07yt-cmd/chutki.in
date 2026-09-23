const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const response = require("../utils/response.util");
const service = require("../services/rider_status.service");

router.get("/", auth("rider"), async (req,res) => {
  try {

    const data =
      await service.getStatus(
        req.user.id
      );

    return response.success(
      res,
      "Status",
      data
    );

  } catch(err) {

    return response.error(
      res,
      err.message
    );

  }
});

router.post("/online", auth("rider"), async (req,res) => {
  try {

    const data =
      await service.toggleStatus(
        req.user.id,
        req.body.is_online
      );

    return response.success(
      res,
      "Rider status updated",
      data
    );

  } catch(err) {

    return response.error(
      res,
      err.message
    );

  }
});

module.exports = router;
