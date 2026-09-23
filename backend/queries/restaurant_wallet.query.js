const pool = require('../config/db');

// 🔐 WALLET PASSWORD
const getWallet = (user_id) =>
  pool.query(`SELECT * FROM wallets WHERE user_id=$1`, [user_id]);

const setWalletPassword = (user_id, password) =>
  pool.query(
    `INSERT INTO wallets (user_id, wallet_password)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET wallet_password=$2`,
    [user_id, password]
  );

// 🏦 BANK DETAILS
const getBank = (user_id) =>
  pool.query(`SELECT * FROM bank_details WHERE user_id=$1`, [user_id]);

const saveBank = (user_id, data) =>
  pool.query(
    `INSERT INTO bank_details (user_id, upi_id, account_no, ifsc, holder_name)
     VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (user_id)
     DO UPDATE SET
       upi_id=$2,
       account_no=$3,
       ifsc=$4,
       holder_name=$5`,
    [user_id, data.upi_id, data.account_no, data.ifsc, data.holder_name]
  );

// 💰 SUMMARY
const getRestaurantEarning = (restaurant_id) =>
  pool.query(
    `SELECT COALESCE(SUM(restaurant_earning),0) AS total
     FROM earnings e
     JOIN order_restaurants o ON e.order_id=o.order_id
     WHERE o.restaurant_id=$1`,
    [restaurant_id]
  );

// 📜 TRANSACTIONS
const getTransactions = (user_id) =>
  pool.query(
    `SELECT * FROM transactions
     WHERE user_id=$1
     ORDER BY created_at DESC`,
    [user_id]
  );

module.exports = {
  getWallet,
  setWalletPassword,
  getBank,
  saveBank,
  getRestaurantEarning,
  getTransactions
};
