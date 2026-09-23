const bcrypt = require('bcrypt');

const query = require('../queries/rider_profile.query');
const authQuery = require('../queries/auth.query');

const getProfile = async (user_id) => {

  const res = await query.getProfile(user_id);

  if (!res.rows.length) {
    throw new Error('Rider not found');
  }

  return res.rows[0];
};

const updateProfile = async (
  user_id,
  data
) => {

  const {
    name,

    dob,
    mobile
  } = data;

  const mobileRes = await query.findMobileOwner(mobile);

  if (mobileRes.rows.length && mobileRes.rows[0].id !== user_id) {
    throw new Error("Mobile number already in use");
  }

  await query.updateProfile(
    user_id,
    name,
    dob,
    mobile
  );

  return {
    message: 'Profile updated'
  };
};

const changePassword = async (
  user_id,
  old_password,
  new_password
) => {

  const userRes =
    await authQuery.findUserById(user_id);

  if (!userRes.rows.length) {
    throw new Error('Rider not found');
  }

  const user = userRes.rows[0];

  const valid =
    await bcrypt.compare(
      old_password,
      user.password
    );

  if (!valid) {
    throw new Error(
      'Old password incorrect'
    );
  }

  const hashed =
    await bcrypt.hash(
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


const uploadImage = async (
  user_id,
  image
) => {

  console.log("UPDATE IMAGE USER:", user_id);
  console.log("UPDATE IMAGE PATH:", image);

  await query.updateImage(
    user_id,
    image
  );

  return {
    image
  };
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  uploadImage
};
