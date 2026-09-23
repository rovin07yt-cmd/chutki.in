const pool = require('../config/db');

const getUserById = async (user_id) => {
  return pool.query(
    `SELECT id,name,mobile,gmail,role
     FROM users
     WHERE id = $1`,
    [user_id]
  );
};

const updateProfile = async (user_id, name, mobile) => {
  return pool.query(
    `UPDATE users
     SET name = $1,
         mobile = $2
     WHERE id = $3`,
    [name, mobile, user_id]
  );
};

const updatePassword = async (user_id, password) => {
  return pool.query(
    `UPDATE users
     SET password = $1
     WHERE id = $2`,
    [password, user_id]
  );
};

module.exports = {
  getUserById,
  updateProfile,
  updatePassword
};
