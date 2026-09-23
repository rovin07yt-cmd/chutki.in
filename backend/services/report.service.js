const query = require('../queries/report.query');

const getReport = async () => {
  const orders = await query.getAllOrders();
  const delivered = await query.getDeliveredOrders();
  const profit = await query.getProfitData();
  const users = await query.getUserGrowth();

  return {
    total_orders: orders.rows.length,
    delivered_orders: delivered.rows.length,
    total_revenue: delivered.rows.reduce((sum, o) => sum + Number(o.final_total), 0),

    orders: orders.rows.map(o => ({
      ...o,
      final_total: Number(o.final_total)
    })),

    profit: profit.rows.map(p => ({
      ...p,
      final_total: Number(p.final_total),
      restaurant_earning: Number(p.restaurant_earning),
      rider_earning: Number(p.rider_earning),
      admin_profit: Number(p.admin_profit)
    })),

    users: users.rows
  };
};

module.exports = {
  getReport
};
