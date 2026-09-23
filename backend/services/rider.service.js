const pool = require('../config/db');
const earningsService = require('./earnings.service');
const notificationService = require('./notification.service');
const pickupService = require("./pickup.service");
const riderOrderQuery = require("../queries/rider_order.query");
const axios = require("axios");



// PICK ORDER
const markPicked = async (order_id, rider_id) => {
  const res = await pool.query(
    `UPDATE orders
     SET dispatch_status = 'picked',
         picked_at = CURRENT_TIMESTAMP
       WHERE id = $1 AND assigned_rider_id = (SELECT id FROM riders WHERE user_id = $2)
     RETURNING *`,
    [order_id, rider_id]
  );

  if (res.rows.length === 0) {
    throw new Error('Invalid order or rider');
  }

  const order = res.rows[0];

  await notificationService.notify({
    user_id: order.user_id,
    type: 'order',
    message: 'Rider picked your order'
  });

  const riderRes = await pool.query(`SELECT id FROM riders WHERE user_id = $1`, [rider_id]);
  await pickupService.reoptimizeRoute(riderRes.rows[0].id);

  return { message: 'Order picked' };
};

// DELIVER ORDER
const markDelivered = async (order_id, rider_id) => {
  const res = await pool.query(
    `UPDATE orders
     SET dispatch_status = 'delivered',
         delivered_at = CURRENT_TIMESTAMP,
         cod_amount = final_total,
         status = 'delivered'
       WHERE id = $1 AND assigned_rider_id = (SELECT id FROM riders WHERE user_id = $2)
     RETURNING *`,
    [order_id, rider_id]
  );

  if (res.rows.length === 0) {
    throw new Error('Invalid order or rider');
  }

  const order = res.rows[0];

  // 💰 UPDATE COD
  await pool.query(
    `UPDATE riders 
     SET cod_collected = cod_collected + $1 
     WHERE user_id = $2`,
    [order.final_total, rider_id]
  );

  // 🔥 CHECK ACTIVE ORDERS
  const activeRes = await pool.query(
    `SELECT COUNT(*) FROM orders 
     WHERE assigned_rider_id = $1 
     AND dispatch_status IN ('assigned','picked')`,
    [rider_id]
  );

  const remaining = Number(activeRes.rows[0].count);

  // ✅ RESET DISTANCE IF NO ACTIVE ORDERS
  if (remaining === 0) {
    await pool.query(
      `UPDATE riders 
       SET total_distance_today = 0 
       WHERE id = $1`,
      [rider_id]
    );
  }

  // 🔥 AUTO REDISPATCH WAITING ORDERS
  const dispatchService = require('./dispatch.service');

  const waitingOrders = await pool.query(
    `SELECT id FROM orders
     WHERE dispatch_status = 'waiting'
     ORDER BY id ASC`
  );

  for (const o of waitingOrders.rows) {
    const result = await dispatchService.tryDispatch(o.id);

    if (result.dispatch) {
      console.log('🔥 Redispatched order:', o.id);
      break;
    }
  }

  // 💰 PROCESS EARNINGS
  await earningsService.processEarnings(order_id);

  // 🔔 NOTIFY USER
  await notificationService.notify({
    user_id: order.user_id,
    type: 'order',
    message: 'Order delivered successfully'
  });

  const riderRes = await pool.query(`SELECT id FROM riders WHERE user_id = $1`, [rider_id]);
  await pickupService.reoptimizeRoute(riderRes.rows[0].id);

  return { message: 'Order delivered' };
};

// RETURN TO RESTAURANT STARTED

const markReturnStarted = async (order_id, rider_id) => {

  const res = await pool.query(
    `UPDATE orders
     SET status = 'on_the_way_return',
         dispatch_status = 'on_the_way_return'
       WHERE id = $1
         AND assigned_rider_id = (SELECT id FROM riders WHERE user_id = $2)
     RETURNING *`,
    [order_id, rider_id]
  );

  if (!res.rows.length) {
    throw new Error("Invalid order or rider");
  }

  await pool.query(
    `UPDATE order_restaurants
     SET status = 'on_the_way_return'
     WHERE order_id = $1`,
    [order_id]
  );

  const restaurants = await pool.query(
    `SELECT restaurant_id
     FROM order_restaurants
     WHERE order_id = $1`,
    [order_id]
  );

  for (const r of restaurants.rows) {
    await notificationService.notify({
      user_id: r.restaurant_id,
      type: "order",
        message: `Order #${order_id} is being returned by rider`
    });
  }

  return { message: "Return started" };
};

const markReturned = async (order_id, rider_id) => {

  const res = await pool.query(
    `UPDATE orders
     SET status = 'returned',
         dispatch_status = 'returned'
       WHERE id = $1
         AND assigned_rider_id = (SELECT id FROM riders WHERE user_id = $2)
     RETURNING *`,
    [order_id, rider_id]
  );

  if (!res.rows.length) {
    throw new Error("Invalid order or rider");
  }

  await pool.query(
    `UPDATE order_restaurants
     SET status = 'returned'
     WHERE order_id = $1`,
    [order_id]
  );

  await pool.query(
    `UPDATE rider_assignments
     SET status = 'cancelled_returned'
     WHERE order_id = $1`,
    [order_id]
  );

  const restaurants = await pool.query(
    `SELECT restaurant_id
     FROM order_restaurants
     WHERE order_id = $1`,
    [order_id]
  );

  for (const r of restaurants.rows) {
    await notificationService.notify({
      user_id: r.restaurant_id,
      type: "order",
        message: `Order #${order_id} returned to restaurant`
    });
  }

  const riderRes = await pool.query(`SELECT id FROM riders WHERE user_id = $1`, [rider_id]);
  await pickupService.reoptimizeRoute(riderRes.rows[0].id);

  return { message: "Parcel returned" };
};

module.exports = {
  markPicked,
  markDelivered,
  markReturnStarted,
  markReturned
};

const getAssignedOrders = async (user_id) => {

  const riderRes = await pool.query(
    `SELECT id FROM riders WHERE user_id = $1`,
    [user_id]
  );

  if (riderRes.rows.length === 0) {
    throw new Error("Rider not found");
  }

  const rider_id = riderRes.rows[0].id;


  const res = await pool.query(
    `SELECT
        o.id,
        o.final_total AS cod,
        o.dispatch_status,
        o.status,
        o.created_at,

        u.name AS user_name,
        u.mobile AS user_mobile,

        JSON_AGG(
          DISTINCT JSONB_BUILD_OBJECT(
            'restaurant_id', rp.user_id,
            'name', rp.restaurant_name,
            'mobile', ru.mobile
          )
        ) AS restaurants


     FROM orders o

     JOIN users u
       ON u.id = o.user_id

     LEFT JOIN order_restaurants orr
       ON orr.order_id = o.id

     LEFT JOIN restaurant_profiles rp
       ON rp.user_id = orr.restaurant_id
      LEFT JOIN users ru
        ON ru.id = rp.user_id


     WHERE o.assigned_rider_id = $1
       AND o.dispatch_status IN ('assigned','picked','on_the_way_return')
       AND o.status NOT IN ('cancelled','delivered')

     GROUP BY
       o.id,
       u.name,
       u.mobile

     ORDER BY o.assigned_at ASC NULLS LAST,
              o.id ASC`
    ,
    [rider_id]
  );

  return res.rows.map((row, index) => ({
    serial_no: index + 1,
    ...row
  }));
};

module.exports.getAssignedOrders =
  getAssignedOrders;


const getHistory = async (rider_id, filter = 'all') => {

  let where = `
    o.assigned_rider_id = $1
    AND o.status = 'delivered'
  `;

  if (filter === 'today') {
    where += `
      AND DATE(o.delivered_at) = CURRENT_DATE
    `;
  }

  const res = await pool.query(
    `
    SELECT
      o.id,
      o.final_total AS cod,
      o.delivered_at

    FROM orders o

    WHERE ${where}

    ORDER BY o.delivered_at DESC
    `,
    [rider_id]
  );

  return res.rows.map((row, index) => ({
    serial_no: index + 1,
    ...row
  }));
};

module.exports.getHistory = getHistory;




const getRoute = async (user_id) => {

  const riderRes = await pool.query(
    `SELECT id
     FROM riders
     WHERE user_id = $1`,
    [user_id]
  );

  if (!riderRes.rows.length) {
    throw new Error("Rider not found");
  }

  const rider_id = riderRes.rows[0].id;

  const res = await pool.query(
    `
    SELECT
      ps.sequence_number,
      ps.order_id,
      ps.point_type,

      rp.restaurant_name,
      rp.restaurant_mobile,
      rp.lat AS restaurant_lat,
      rp.lng AS restaurant_lng,

      u.name AS customer_name,
      u.mobile AS customer_mobile,

      a.label,
      a.latitude,
      a.longitude

    FROM pickup_sequence ps

    JOIN orders o
      ON o.id = ps.order_id

    JOIN users u
      ON u.id = o.user_id

    LEFT JOIN addresses a
      ON a.id = o.address_id

    LEFT JOIN restaurant_profiles rp
      ON rp.user_id = ps.reference_id

    WHERE ps.rider_id = $1

    ORDER BY ps.sequence_number ASC
    `,
    [rider_id]
  );

  const stops = res.rows.map(r => ({
    sequence_number: r.sequence_number,
    order_id: r.order_id,
    point_type: r.point_type,

    lat: r.point_type === "pickup"
      ? r.restaurant_lat
      : r.latitude,

    lng: r.point_type === "pickup"
      ? r.restaurant_lng
      : r.longitude,

    restaurant_name: r.restaurant_name,
    restaurant_mobile: r.restaurant_mobile,

    customer_name: r.customer_name,
    customer_mobile: r.customer_mobile,

    label: r.label
  }));

  if (!stops.length) {
    return {
      rider_id,
      stops: []
    };
  }

  const riderLocation = await pool.query(
    `SELECT current_lat,current_lng FROM riders WHERE id = $1`,
    [rider_id]
  );

  const coordinates = [
    `${riderLocation.rows[0].current_lng},${riderLocation.rows[0].current_lat}`,
    ...stops.map(s => `${s.lng},${s.lat}`)
  ].join(";");

  const osrm = await axios.get(
    `https://router.project-osrm.org/route/v1/driving/${coordinates}`,
    {
      params: {
        overview: "full",
        geometries: "geojson",
        steps: false
      }
    }
  );

  const route =
    osrm.data.routes?.[0] || null;

  return {
    rider_id,
    distance_meters: route?.distance || 0,
    duration_seconds: route?.duration || 0,
    geometry: route?.geometry || null,
    stops
  };
};

module.exports.getRoute = getRoute;

const getOrderDetails = async (user_id, order_id) => {

  const riderRes = await pool.query(
    `SELECT id
     FROM riders
     WHERE user_id = $1`,
    [user_id]
  );

  if (riderRes.rows.length === 0) {
    throw new Error("Rider not found");
  }

  const rider_id = riderRes.rows[0].id;

  const res =
    await riderOrderQuery.getOrderDetails(
      order_id,
      rider_id
    );

  if (!res.rows.length) {
    throw new Error("Order not found");
  }

  const rows = res.rows;

  const order = {
    id: rows[0].id,
    status: rows[0].status,
    dispatch_status: rows[0].dispatch_status,
    created_at: rows[0].created_at,
    cod: Number(rows[0].final_total),

    customer: {
      name: rows[0].customer_name,
      mobile: rows[0].customer_mobile
    },

    delivery_address: {
      label: rows[0].label,
      latitude: rows[0].latitude,
      longitude: rows[0].longitude
    },

    items: [],
    restaurants: []
  };

  const itemMap = new Map();
  const restaurantMap = new Map();

  for (const r of rows) {

    if (!itemMap.has(r.food_id)) {
      itemMap.set(r.food_id, {
        food_id: r.food_id,
        name: r.food_name,
        quantity: r.quantity,
        price: Number(r.price)
      });
    }

    if (!restaurantMap.has(r.restaurant_id)) {
      restaurantMap.set(r.restaurant_id, {
        restaurant_id: r.restaurant_id,
        name: r.restaurant_name,
        mobile: r.restaurant_mobile,
        lat: r.lat,
        lng: r.lng,
        status: r.restaurant_status
      });
    }
  }

  order.items = Array.from(itemMap.values());
  order.restaurants = Array.from(restaurantMap.values());

  return order;
};

module.exports.getOrderDetails = getOrderDetails;
