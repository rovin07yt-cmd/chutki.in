const adminQuery = require('../queries/admin_wallet.query');

const getAdminSummary = async () => {
  const cod = await adminQuery.getTotalCODReceived();
  const commission = await adminQuery.getTotalCommission();

  return {
    total_cod_received: cod.rows[0].total_received || 0,
    total_commission: commission.rows[0].total_commission || 0
  };
};

module.exports = {
  getAdminSummary
};
