const bcrypt = require('bcrypt');
const query = require('../queries/user_profile.query');
const authQuery = require('../queries/auth.query');

const getProfile = async (user_id) => {
  const res = await query.getUserById(user_id);

  if (!res.rows.length) {
    throw new Error('User not found');
  }

  return res.rows[0];
};

const updateProfile = async (user_id, data) => {
  const { name, mobile } = data;

  await query.updateProfile(
    user_id,
    name,
    mobile
  );

  return { message: 'Profile updated' };
};

const changePassword = async (
  user_id,
  old_password,
  new_password
) => {

  const userRes = await authQuery.findUserById(user_id);

  if (!userRes.rows.length) {
    throw new Error('User not found');
  }

  const user = userRes.rows[0];

  const valid = await bcrypt.compare(
    old_password,
    user.password
  );

  if (!valid) {
    throw new Error('Old password incorrect');
  }

  const hashed = await bcrypt.hash(
    new_password,
    10
  );

  await query.updatePassword(
    user_id,
    hashed
  );

  return {
    message: 'Password updated'
  };
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
