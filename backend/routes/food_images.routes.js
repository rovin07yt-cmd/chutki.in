const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const service = require('../services/food_images.service');
const auth = require('../middleware/auth.middleware');
const response = require('../utils/response.util');

router.post('/upload', auth('restaurant'), upload.array('images', 5), async (req, res) => {
  try {

    const food_id = Number(req.body.food_id);
    console.log('FOOD ID RECEIVED:', food_id);

    if (!food_id) {
      throw new Error('Invalid food_id');
    }

    if (!req.files || req.files.length === 0) {
      throw new Error('No images uploaded');
    }

    const imagePaths = req.files.map(file => '/uploads/' + file.filename);

    console.log("FILES RECEIVED:", imagePaths);

    const result = await service.saveFoodImages(food_id, imagePaths);

    return response.success(res, 'Images uploaded', result);

  } catch (err) {
    console.error("ROUTE ERROR:", err.message);
    return response.error(res, err.message);
  }
});

module.exports = router;
