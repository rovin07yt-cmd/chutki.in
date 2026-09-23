const pool = require('../../config/db');

const getAdminProfile = async () => {
  return pool.query(
    `
    SELECT
      id,
      name,
      mobile,
      gmail,
      is_blocked,
      created_at
    FROM users
    WHERE role = 'admin'
    ORDER BY id
    LIMIT 1
    `
  );
};

const updateAdminProfile = async (
  name,
  mobile,
  gmail
) => {
  return pool.query(
    `
    UPDATE users
    SET
      name = $1,
      mobile = $2,
      gmail = $3
    WHERE role = 'admin'
    RETURNING
      id,
      name,
      mobile,
      gmail
    `,
    [name, mobile, gmail]
  );
};

const updateAdminPassword = async (
  password
) => {
  return pool.query(
    `
    UPDATE users
    SET password = $1
    WHERE role = 'admin'
    RETURNING id
    `,
    [password]
  );
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword
};
