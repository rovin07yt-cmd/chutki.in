const { validateRegister } = require('../utils/validator');
const authQuery = require('../queries/auth.query');
const pool = require('../config/db');
const bcrypt = require('bcrypt');

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// REGISTER (SEND OTP)
const registerUser = async (data) => {
  validateRegister(data);
const areaService = require('./area.service');  if (data.lat && data.lng) {    const allowed = await areaService.isServiceable(data.lat, data.lng);  }
  data.gmail = data.gmail.toLowerCase();

  const existing = await authQuery.findUser(data.gmail);
  if (existing.rows.length > 0) {
    throw new Error('User already exists');
  }

  const otp = generateOTP();
  const expires_at = new Date(Date.now() + 5 * 60 * 1000);

  await authQuery.saveOTP(data.gmail, otp, 'registration', expires_at);

  return { message: 'OTP sent', otp };
};

// VERIFY + CREATE USER
const verifyAndCreateUser = async (data) => {
  const otpResult = await authQuery.verifyOTP(
    data.gmail,
    data.otp,
    'registration'
  );

  if (otpResult.rows.length === 0) {
    throw new Error('Invalid or expired OTP');
}

  // 🔥 VALIDATE AGAIN
  validateRegister(data);
const areaService = require('./area.service');  if (data.lat && data.lng) {    const allowed = await areaService.isServiceable(data.lat, data.lng);  }
  data.gmail = data.gmail.toLowerCase();

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await authQuery.markOTPVerified(otpResult.rows[0].id);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    data.password = hashedPassword;

    if (data.role === 'restaurant') {
      data.name = data.restaurant_name;
      data.mobile = data.owner_mobile;
    }

    const userResult = await authQuery.createUserTx(client, data);
    let user = userResult.rows[0];
    if (data.role !== 'rider') {
      await authQuery.markUserVerified(client, data.gmail);
    }

    if (data.role === 'restaurant') {
      await authQuery.createRestaurantProfile(client, data, user.id);
    }

    if (data.role === 'rider') {
      await authQuery.createRiderProfile(client, data, user.id);
    }

    if (data.role === 'workwithus') {
      await authQuery.createWorkProfile(client, user.id);
    }

    await client.query('COMMIT');

    // 🔥 FETCH UPDATED USER
    const userRes = await authQuery.findUser(data.gmail);
    user = userRes.rows[0];


    delete user.password;
    return user;

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// LOGIN
const loginUser = async (identifier, password, role) => {
  identifier = (identifier || "").toString().trim().toLowerCase();
  console.log("LOGIN IDENTIFIER =>", identifier); const result = await authQuery.findUser(identifier);

  if (result.rows.length === 0) {
    throw new Error('User not found');
  }

  const user = result.rows[0];

  if (user.role !== role) {
    throw new Error('Invalid role selected');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Invalid password');
  }

  let profile = null;

  if (user.role === 'restaurant') {
    const res = await authQuery.getRestaurantProfile(user.id);
    profile = res.rows[0];
  }

  if (user.role === 'rider') {
    const res = await authQuery.getRiderProfile(user.id);
    profile = res.rows[0];
  }

  if (user.role === 'workwithus') {
    const res = await authQuery.getWorkProfile(user.id);
    profile = res.rows[0];
  }

  // ✅ ACCESS CONTROL
  let access = true;

  if (user.role === 'restaurant') {
    access = profile?.is_approved || false;
  }

  if (user.role === 'workwithus') {
    access = profile?.status === 'approved';
  }

  delete user.password;

  return {
    user,
    profile,
    access
  };
};

module.exports = {
  registerUser,
  verifyAndCreateUser,
  loginUser
};
