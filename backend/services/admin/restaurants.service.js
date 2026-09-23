const query = require('../../queries/admin/restaurants.query');

const getRestaurants = async () => {
  const result = await query.getRestaurants();
  return result.rows;
};

const blockRestaurant = async (user_id) => {
  const result = await query.blockRestaurant(user_id);

  if (!result.rows.length) {
    throw new Error('Restaurant not found');
  }

  return {
    user_id,
    blocked: true
  };
};

const unblockRestaurant = async (user_id) => {
  const result = await query.unblockRestaurant(user_id);

  if (!result.rows.length) {
    throw new Error('Restaurant not found');
  }

  return {
    user_id,
    blocked: false
  };
};

const getRestaurantDetails = async (user_id) => {
  const profileResult = await query.getRestaurantDetails(user_id);

  if (!profileResult.rows.length) {
    throw new Error('Restaurant not found');
  }

  const bankResult = await query.getRestaurantBankDetails(user_id);
  const statsResult = await query.getRestaurantStats(user_id);
  const earningsResult = await query.getRestaurantTotalEarnings(user_id);

  return {
    profile: profileResult.rows[0],
    bank: bankResult.rows[0] || {},
    stats: statsResult.rows[0] || {},
    earnings: earningsResult.rows[0] || {}
  };
};

module.exports = {
  getRestaurants,
  getRestaurantDetails,
  blockRestaurant,
  unblockRestaurant
};
