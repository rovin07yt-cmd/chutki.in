const pool = require('../../config/db');
const cartService = require('../../services/user/cart.service');
const dispatchService = require('../dispatch.service');
const orderQuery = require("../../queries/user/order.query");
const addressQuery = require("../../queries/address.query");
const areaService = require("../area.service");


const placeOrder = async (user_id, data) => {
  const { address_id, items } = data;

  if (!items || !items.length) {
    throw new Error('Cart is empty');
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

      const addressRes = await addressQuery.getAddressById(address_id, user_id);

      if (!addressRes.rows.length) {
        throw new Error("Address not found");
      }

      const address = addressRes.rows[0];

      const allowed = await areaService.isServiceable(
        address.latitude,
        address.longitude
      );

      if (!allowed) {
        throw new Error("Location not serviceable");
      }

    // 🔥 Cart summary
    const cart = await cartService.getCartSummary(items);

    if (!cart.items.length) {
      throw new Error('Invalid items');
    }

    // 🔥 Create order
    const orderRes = await client.query(
      `INSERT INTO orders 
       (user_id, address_id, total_price, delivery_charge, gst_amount, final_total, status, dispatch_status)
       VALUES ($1,$2,$3,$4,$5,$6,'pending','waiting')
       RETURNING id`,
      [
        user_id,
        address_id,
        cart.total_price,
        cart.delivery_charge,
        cart.gst,
        cart.final_total
      ]
    );

    const order_id = orderRes.rows[0].id;

    // 🔥 Insert order_items
    for (const item of cart.items) {
      await client.query(
        `INSERT INTO order_items 
        (order_id, food_id, restaurant_id, quantity, price, mrp, prep_time)
        VALUES ($1,$2,$3,$4,$5,$6,$7)`,
        [
          order_id,
          item.food_id,
          item.restaurant_id,
          item.quantity,
          item.price,
          item.mrp,
          item.prep_time
        ]
      );
    }

    // 🔥 Insert order_restaurants
    const restaurantSet = new Set(cart.items.map(i => i.restaurant_id));

    for (const rid of restaurantSet) {
      await client.query(
        `INSERT INTO order_restaurants (order_id, restaurant_id, status)
         VALUES ($1,$2,'pending')`,
        [order_id, rid]
      );
    }

    await client.query("COMMIT");

    // 🔥 Dispatch
    await dispatchService.tryDispatch(order_id);

    return { order_id };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// 🔥 CANCEL ORDER
const cancelOrder = async (user_id, order_id) => {
  const res = await pool.query(
    `SELECT status FROM orders WHERE id = $1 AND user_id = $2`,
    [order_id, user_id]
  );

  if (!res.rows.length) throw new Error("Order not found");

  const status = res.rows[0].status;

  if (status !== "pending" && status !== "accepted") {
    throw new Error("Cannot cancel after preparing");
  }

  await pool.query(
    `UPDATE orders SET status = 'cancelled' WHERE id = $1`,
    [order_id]
  );

  return { order_id };
};

// 🔥 REORDER
const reorder = async (user_id, order_id) => {
  const ownerRes = await pool.query(
    `SELECT id FROM orders WHERE id = $1 AND user_id = $2`,
    [order_id, user_id]
  );

  if (!ownerRes.rows.length) {
    throw new Error("Order not found");
  }

  const res = await pool.query(
    `SELECT food_id, quantity FROM order_items WHERE order_id = $1`,
    [order_id]
  );

  if (!res.rows.length) throw new Error("Order not found");

  return { items: res.rows };
};

module.exports = { reorder, cancelOrder, placeOrder };


const getMyOrders = async (user_id) => {
  const res = await orderQuery.getUserOrders(user_id);

  return res.rows.map(o => ({ ...o, final_total: Number(o.final_total) }));
};

module.exports.getMyOrders = getMyOrders;



const getOrderDetails = async (user_id, order_id) => {

  const res = await orderQuery.getOrderDetails(order_id, user_id);

  if (!res.rows.length) {
    throw new Error('Order not found');
  }

  const rows = res.rows;

  const order = {
    id: rows[0].id,
    status: rows[0].status,
    dispatch_status: rows[0].dispatch_status,
    created_at: rows[0].created_at,

    pricing: {
      total_price: Number(rows[0].total_price),
      delivery_charge: Number(rows[0].delivery_charge),
      gst: Number(rows[0].gst_amount),
      final_total: Number(rows[0].final_total)
    },

    items: [],
    restaurants: []
  };

  const itemMap = new Map();
  const restaurantMap = new Map();

  for (let r of rows) {

    // items
    if (!itemMap.has(r.food_id)) {
      itemMap.set(r.food_id, {
        food_id: r.food_id,
        name: r.food_name,
        quantity: r.quantity,
        price: Number(r.price)
      });
    }

    // restaurants
    if (!restaurantMap.has(r.restaurant_id)) {
      restaurantMap.set(r.restaurant_id, {
        restaurant_id: r.restaurant_id,
        name: r.restaurant_name,
        status: r.restaurant_status
      });
    }
  }

  order.items = Array.from(itemMap.values());
  order.restaurants = Array.from(restaurantMap.values());

  return order;
};

module.exports.getOrderDetails = getOrderDetails;


const getOrderTimeline = async (user_id, order_id) => {
  const res = await orderQuery.getUserOrders(user_id);

  const order = res.rows.find(o => o.id == order_id);

  if (!order) throw new Error('Order not found');

// 🔥 FULL TIMELINE
const timeline = [
  { status: "pending", done: true },
  { status: "preparing", done: false },
  { status: "ready", done: false },
  { status: "picked", done: false },
  { status: "on_the_way", done: false },
  { status: "delivered", done: false }
];

const current = order.status;
const dispatch = order.dispatch_status;

timeline.forEach(step => {
  if (step.status === "pending") step.done = true;

  if (current === "accepted" || current === "preparing" || current === "ready") {
    if (step.status === "preparing") step.done = true;
  }

  if (current === "ready") {
    if (step.status === "ready") step.done = true;
  }

  if (dispatch === "picked" || dispatch === "on_the_way" || dispatch === "delivered") {
    if (step.status === "picked") step.done = true;
  }

  if (dispatch === "on_the_way" || dispatch === "delivered") {
    if (step.status === "on_the_way") step.done = true;
  }

  if (dispatch === "delivered") {
    if (step.status === "delivered") step.done = true;
  }
});

return timeline;
};

module.exports.getOrderTimeline = getOrderTimeline;

