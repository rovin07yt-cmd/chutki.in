const pool = require('../config/db');

// total COD received from riders
const getTotalCODReceived = async () => {
  return pool.query(
    `SELECT SUM(cod_submitted) AS total_received FROM riders`
  );
};

// total commission earned
const getTotalCommission = async () => {
  return pool.query(
    `SELECT SUM(admin_commission) AS total_commission FROM earnings`
  );
};

module.exports = {
  getTotalCODReceived,
  getTotalCommission
};
