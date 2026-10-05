const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth.middleware");
const service = require("../services/rider_location.service");
const response = require("../utils/response.util");

router.post("/update", auth("rider"), async (req, res) => {
  try {
    const data = await service.updateLocation({
      user_id: req.user.id,
      lat: req.body.lat,
      lng: req.body.lng
    });

    return response.success(
      res,
      "Location updated",
      data
    );

  } catch (err) {
    return response.error(res, err.message);
  }
});

router.get("/:rider_id", async (req, res) => {
  try {
    const data =
      await service.getRiderLocation(req.params.rider_id);

    return response.success(
      res,
      "Rider location",
      data
    );

  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
