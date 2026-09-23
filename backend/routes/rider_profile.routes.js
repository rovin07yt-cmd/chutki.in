const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth.middleware');
const response = require('../utils/response.util');
const service = require('../services/rider_profile.service');
const upload = require("../middleware/upload");


router.get('/', auth('rider'), async (req, res) => {
  try {

    const data =
      await service.getProfile(req.user.id);

    return response.success(
      res,
      'Profile',
      data
    );

  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
});

router.post('/update', auth('rider'), async (req, res) => {
  try {

    const data =
      await service.updateProfile(
        req.user.id,
        req.body
      );

    return response.success(
      res,
      data.message,
      data
    );

  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
});

router.post('/password', auth('rider'), async (req, res) => {
  try {

    const data =
      await service.changePassword(
        req.user.id,
        req.body.old_password,
        req.body.new_password
      );

    return response.success(
      res,
      data.message,
      data
    );

  } catch (err) {
    return response.error(
      res,
      err.message
    );
  }
});

router.post("/image", auth("rider"), upload.single("image"), async (req, res) => {
  try {

    if (!req.file) {
      return response.error(res, "No image uploaded");
    }

      console.log("REQ USER:", req.user);
    const uploadPath = "/uploads/" + req.file.filename;
      console.log("UPLOAD PATH:", uploadPath);
      console.log("BEFORE SERVICE CALL");

    const data = await service.uploadImage(
      req.user.id,
      uploadPath
    );

    return response.success(
      res,
      "Image uploaded",
      data
    );

  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
