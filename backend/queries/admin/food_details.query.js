const pool = require('../../config/db');

const getFoodDetails = async (food_id) => {
  return pool.query(
    `SELECT
      f.id,
      f.restaurant_id,
      f.name,
      f.description,
      f.type,
      f.is_available,
      rp.restaurant_name
     FROM food_items f
     LEFT JOIN restaurant_profiles rp
       ON rp.user_id = f.restaurant_id
     WHERE f.id = $1`,
    [food_id]
  );
};

const getFoodPrices = async (food_id) => {
  return pool.query(
    `SELECT
      type,
      price,
      mrp,
      prep_time
     FROM food_prices
     WHERE food_id = $1
     ORDER BY type`,
    [food_id]
  );
};

const getFoodCategories = async (food_id) => {
  return pool.query(
    `SELECT
      category
     FROM food_categories
     WHERE food_id = $1`,
    [food_id]
  );
};

const getFoodImages = async (food_id) => {
  return pool.query(
    `SELECT
      id,
      image_url,
      is_main
     FROM food_images
     WHERE food_id = $1
     ORDER BY is_main DESC, id ASC`,
    [food_id]
  );
};

const getFoodOrderStats = async (food_id) => {
  return pool.query(
    `SELECT
      COUNT(*) AS total_ordered,
      COALESCE(SUM(quantity),0) AS total_quantity
     FROM order_items
     WHERE food_id = $1`,
    [food_id]
  );
};

module.exports = {
  getFoodDetails,
  getFoodPrices,
  getFoodCategories,
  getFoodImages,
  getFoodOrderStats
};
