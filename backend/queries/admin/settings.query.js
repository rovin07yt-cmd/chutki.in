const pool = require('../../config/db');

const getSettings = async () => {
  return pool.query(`
    SELECT *
    FROM system_settings
    LIMIT 1
  `);
};

const updateSettings = async (data) => {
  return pool.query(
    `
    UPDATE system_settings
    SET
      place_orders_enabled = $1,
      delivery_charge = $2,
      gst_percent = $3,
      rider_commission_per_order = $4,
      fuel_per_km = $5,
      admin_commission_percent = $6,
      max_orders_per_rider = $7,
      max_items_per_rider = $8,
      other_charge_name = $9,
      other_charge_percent = $10
    WHERE id = 1
    RETURNING *
    `,
    [
      data.place_orders_enabled,
      data.delivery_charge,
      data.gst_percent,
      data.rider_commission_per_order,
      data.fuel_per_km,
      data.admin_commission_percent,
      data.max_orders_per_rider,
      data.max_items_per_rider,
      data.other_charge_name,
      data.other_charge_percent
    ]
  );
};

module.exports = {
  getSettings,
  updateSettings
};