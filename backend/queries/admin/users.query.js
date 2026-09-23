const pool = require('../../config/db');

const getUsers = async () => {
  return pool.query(`
    SELECT
      id,
      name,
      mobile,
      gmail,
      role,
      password,
      is_blocked,
      last_seen,
      created_at
    FROM users
    WHERE role IN ('user','workwithus')
    ORDER BY is_blocked ASC, created_at DESC
  `);
};

const blockUser = async (user_id) => {
  return pool.query(
    `UPDATE users
     SET is_blocked = true
     WHERE id = $1
     RETURNING id`,
    [user_id]
  );
};

const unblockUser = async (user_id) => {
  return pool.query(
    `UPDATE users
     SET is_blocked = false
     WHERE id = $1
     RETURNING id`,
    [user_id]
  );
};

const deleteUser = async (user_id) => {
  return pool.query(
    `DELETE FROM users
     WHERE id = $1
     RETURNING id`,
    [user_id]
  );
};

module.exports = {
  getUsers,
  blockUser,
  unblockUser,
  deleteUser
};
