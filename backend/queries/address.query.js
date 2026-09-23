const pool = require('../config/db');

// Add address
const addAddress = async (user_id, latitude, longitude, label) => {
  return pool.query(
    `INSERT INTO addresses (user_id, latitude, longitude, label)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, latitude, longitude, label]
  );
};

// Get all addresses of user
const getUserAddresses = async (user_id) => {
  return pool.query(
    `SELECT * FROM addresses WHERE user_id = $1 ORDER BY id DESC`,
    [user_id]
  );
};

// Delete address
const deleteAddress = async (id, user_id) => {
  return pool.query(
    `DELETE FROM addresses WHERE id = $1 AND user_id = $2`,
    [id, user_id]
  );
};

const getAddressById = async (id, user_id) => {
  return pool.query(
    `SELECT * FROM addresses WHERE id = $1 AND user_id = $2`,
    [id, user_id]
  );
};

module.exports = {
  addAddress,
  getUserAddresses,
  deleteAddress,
  getAddressById
};
