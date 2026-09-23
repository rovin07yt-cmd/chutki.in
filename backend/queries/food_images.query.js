const db = require('../config/db');

// ✅ GET COUNT
const getImageCount = async (food_id) => {
  const res = await db.query(
    'SELECT COUNT(*) FROM food_images WHERE food_id = $1',
    [food_id]
  );
  return Number(res.rows[0].count);
};

// ✅ DELETE OLDEST (by id)
const deleteOldestImage = async (food_id) => {
  await db.query(
    `
    DELETE FROM food_images
    WHERE id = (
      SELECT id FROM food_images
      WHERE food_id = $1
      ORDER BY id ASC
      LIMIT 1
    )
    `,
    [food_id]
  );
};

// ✅ INSERT
const insertOne = async (food_id, img, isMain = false) => {
  await db.query(
    'INSERT INTO food_images (food_id, image_url, is_main) VALUES ($1, $2, $3)',
    [food_id, img, isMain]
  );
};

module.exports = {
  getImageCount,
  deleteOldestImage,
  insertOne
};
