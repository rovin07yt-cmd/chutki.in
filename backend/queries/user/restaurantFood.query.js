const pool = require('../../config/db');

const getFoodsByRestaurant = async (restaurant_id) => {
  return pool.query(`
    SELECT 
      f.id,
      f.name,
      f.description,
      f.type,
      f.is_available,
      rp.restaurant_name,
      rp.is_online,

      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'type', p.type,
            'mrp', p.mrp,
            'price', p.price
          )
        ) FROM food_prices p WHERE p.food_id = f.id),
        '[]'
      ) AS prices,

      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'url', i.image_url
          )
        ) FROM food_images i WHERE i.food_id = f.id),
        '[]'
      ) AS images,

      COALESCE(
        (SELECT json_agg(c.category)
         FROM food_categories c
         WHERE c.food_id = f.id),
        '[]'
      ) AS categories

    FROM food_items f
    JOIN restaurant_profiles rp ON rp.user_id = f.restaurant_id
    WHERE f.restaurant_id = $1

    ORDER BY 
      rp.is_online DESC,
      f.is_available DESC,
      f.id DESC
  `, [restaurant_id]);
};

module.exports = { getFoodsByRestaurant };
