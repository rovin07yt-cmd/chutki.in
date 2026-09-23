const authQuery = require('../queries/auth.query');
const pool = require('../config/db');
const bcrypt = require('bcrypt');

// ✅ GET PROFILE
const getProfile = async (user_id) => {
  const userRes = await authQuery.findUserById(user_id);
  const profileRes = await authQuery.getRestaurantProfile(user_id);

  const user = userRes.rows[0];
  delete user.password;

  return {
    user,
    profile: profileRes.rows[0]
  };
};


// ✅ UPDATE PROFILE
const updateProfile = async (user_id, data) => {
  const { name, mobile, restaurant_name, owner_mobile, gmail, password } = data;

  const userRes = await authQuery.findUserById(user_id);
  const currentUser = userRes.rows[0];

  // 🔐 CHECK GMAIL CHANGE
  if (gmail && gmail !== currentUser.gmail) {
    if (!password) throw new Error("Password required to change gmail");

    const valid = await bcrypt.compare(password, currentUser.password);
    if (!valid) throw new Error("Incorrect password");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // ✅ UPDATE USERS
    await client.query(
      `UPDATE users SET name=$1, mobile=$2, gmail=$3 WHERE id=$4`,
      [name, mobile, gmail || currentUser.gmail, user_id]
    );

    // ✅ UPDATE RESTAURANT PROFILE
    await client.query(
      `UPDATE restaurant_profiles
       SET restaurant_name=$1, owner_mobile=$2
       WHERE user_id=$3`,
      [restaurant_name, owner_mobile, user_id]
    );

    await client.query("COMMIT");

    return { message: 'Profile updated' };

  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};


// ✅ CHANGE PASSWORD
const changePassword = async (user_id, old_password, new_password) => {

  const res = await authQuery.findUserById(user_id);
  const user = res.rows[0];

  const match = await bcrypt.compare(old_password, user.password);

  if (!match) {
    throw new Error('Old password incorrect');
  }

  const hashed = await bcrypt.hash(new_password, 10);

  await pool.query(
    `UPDATE users SET password=$1 WHERE id=$2`,
    [hashed, user_id]
  );

  return { message: 'Password updated' };
};


module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
