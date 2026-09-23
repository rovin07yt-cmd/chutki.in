const query = require('../../queries/admin/dashboard.query');

const getDashboard = async () => {
  const result = await query.getDashboardStats();
  return result.rows[0];
};

module.exports = {
  getDashboard
};
