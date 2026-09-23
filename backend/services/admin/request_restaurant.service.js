const query = require('../../queries/admin/request_restaurant.query');

const getPendingRestaurants = async () => {
  const result = await query.getPendingRestaurants();
  return result.rows;
};

const approveRestaurant = async (user_id) => {
  const result = await query.approveRestaurant(user_id);

  if (!result.rows.length) {
    throw new Error('Restaurant not found');
  }

  return {
    user_id,
    approved: true
  };
};

module.exports = {
  getPendingRestaurants,
  approveRestaurant
};
