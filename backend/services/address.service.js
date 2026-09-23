const addressQuery = require('../queries/address.query');

// Add address
const addAddress = async (user_id, data) => {
  const { latitude, longitude, label } = data;

  if (!user_id || !latitude || !longitude) {
    throw new Error('Missing required fields');
  }

  const result = await addressQuery.addAddress(
    user_id,
    latitude,
    longitude,
    label
  );

  return result.rows[0];
};

// Get user addresses
const getAddresses = async (user_id) => {
  if (!user_id) {
    throw new Error('User ID required');
  }

  const result = await addressQuery.getUserAddresses(user_id);
  return result.rows;
};

// Delete address
const deleteAddress = async (id, user_id) => {
  if (!id || !user_id) {
    throw new Error('ID and User ID required');
  }

  await addressQuery.deleteAddress(id, user_id);
  return { message: 'Address deleted' };
};

module.exports = {
  addAddress,
  getAddresses,
  deleteAddress
};
