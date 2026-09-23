const pool = require('../../config/db');

const getHomeFoods = async () => {
  return pool.query(`
    SELECT 
      f.id,
      f.name,
      f.description,
      f.type,
      f.is_available,

      r.restaurant_name,
      r.is_online,

      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'type', p.type,
            'mrp', p.mrp,
            'price', p.price
          )
        )
        FROM food_prices p
        WHERE p.food_id = f.id),
        '[]'
      ) AS prices,

      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'url', i.image_url,
            'is_main', i.is_main
          )
          ORDER BY i.is_main DESC, i.id ASC
        )
        FROM food_images i
        WHERE i.food_id = f.id
        ),
        '[]'
      ) AS images,

      COALESCE(
        (SELECT json_agg(c.category)
         FROM food_categories c
         WHERE c.food_id = f.id),
        '[]'
      ) AS categories

    FROM food_items f
    JOIN restaurant_profiles r 
      ON r.user_id = f.restaurant_id

    ORDER BY 
      r.is_online DESC,
      f.is_available DESC,
      f.id DESC
  `);
};

module.exports = {
  getHomeFoods
};
