const query = require('../../queries/admin/restaurant_orders.query');

const getRestaurantOrders = async (
  restaurant_id,
  filter,
  date
) => {

  const result = await query.getRestaurantOrders(
    restaurant_id,
    filter,
    date
  );

  return result.rows;
};

module.exports = {
  getRestaurantOrders
};
