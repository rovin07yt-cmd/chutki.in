const pool = require('../config/db');
const pickupQuery = require('../queries/pickup.query');

const reoptimizeRoute = async (rider_id) => {
  console.log("REOPTIMIZE RUNNING", rider_id);

  // 1. Rider location
  const riderRes = await pool.query(
    `SELECT current_lat, current_lng FROM riders WHERE id = $1`,
    [rider_id]
  );

  const rider = riderRes.rows[0];
  if (!rider || !rider.current_lat) return;

  // 2. Get all active orders
  const ordersRes = await pickupQuery.getRiderOrders(rider_id);
  const orders = ordersRes.rows.map(o => o.id);

  await pool.query(`DELETE FROM pickup_sequence WHERE rider_id = $1`, [rider_id]);

  if (orders.length === 0) return;

  // 4. Get restaurants
  const restRes = await pickupQuery.getRestaurantsFromOrders(orders);

  let points = [];

  // PICKUPS
  for (const r of restRes.rows) {
    const distance = Math.sqrt(
      Math.pow(r.lat - rider.current_lat, 2) +
      Math.pow(r.lng - rider.current_lng, 2)
    );

    points.push({
      order_id: r.order_id,
      type: 'pickup',
      ref: r.restaurant_id,
      score: distance
    });
  }

  // DELIVERIES
  const addrRes = await pool.query(
    `SELECT o.id, a.latitude, a.longitude
     FROM orders o
     JOIN addresses a ON o.address_id = a.id
     WHERE o.id = ANY($1)`,
    [orders]
  );

  for (const a of addrRes.rows) {
    const distance = Math.sqrt(
      Math.pow(a.latitude - rider.current_lat, 2) +
      Math.pow(a.longitude - rider.current_lng, 2)
    );

    points.push({
      order_id: a.id,
      type: 'delivery',
      ref: a.id,
      score: distance + 1000
    });
  }

  // 5. Sort
  points.sort((a, b) => a.score - b.score);

  // 6. Insert
  let seq = 1;
  for (const p of points) {
    await pickupQuery.insertPoint(
      rider_id,
      p.order_id,
      p.type,
      p.ref,
      seq
    );
    seq++;
  }

};

module.exports = {
  reoptimizeRoute
};
