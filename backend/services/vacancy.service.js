const pool = require('../config/db');

const createVacancy = async (poster_url) => {
  const res = await pool.query(
    `INSERT INTO vacancies (poster_url)
     VALUES ($1)
     RETURNING *`,
    [poster_url]
  );

  return res.rows[0];
};

module.exports = {
  createVacancy
};
