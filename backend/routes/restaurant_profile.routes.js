const express = require('express');
const router = express.Router();
const service = require('../services/restaurant_profile.service');
const auth = require('../middleware/auth.middleware');
const response = require('../utils/response.util');
const upload = require("../middleware/upload");

// ✅ GET PROFILE
router.get('/', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.getProfile(req.user.id);
    return response.success(res, 'Profile', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// ✅ UPDATE PROFILE
router.post('/update', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.updateProfile(req.user.id, req.body);
    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

// ✅ CHANGE PASSWORD
router.post('/password', auth('restaurant'), async (req, res) => {
  try {
    const data = await service.changePassword(
      req.user.id,
      req.body.old_password,
      req.body.new_password
    );

    return response.success(res, data.message, data);
  } catch (err) {
    return response.error(res, err.message);
  }
});


router.post("/image", auth("restaurant"), upload.single("image"), async (req, res) => {
  console.log("FILE DEBUG:", req.file);
  try {
    if (!req.file) {
      return response.error(res, "No image uploaded");
    }

    const uploadPath = "/uploads/" + req.file.filename;

    await require("../config/db").query(
      `UPDATE restaurant_profiles SET image=$1 WHERE user_id=$2`,
      [uploadPath, req.user.id]
    );

    return response.success(res, "Image uploaded", { image: uploadPath });

  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
