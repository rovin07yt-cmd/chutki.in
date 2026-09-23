const express = require('express');
const router = express.Router();

const service = require('../../services/admin/serviceable_areas.service');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getAreas();
    return response.success(res, 'Areas fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.get('/:id', async (req, res) => {
  try {
    const data = await service.getAreaDetails(req.params.id);
    return response.success(res, 'Area details fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/', async (req, res) => {
  try {
    const data = await service.createArea(req.body);
    return response.success(res, 'Area created', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/:id/circles', async (req, res) => {
  try {
    const data = await service.addCircle(
      req.params.id,
      req.body
    );

    return response.success(res, 'Circle added', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.put("/circles/:id", async (req, res) => {
  try {
    const data = await service.updateCircle(
      req.params.id,
      req.body
    );

    return response.success(res, "Circle updated", data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.put('/:id', async (req, res) => {
  try {
    const data = await service.updateArea(
      req.params.id,
      req.body
    );

    return response.success(res, 'Area updated', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await service.deleteArea(
      req.params.id
    );

    return response.success(res, 'Area deleted', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.delete('/circles/:id', async (req, res) => {
  try {
    const data = await service.deleteCircle(
      req.params.id
    );

    return response.success(res, 'Circle deleted', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
