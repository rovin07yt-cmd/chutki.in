const orderQuery = require('../queries/order.query');
const pool = require('../config/db');
const pickupService = require('./pickup.service');
const notificationService = require("./notification.service");


const tryDispatch = async (order_id) => {

  // 0. Already assigned check
  const existing = await pool.query(
    `SELECT assigned_rider_id FROM orders WHERE id = $1`,
    [order_id]
  );

  if (existing.rows[0].assigned_rider_id) {
    console.log('⚠️ Already assigned');
    return { dispatch: false };
  }

  // 1. Check all restaurants ready
  const res = await orderQuery.areAllRestaurantsReady(order_id);
  if (Number(res.rows[0].not_ready) !== 0) {
    return { dispatch: false };
  }

  // 2. Get order location
  const orderRes = await pool.query(
    `SELECT a.latitude, a.longitude
     FROM orders o
     JOIN addresses a ON o.address_id = a.id
     WHERE o.id = $1`,
    [order_id]
  );

  const { latitude, longitude } = orderRes.rows[0];

  // 3. Settings
  const settings = (await pool.query(`SELECT * FROM system_settings LIMIT 1`)).rows[0];

  // 4. Items count
  const itemsRes = await pool.query(
    `SELECT COALESCE(SUM(quantity),0) AS total_items
     FROM order_items WHERE order_id = $1`,
    [order_id]
  );

  const newItems = Number(itemsRes.rows[0].total_items);

  // 5. Riders
  const riderRes = await pool.query(
    `SELECT r.id,
              r.user_id,
            COUNT(o.id) AS active_orders,
            COALESCE(SUM(oi.quantity), 0) AS active_items,
            earth_distance(
              ll_to_earth($1, $2),
              ll_to_earth(r.current_lat, r.current_lng)
            ) AS distance
     FROM riders r
     LEFT JOIN orders o 
       ON r.id = o.assigned_rider_id 
       AND o.dispatch_status IN ('assigned','picked')
     LEFT JOIN order_items oi ON oi.order_id = o.id
     WHERE r.is_online = true
       AND r.current_lat IS NOT NULL
       AND r.current_lng IS NOT NULL
     GROUP BY r.id
     ORDER BY distance ASC, active_orders ASC`,
    [latitude, longitude]
  );

  if (riderRes.rows.length === 0) {
    return { dispatch: false, reason: 'No rider' };
  }

  let selectedRider = null;

  for (const r of riderRes.rows) {
    const activeOrders = Number(r.active_orders);
    const activeItems = Number(r.active_items);

    if (
      activeOrders < settings.max_orders_per_rider &&
      (activeItems + newItems) <= settings.max_items_per_rider
    ) {
      if (activeOrders === 0) {
        await pool.query(`UPDATE riders SET total_distance_today = 0 WHERE id = $1`, [r.id]);
      }
      selectedRider = r;
      break;
    }
  }

  if (!selectedRider) {
    return { dispatch: false, reason: 'Busy' };
  }

  // Assign
  await pool.query(
    `UPDATE orders
     SET assigned_rider_id = $1,
         dispatch_status = 'assigned',
         assigned_at = CURRENT_TIMESTAMP
     WHERE id = $2`,
    [selectedRider.id, order_id]
  );


    await notificationService.notify({
      user_id: selectedRider.user_id,
      type: "order",
      message: `New order #${order_id} assigned to you`
    });

  await pickupService.reoptimizeRoute(selectedRider.id);

  return { dispatch: true, rider_id: selectedRider.id };
};

module.exports = { tryDispatch };
