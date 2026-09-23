const orderQuery = require('../queries/order.query');

const getRestaurantOrders = async (restaurant_id, status) => {
  let ordersRes;

  // 🔥 STATUS BASED QUERY
  if (status === 'history') {
    ordersRes = await orderQuery.getHistoryOrders(restaurant_id);
  } else {
    ordersRes = await orderQuery.getOrdersByRestaurant(restaurant_id);
  }

  const orders = [];

  for (let row of ordersRes.rows) {

    // 🔥 FILTER NORMAL STATUS
    if (status && status !== 'history' && row.restaurant_status !== status) continue;

    const itemsRes = await orderQuery.getOrderItemsByRestaurant(
      row.id,
      restaurant_id
    );

    if (!itemsRes.rows.length) continue;

    const totalRes = await orderQuery.getTotalItems(row.id, restaurant_id);
    const prepRes = await orderQuery.getMaxPrepTime(row.id, restaurant_id);

    orders.push({
      order_id: row.id,
      order_status: row.order_status,
      restaurant_status: row.restaurant_status,
      created_at: row.created_at,
      total_items: totalRes.rows[0].total_items,
      prep_time: prepRes.rows[0].prep_time,
      items: itemsRes.rows.map(i => ({
        food_id: i.food_id,
        quantity: Number(i.quantity),
        price: Number(i.price),
        mrp: Number(i.mrp),
        prep_time: Number(i.prep_time)
      }))
    });
  }

  return orders;
};

module.exports = {
  getRestaurantOrders
};

// 🔥 COUNTS SERVICE
const getOrderCounts = async (restaurant_id) => {

  const res = await orderQuery.getOrderCounts(restaurant_id);

  // DEFAULT STRUCTURE
  const counts = {
    pending: 0,
    accepted: 0,
    preparing: 0,
    ready: 0,
    picked: 0,
    on_the_way_return: 0,
    returned: 0,
    delivered: 0
  };

  for (let row of res.rows) {
    if (row.status === "cancelled") continue;
    counts[row.status] = Number(row.count);
  }

  return counts;
};

module.exports.getOrderCounts = getOrderCounts;

