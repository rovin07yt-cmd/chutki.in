const pool = require('../../config/db');

const getFoods = async () => {
  return pool.query(`
    SELECT
      f.id,
      f.restaurant_id,
      f.name,
      f.type,
      f.is_available,
      f.delete_at,
      rp.restaurant_name,

      MAX(
        CASE WHEN fp.type = 'half'
        THEN fp.price END
      ) AS half_price,

      MAX(
        CASE WHEN fp.type = 'full'
        THEN fp.price END
      ) AS full_price,

      MAX(
        CASE WHEN fp.type = 'half'
        THEN fp.mrp END
      ) AS half_mrp,

      MAX(
        CASE WHEN fp.type = 'full'
        THEN fp.mrp END
      ) AS full_mrp,

      MAX(fi.image_url) AS image

    FROM food_items f

    LEFT JOIN restaurant_profiles rp
      ON rp.user_id = f.restaurant_id

    LEFT JOIN food_prices fp
      ON fp.food_id = f.id

    LEFT JOIN food_images fi
      ON fi.food_id = f.id

    GROUP BY
      f.id,
      f.restaurant_id,
      f.name,
      f.type,
      f.is_available,
      f.delete_at,
      rp.restaurant_name

    ORDER BY
      f.is_available DESC,
      f.id DESC
  `);
};

const getFoodForUpdate = async (food_id) => {
  return pool.query(
    `
    SELECT
      f.id,
      f.name,
      f.description,
      f.type,
      f.is_available,
      f.delete_at
    FROM food_items f
    WHERE f.id = $1
    `,
    [food_id]
  );
};

const updateFood = async ({
  food_id,
  name,
  description,
  type,
  categories,
  prices
}) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const foodResult = await client.query(
      `
      UPDATE food_items
      SET
        name = $1,
        description = $2,
        type = $3
      WHERE id = $4
      RETURNING id, name, description, type, is_available, delete_at
      `,
      [
        name.toUpperCase().trim(),
        description || '',
        type,
        food_id
      ]
    );

    if (!foodResult.rows.length) {
      throw new Error('Food not found');
    }

    await client.query(
      `DELETE FROM food_categories WHERE food_id = $1`,
      [food_id]
    );

    for (const category of categories) {
      await client.query(
        `
        INSERT INTO food_categories(food_id, category)
        VALUES($1, $2)
        `,
        [food_id, category]
      );
    }

    await client.query(
      `DELETE FROM food_prices WHERE food_id = $1`,
      [food_id]
    );

    for (const price of prices) {
      await client.query(
        `
        INSERT INTO food_prices
        (food_id, type, mrp, price, prep_time)
        VALUES($1, $2, $3, $4, $5)
        `,
        [
          food_id,
          price.type,
          price.mrp,
          price.price,
          price.prep_time
        ]
      );
    }

    await client.query('COMMIT');

    return foodResult.rows[0];

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deleteFood = async (food_id) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const foodResult = await client.query(
      `
      SELECT id
      FROM food_items
      WHERE id = $1
      FOR UPDATE
      `,
      [food_id]
    );

    if (!foodResult.rows.length) {
      throw new Error('Food not found');
    }

    const orderResult = await client.query(
      `
      SELECT EXISTS(
        SELECT 1
        FROM order_items
        WHERE food_id = $1
      ) AS has_orders
      `,
      [food_id]
    );

    if (orderResult.rows[0].has_orders) {
      const result = await client.query(
        `
        UPDATE food_items
        SET
          is_available = false,
          delete_at = NOW() + INTERVAL '1 hour'
        WHERE id = $1
        RETURNING id, is_available, delete_at
        `,
        [food_id]
      );

      await client.query('COMMIT');

      return {
        mode: 'scheduled',
        food: result.rows[0]
      };
    }

    const result = await client.query(
      `
      DELETE FROM food_items
      WHERE id = $1
      RETURNING id
      `,
      [food_id]
    );

    await client.query('COMMIT');

    return {
      mode: 'deleted',
      food: result.rows[0]
    };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const deleteExpiredFoods = async () => {
  return pool.query(`
    DELETE FROM food_items
    WHERE delete_at IS NOT NULL
      AND delete_at <= NOW()
    RETURNING id
  `);
};

module.exports = {
  getFoods,
  getFoodForUpdate,
  updateFood,
  deleteFood,
  deleteExpiredFoods
};
