const pool = require('../config/db');

const createAd = async (image_url) => {
  const res = await pool.query(
    `INSERT INTO advertisements (image_url)
     VALUES ($1)
     RETURNING *`,
    [image_url]
  );

  return res.rows[0];
};

module.exports = {
  createAd
};
