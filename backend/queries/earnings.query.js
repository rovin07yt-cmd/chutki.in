const pool = require('../config/db');

// Insert earnings (ONE ROW PER ORDER)
const insertEarning = async (data) => {
  return pool.query(
    `INSERT INTO earnings 
     (order_id, rider_earning, restaurant_earning, admin_commission, rider_fuel_cost)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (order_id) DO UPDATE SET
       rider_earning = EXCLUDED.rider_earning,
       restaurant_earning = EXCLUDED.restaurant_earning,
       admin_commission = EXCLUDED.admin_commission,
       rider_fuel_cost = EXCLUDED.rider_fuel_cost
     RETURNING *`,
    [
      data.order_id,
      data.rider_earning,
      data.restaurant_earning,
      data.admin_commission,
      data.rider_fuel_cost
    ]
  );
};

module.exports = {
  insertEarning
};
