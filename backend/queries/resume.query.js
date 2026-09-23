const pool = require('../config/db');

const insertResume = async (user_id, resume_url) => {
  return pool.query(
    `INSERT INTO resumes (user_id, resume_url)
     VALUES ($1, $2)
     RETURNING *`,
    [user_id, resume_url]
  );
};

module.exports = {
  insertResume
};
