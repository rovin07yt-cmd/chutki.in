const query = require('../../queries/user/food.query');

const getHomeFoods = async () => {

  const res = await query.getHomeFoods();

  return res.rows.map(f => {

    if (typeof f.images === "string") {
      try { f.images = JSON.parse(f.images); } catch {}
    }

    if (typeof f.prices === "string") {
      try { f.prices = JSON.parse(f.prices); } catch {}
    }

    if (typeof f.categories === "string") {
      try { f.categories = JSON.parse(f.categories); } catch {}
    }

    return {
      id: f.id,
      name: f.name,
      description: f.description,
      type: f.type,
      is_available: f.is_available,

      restaurant_name: f.restaurant_name,
      is_online: f.is_online,

      // ✅ FIXED PRICES
      prices: f.prices
        .filter(p => Number(p.price) > 0)
        .map(p => ({
          type: p.type,
          mrp: Number(p.mrp),
          price: Number(p.price)
        })),

      images: f.images.map(i =>
        i.url.startsWith("/")
          ? i.url
          : "/" + i.url
      ),

      categories: f.categories
    };
  });
};

module.exports = {
  getHomeFoods
};
