const query = require('../../queries/user/search.query');

const searchAll = async (q) => {

  if (!q || q.trim() === "") {
    return [];
  }

  const res = await query.searchAll(q);

  return res.rows.map(r => ({
    type: r.type,
    id: r.id,
    name: r.name,
    restaurant_name: r.restaurant_name,
    is_online: r.is_online,
    is_available: r.is_available
  }));
};

module.exports = {
  searchAll
};
