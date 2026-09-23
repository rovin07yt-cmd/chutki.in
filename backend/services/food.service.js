const pool = require('../config/db');

// 🔥 ADD FOOD (SAFE + TRANSACTION)
// 🔥 ADD FOOD (CLEAN)
const addFood = async (data) => {
  const client = await pool.connect();

  const allowedCategories = ["breakfast","lunch","dinner","snacks","sweets","dessert","drinks"];

  try {
    const {
      restaurant_id,
      name,
      description,
      type,
      categories,
      prices
    } = data;

    if (!name) throw new Error("name required");

    if (!["veg","nonveg"].includes(type)) {
      throw new Error("invalid food type");
    }

    if (!Array.isArray(categories) || !categories.length) {
      throw new Error("categories required");
    }

    for (let cat of categories) {
      if (!allowedCategories.includes(cat)) {
        throw new Error("invalid category");
      }
    }

    if (!Array.isArray(prices) || !prices.length) {
      throw new Error("prices required");
    }

    for (let p of prices) {
      if (!["half","full"].includes(p.type)) {
        throw new Error("invalid price type");
      }

      if (p.prep_time === undefined || p.prep_time === null) {
        throw new Error("prep_time required");
      }

      if (Number(p.price) > Number(p.mrp)) {
        throw new Error("price cannot exceed MRP");
      }
    }

    await client.query("BEGIN");

    const foodRes = await client.query(
      `INSERT INTO food_items (restaurant_id, name, description, type)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [restaurant_id, name.toUpperCase().trim(), description || "", type]
    );

    const food_id = foodRes.rows[0].id;

    for (let cat of categories) {
      await client.query(
        `INSERT INTO food_categories (food_id, category)
         VALUES ($1, $2)`,
        [food_id, cat]
      );
    }

    for (let p of prices) {
      await client.query(
        `INSERT INTO food_prices (food_id, type, mrp, price, prep_time)
         VALUES ($1, $2, $3, $4, $5)`,
        [food_id, p.type, p.mrp, p.price, p.prep_time]
      );
    }

    await client.query("COMMIT");

    return { food_id };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};






// 🔥 GET FOODS (UNCHANGED FOR NOW)
const getFoods = async (restaurant_id) => {

  const res = await pool.query(`
    SELECT 
      f.id,
      f.name,
      f.description,
      f.type,
      f.is_available,

      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'type', p.type,
            'mrp', p.mrp,
            'price', p.price,
            'prep_time', p.prep_time
          )
        ) FROM food_prices p WHERE p.food_id = f.id),
        '[]'
      ) AS prices,

      COALESCE(
        (SELECT json_agg(c.category)
         FROM food_categories c
         WHERE c.food_id = f.id),
        '[]'
      ) AS categories,

      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'url', i.image_url,
            'is_main', i.is_main
          )
        ) FROM food_images i WHERE i.food_id = f.id),
        '[]'
      ) AS images

    FROM food_items f
    WHERE f.restaurant_id = $1
    ORDER BY f.id DESC
  `, [restaurant_id]);

  return res.rows.map(f => {
  if (typeof f.images === "string") { try { f.images = JSON.parse(f.images); } catch {} }
  if (typeof f.prices === "string") { try { f.prices = JSON.parse(f.prices); } catch {} }
  if (typeof f.categories === "string") { try { f.categories = JSON.parse(f.categories); } catch {} }

    const main = (f.images && f.images.length) ? f.images[0] : null;

    return {
      id: f.id,
      name: f.name,
      description: f.description,
      type: f.type,
      is_available: f.is_available,

      prices: f.prices.map(p => ({
        type: p.type,
        mrp: Number(p.mrp),
        price: Number(p.price),
        prep_time: Number(p.prep_time)
      })),

      categories: f.categories,

      images: f.images.map(i => i.url.startsWith('/') ? i.url : '/' + i.url),

      main_image: main ? (main.url.startsWith("/") ? main.url : "/" + main.url) : null
    };
  });
};


// 🔥 DELETE FOOD
const deleteFood = async (food_id, restaurant_id) => {
  await pool.query(
    `DELETE FROM food_items WHERE id = $1 AND restaurant_id = $2`,
    [food_id, restaurant_id]
  );

  return { message: 'Deleted' };
};


// 🔥 TOGGLE AVAILABILITY
const toggleAvailability = async (food_id, restaurant_id, is_available) => {
  await pool.query(
    `UPDATE food_items 
     SET is_available = $1
     WHERE id = $2 AND restaurant_id = $3`,
    [is_available, food_id, restaurant_id]
  );

  return { message: 'Updated' };
};

module.exports = {
  addFood,
  getFoods,
  deleteFood,
  toggleAvailability
};

// 🔥 GET SINGLE FOOD (FOR EDIT)
const getFoodById = async (food_id, restaurant_id) => {

  const res = await pool.query(`
    SELECT 
      f.id,
      f.name,
      f.description,
      f.type,
      f.is_available,

      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'type', p.type,
            'mrp', p.mrp,
            'price', p.price,
            'prep_time', p.prep_time
          )
        ) FROM food_prices p WHERE p.food_id = f.id),
        '[]'
      ) AS prices,

      COALESCE(
        (SELECT json_agg(c.category)
         FROM food_categories c
         WHERE c.food_id = f.id),
        '[]'
      ) AS categories,

      COALESCE(
        (SELECT json_agg(
          json_build_object(
            'url', i.image_url,
            'is_main', i.is_main
          )
        ) FROM food_images i WHERE i.food_id = f.id),
        '[]'
      ) AS images

    FROM food_items f
    WHERE f.id = $1 AND f.restaurant_id = $2
  `, [food_id, restaurant_id]);

  if (!res.rows.length) {
    throw new Error('Food not found');
  }

  const f = res.rows[0];
    const main = (f.images && f.images.length) ? f.images[0] : null;

  return {
    id: f.id,
    name: f.name,
    description: f.description,
    type: f.type,
    is_available: f.is_available,

    prices: f.prices.map(p => ({
      ...p,
      mrp: Number(p.mrp),
      price: Number(p.price),
      prep_time: Number(p.prep_time)
    })),

    categories: f.categories,
    images: f.images.map(i => i.url.startsWith('/') ? i.url : '/' + i.url),
      main_image: main ? (main.url.startsWith("/") ? main.url : "/" + main.url) : null
  };
};

module.exports.getFoodById = getFoodById;

// 🔥 UPDATE FOOD (FULL REPLACE)
// 🔥 UPDATE FOOD (FULL REPLACE CLEAN)
const updateFood = async (data) => {
  const client = await pool.connect();

  const allowedCategories = ["breakfast","lunch","dinner","snacks","sweets","dessert","drinks"];

  try {
    const {
      food_id,
      restaurant_id,
      name,
      description,
      type,
      categories,
      prices
    } = data;

    if (!food_id) throw new Error("food_id required");
    if (!name) throw new Error("name required");

    if (!["veg","nonveg"].includes(type)) {
      throw new Error("invalid food type");
    }

    if (!Array.isArray(categories) || !categories.length) {
      throw new Error("categories required");
    }

    for (let cat of categories) {
      if (!allowedCategories.includes(cat)) {
        throw new Error("invalid category");
      }
    }

    if (!Array.isArray(prices) || !prices.length) {
      throw new Error("prices required");
    }

    for (let p of prices) {
      if (!["half","full"].includes(p.type)) {
        throw new Error("invalid price type");
      }

      if (p.prep_time === undefined || p.prep_time === null) {
        throw new Error("prep_time required");
      }

      if (Number(p.price) > Number(p.mrp)) {
        throw new Error("price cannot exceed MRP");
      }
    }

    await client.query("BEGIN");

    await client.query(
      `UPDATE food_items
       SET name = $1,
           description = $2,
           type = $3
       WHERE id = $4 AND restaurant_id = $5`,
      [name.toUpperCase().trim(), description || "", type, food_id, restaurant_id]
    );

    await client.query(`DELETE FROM food_categories WHERE food_id = $1`, [food_id]);

    for (let cat of categories) {
      await client.query(
        `INSERT INTO food_categories (food_id, category)
         VALUES ($1, $2)`,
        [food_id, cat]
      );
    }

    await client.query(`DELETE FROM food_prices WHERE food_id = $1`, [food_id]);

    for (let p of prices) {
      await client.query(
        `INSERT INTO food_prices (food_id, type, mrp, price, prep_time)
         VALUES ($1, $2, $3, $4, $5)`,
        [food_id, p.type, p.mrp, p.price, p.prep_time]
      );
    }

    await client.query("COMMIT");

    return { message: "Food updated" };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};




module.exports.updateFood = updateFood;
