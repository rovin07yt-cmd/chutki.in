const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth.middleware');

const foodImageService = require('../services/food_images.service');
const resumeService = require('../services/resume.service');
const vacancyService = require('../services/vacancy.service');
const adsService = require('../services/ads.service');
const { uploadBuffer } = require('../services/r2.service');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

const makeKey = (folder, file) => {
  return (
    `${folder}/` +
    `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.originalname}`
  );
};

// PROFILE
router.post(
  '/profile',
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'file required'
        });
      }

      const url = await uploadBuffer({
        buffer: req.file.buffer,
        key: makeKey('profile', req.file),
        contentType: req.file.mimetype
      });

      res.json({
        success: true,
        message: 'Profile uploaded',
        data: { url }
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

// FOOD
router.post(
  '/food',
  upload.array('files', 5),
  async (req, res) => {
    try {
      const { food_id } = req.body;

      if (!food_id) {
        return res.status(400).json({
          success: false,
          message: 'food_id required'
        });
      }

      if (!req.files || req.files.length < 3) {
        return res.status(400).json({
          success: false,
          message: 'Minimum 3 images required'
        });
      }

      const urls = [];

      for (const file of req.files) {
        const url = await uploadBuffer({
          buffer: file.buffer,
          key: `food/${food_id}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.originalname}`,
          contentType: file.mimetype
        });

        urls.push(url);
      }

      await foodImageService.saveFoodImages(
        food_id,
        urls
      );

      res.json({
        success: true,
        message: 'Food images uploaded & saved',
        data: urls
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

// RESUME
router.post(
  '/resume',
  auth('workwithus'),
  upload.single('file'),
  async (req, res) => {
    try {
      const user_id = req.user.id;

      if (!user_id) {
        return res.status(400).json({
          success: false,
          message: 'user_id required'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'file required'
        });
      }

      const url = await uploadBuffer({
        buffer: req.file.buffer,
        key: `resume/${user_id}/${makeKey('', req.file)}`,
        contentType: req.file.mimetype
      });

      const data =
        await resumeService.uploadResume(
          user_id,
          url
        );

      res.json({
        success: true,
        message: 'Resume uploaded',
        data
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

// VACANCY
router.post(
  '/vacancy',
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'file required'
        });
      }

      const url = await uploadBuffer({
        buffer: req.file.buffer,
        key: `vacancy/${makeKey('', req.file)}`,
        contentType: req.file.mimetype
      });

      const data =
        await vacancyService.createVacancy(url);

      res.json({
        success: true,
        message: 'Vacancy created',
        data
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

// ADS
router.post(
  '/ads',
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'file required'
        });
      }

      const url = await uploadBuffer({
        buffer: req.file.buffer,
        key: `ads/${makeKey('', req.file)}`,
        contentType: req.file.mimetype
      });

      const data =
        await adsService.createAd(url);

      res.json({
        success: true,
        message: 'Ad created',
        data
      });

    } catch (err) {
      res.status(500).json({
        success: false,
        message: err.message
      });
    }
  }
);

module.exports = router;
