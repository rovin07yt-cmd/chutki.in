const adminQuery = require('../queries/admin.query');

// Approve Restaurant
const approveRestaurant = async (user_id) => {
  if (!user_id) throw new Error('user_id is required');

  await adminQuery.approveRestaurant(user_id);

  return { user_id, approved: true };
};

// Approve WorkWithUs
const approveWork = async (user_id) => {
  if (!user_id) throw new Error('user_id is required');

  await adminQuery.approveWork(user_id);

  return { user_id, approved: true };
};

// Block User
const blockUser = async (user_id) => {
  if (!user_id) throw new Error('user_id is required');

  await adminQuery.blockUser(user_id);

  return { user_id, blocked: true };
};

module.exports = {
  approveRestaurant,
  approveWork,
  blockUser
};
