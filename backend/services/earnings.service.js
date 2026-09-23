const pool = require('../config/db');
const earningsQuery = require('../queries/earnings.query');

const processEarnings = async (order_id) => {
console.log("🔥 NEW EARNINGS LOGIC ACTIVE");

  const orderRes = await pool.query(
    `SELECT * FROM orders WHERE id = $1`,
    [order_id]
  );
  const order = orderRes.rows[0];

  const settingsRes = await pool.query(`SELECT * FROM system_settings LIMIT 1`);
  const settings = settingsRes.rows[0];

  // TEMP distance
  const distance = Number(order.delivery_distance || 0);

  const total_price = Number(order.total_price);
  const final_total = Number(order.final_total);

  const admin_percent = Number(settings.admin_commission_percent);
  const rider_commission = Number(settings.rider_commission_per_order);
  const fuel_per_km = Number(settings.fuel_per_km);

  console.log('DEBUG commission:', rider_commission);

  // ADMIN CUT
  const admin_cut = (total_price * admin_percent) / 100;

  const restaurant_earning = total_price - admin_cut;

  // RIDER
  const rider_fuel_cost = distance * fuel_per_km;
  const rider_earning = rider_commission + rider_fuel_cost;

  // ADMIN
  const admin_commission =
    final_total - (restaurant_earning + rider_earning);

  await earningsQuery.insertEarning({
    order_id,
    rider_earning,
    restaurant_earning,
    admin_commission,
    rider_fuel_cost
  });

  return { message: 'Earnings processed' };
};

module.exports = {
  processEarnings
};
