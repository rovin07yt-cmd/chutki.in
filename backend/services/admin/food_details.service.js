const query = require('../../queries/admin/food_details.query');

const getFoodDetails = async (food_id) => {
  const foodResult = await query.getFoodDetails(food_id);

  if (!foodResult.rows.length) {
    throw new Error('Food not found');
  }

  const pricesResult = await query.getFoodPrices(food_id);
  const categoriesResult = await query.getFoodCategories(food_id);
  const imagesResult = await query.getFoodImages(food_id);
  const statsResult = await query.getFoodOrderStats(food_id);

  return {
    food: foodResult.rows[0],
    prices: pricesResult.rows,
    categories: categoriesResult.rows,
    images: imagesResult.rows,
    stats: statsResult.rows[0] || {}
  };
};

module.exports = {
  getFoodDetails
};
