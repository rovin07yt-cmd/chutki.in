const addressService = require('../services/address.service');

// Add address
const addAddress = async (req, res) => {
  try {
    const data = await addressService.addAddress(req.body);
    res.json({ message: 'Address added', data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get user addresses
const getAddresses = async (req, res) => {
  try {
    const user_id = req.params.user_id;
    const data = await addressService.getAddresses(user_id);
    res.json({ data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  try {
    const { id, user_id } = req.body;
    const data = await addressService.deleteAddress(id, user_id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addAddress,
  getAddresses,
  deleteAddress
};
