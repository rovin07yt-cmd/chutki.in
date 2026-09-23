const pool = require('../config/db');

// Approve Restaurant
const approveRestaurant = async (user_id) => {
  return pool.query(
    `UPDATE restaurant_profiles 
     SET is_approved = true 
     WHERE user_id = $1`,
    [user_id]
  );
};

// Approve WorkWithUs
const approveWork = async (user_id) => {
  return pool.query(
    `UPDATE work_profiles 
     SET status = 'approved' 
     WHERE user_id = $1`,
    [user_id]
  );
};

// Block User
const blockUser = async (user_id) => {
  return pool.query(
    `UPDATE users 
     SET is_blocked = true 
     WHERE id = $1`,
    [user_id]
  );
};

module.exports = {
  approveRestaurant,
  approveWork,
  blockUser
};
