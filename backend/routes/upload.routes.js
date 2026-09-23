const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth.middleware');

const foodImageService = require('../services/food_images.service');
const resumeService = require('../services/resume.service');
const vacancyService = require('../services/vacancy.service');
const adsService = require('../services/ads.service');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// PROFILE
router.post('/profile', upload.single('file'), (req, res) => {
  res.json({
    success: true,
    message: 'Profile uploaded',
    data: { url: '/uploads/' + req.file.filename }
  });
});

// FOOD
router.post('/food', upload.array('files', 5), async (req, res) => {
  try {
    const { food_id } = req.body;

    if (!food_id) {
      return res.status(400).json({ success: false, message: 'food_id required' });
    }

    if (!req.files || req.files.length < 3) {
      return res.status(400).json({ success: false, message: 'Minimum 3 images required' });
    }

    const urls = req.files.map(f => '/uploads/' + f.filename);

    await foodImageService.saveFoodImages(food_id, urls);

    res.json({
      success: true,
      message: 'Food images uploaded & saved',
      data: urls
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// RESUME
router.post('/resume', auth('workwithus'), upload.single('file'), async (req, res) => {
  try {
    const user_id = req.user.id;

    if (!user_id) {
      return res.status(400).json({ success: false, message: 'user_id required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'file required' });
    }

    const url = '/uploads/' + req.file.filename;

    const data = await resumeService.uploadResume(user_id, url);

    res.json({
      success: true,
      message: 'Resume uploaded',
      data
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ VACANCY
router.post('/vacancy', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'file required' });
    }

    const url = '/uploads/' + req.file.filename;

    const data = await vacancyService.createVacancy(url);

    res.json({
      success: true,
      message: 'Vacancy created',
      data
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ ADS
router.post('/ads', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'file required' });
    }

    const url = '/uploads/' + req.file.filename;

    const data = await adsService.createAd(url);

    res.json({
      success: true,
      message: 'Ad created',
      data
    });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
