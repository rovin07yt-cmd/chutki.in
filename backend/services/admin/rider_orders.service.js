const query = require('../../queries/admin/rider_orders.query');

const getRiderOrders = async (user_id, filter, date) => {
  const result = await query.getRiderOrders(
    user_id,
    filter,
    date
  );

  return result.rows;
};

module.exports = {
  getRiderOrders
};
