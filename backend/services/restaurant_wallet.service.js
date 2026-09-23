const query = require('../queries/restaurant_wallet.query');

// 🔐 SET PASSWORD
const setPassword = async (user_id, password) => {
  await query.setWalletPassword(user_id, password);
  return { message: 'Wallet password set' };
};

// 🔐 LOGIN
const login = async (user_id, password) => {
  const res = await query.getWallet(user_id);

  if (res.rows.length === 0) {
    throw new Error('Wallet not setup');
  }

  if (res.rows[0].wallet_password !== password) {
    throw new Error('Invalid password');
  }

  return { message: 'Wallet access granted' };
};

// 🔐 CHANGE PASSWORD
const changePassword = async (user_id, old_password, new_password) => {
  const res = await query.getWallet(user_id);

  if (res.rows[0].wallet_password !== old_password) {
    throw new Error('Wrong old password');
  }

  await query.setWalletPassword(user_id, new_password);

  return { message: 'Password changed' };
};

// 🏦 BANK
const getBank = async (user_id) => {
  const res = await query.getBank(user_id);
  return res.rows[0] || {};
};

const saveBank = async (user_id, data) => {
  await query.saveBank(user_id, data);
  return { message: 'Bank details saved' };
};

// 💰 SUMMARY
const getRestaurantSummary = async (restaurant_id) => {
  const earning = await query.getRestaurantEarning(restaurant_id);

  return {
    total_earning: earning.rows[0].total
  };
};

// 📜 HISTORY
const getHistory = async (user_id) => {
  const res = await query.getTransactions(user_id);
  return res.rows;
};

module.exports = {
  setPassword,
  login,
  changePassword,
  getBank,
  saveBank,
  getRestaurantSummary,
  getHistory
};
