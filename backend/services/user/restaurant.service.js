const query = require('../../queries/user/restaurant.query');

const getRestaurants = async () => {
  const res = await query.getRestaurants();

  return res.rows.map(r => ({
    id: r.user_id,
    name: r.restaurant_name,
    is_online: r.is_online,
    image: r.image
      ? (r.image.startsWith("/") ? r.image : "/" + r.image)
      : null
  }));
};

module.exports = { getRestaurants };
