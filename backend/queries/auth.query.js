const pool = require('../config/db');

// Create user
const createUserTx = async (client, data) => {
  const query = `
    INSERT INTO users (name, dob, mobile, gmail, password, role, city)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const values = [
    data.name,          // ✅ restaurant_name (already mapped in service)
    data.dob,
    data.mobile,        // ✅ owner_mobile
    data.gmail,
    data.password,
    data.role,
    data.city
  ];
  return client.query(query, values);
};

// Find user
const findUser = async (identifier) => {
  const query = `
    SELECT * FROM users
    WHERE LOWER(TRIM(gmail)) = LOWER(TRIM($1)) OR mobile = TRIM($1);
  `;
  return pool.query(query, [identifier]);
};

// OTP
const saveOTP = async (gmail, otp, type, expires_at) => {
  return pool.query(
    `INSERT INTO otp_logs (gmail, otp, type, expires_at)
     VALUES ($1, $2, $3, $4);`,
    [gmail, otp, type, expires_at]
  );
};

const verifyOTP = async (gmail, otp, type) => {
  return pool.query(
    `SELECT * FROM otp_logs
     WHERE gmail=$1 AND otp=$2 AND type=$3
     AND is_verified=false AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1;`,
    [gmail, otp, type]
  );
};

const markOTPVerified = async (id) => {
  return pool.query(
    `UPDATE otp_logs SET is_verified=true WHERE id=$1`,
    [id]
  );
};

// Profiles
const getRestaurantProfile = async (user_id) => {
  return pool.query(
    `SELECT * FROM restaurant_profiles WHERE user_id = $1`,
    [user_id]
  );
};

const getRiderProfile = async (user_id) => {
  return pool.query(
    `SELECT is_online FROM riders WHERE user_id = $1`,
    [user_id]
  );
};

const getWorkProfile = async (user_id) => {
  return pool.query(
    `SELECT status FROM work_profiles WHERE user_id = $1`,
    [user_id]
  );
};

const markUserVerified = async (client, gmail) => {
  return client.query(
    `UPDATE users SET is_verified = true WHERE gmail = $1`,
    [gmail]
  );
};

// 🔥 CREATE RESTAURANT PROFILE
const createRestaurantProfile = async (client, data, user_id) => {
  return client.query(
    `INSERT INTO restaurant_profiles 
    (user_id, restaurant_name, owner_name, owner_mobile, restaurant_mobile, is_approved, is_online)
    VALUES ($1,$2,$3,$4,$5,false,false)`,
    [
      user_id,
      data.restaurant_name,   // ✅
      data.owner_name,        // ✅
      data.owner_mobile,      // ✅
      data.restaurant_mobile             // ✅ (restaurant_mobile OR same)
    ]
  );
};

// 🔥 CREATE RIDER PROFILE
const createRiderProfile = async (client, data, user_id) => {
  await client.query(
    `INSERT INTO rider_profiles (user_id, driving_license)
     VALUES ($1,$2)`,
    [user_id, data.driving_license]
  );

  await client.query(
    `INSERT INTO riders (user_id, is_online)
     VALUES ($1,false)`,
    [user_id]
  );
};

// 🔥 CREATE WORK PROFILE
const createWorkProfile = async (client, user_id) => {
  return client.query(
    `INSERT INTO work_profiles (user_id, status)
     VALUES ($1,'pending')`,
    [user_id]
  );
};

module.exports = {
  createRestaurantProfile,
  createRiderProfile,
  createWorkProfile,
  createUserTx,
  findUser,
  saveOTP,
  verifyOTP,
  markOTPVerified,
  getRestaurantProfile,
  getRiderProfile,
  getWorkProfile,
  markUserVerified
};
// 🔥 GET USER BY ID
const findUserById = async (id) => {
  return pool.query(
    `SELECT * FROM users WHERE id = $1`,
    [id]
  );
};

module.exports.findUserById = findUserById;

