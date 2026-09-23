const express = require('express');
const router = express.Router();

const service = require('../../services/admin/users.service');
const response = require('../../utils/response.util');

router.get('/', async (req, res) => {
  try {
    const data = await service.getUsers();
    return response.success(res, 'Users fetched', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/block', async (req, res) => {
  try {
    const data = await service.blockUser(req.body.user_id);
    return response.success(res, 'User blocked', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.post('/unblock', async (req, res) => {
  try {
    const data = await service.unblockUser(req.body.user_id);
    return response.success(res, 'User unblocked', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const data = await service.deleteUser(req.params.id);
    return response.success(res, 'User deleted', data);
  } catch (err) {
    return response.error(res, err.message);
  }
});

module.exports = router;
