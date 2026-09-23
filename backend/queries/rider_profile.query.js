const pool = require('../config/db');

const getProfile = async (user_id) => {
  return pool.query(
    `SELECT
        u.id,
        u.name,
        u.dob,
        u.mobile,
        u.gmail,
          rp.driving_license,
          rp.image
     FROM users u
     JOIN rider_profiles rp
       ON rp.user_id = u.id
     WHERE u.id = $1`,
    [user_id]
  );
};

const updateProfile = async (
  user_id,
  name,
  dob,
  mobile
) => {
  return pool.query(
    `UPDATE users
     SET name = $1,
         dob = $2,
         mobile = $3
     WHERE id = $4`,
    [name, dob, mobile, user_id]
  );
};
const updatePassword = async (
  user_id,
  password
) => {
  return pool.query(
    `UPDATE users
     SET password = $1
     WHERE id = $2`,
    [password, user_id]
  );
};

const findMobileOwner = async (mobile) => {
  return pool.query(
    `SELECT id FROM users WHERE mobile = $1`,
    [mobile]
  );
};

const updateImage = async (
  user_id,
  image
) => {
  console.log("QUERY UPDATE IMAGE:", user_id, image);
  return pool.query(
    `UPDATE rider_profiles
     SET image = $1
     WHERE user_id = $2`,
    [image, user_id]
  );
};


module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  findMobileOwner,
  updateImage
};
