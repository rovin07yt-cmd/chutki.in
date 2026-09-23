const pool = require('../config/db');

// Insert or update resume
const uploadResume = async (user_id, resume_url) => {
  const res = await pool.query(
    `INSERT INTO resumes (user_id, resume_url)
     VALUES ($1, $2)
     ON CONFLICT (user_id)
     DO UPDATE SET resume_url = EXCLUDED.resume_url
     RETURNING *`,
    [user_id, resume_url]
  );

  return res.rows[0];
};

module.exports = {
  uploadResume
};
