const bcrypt = require('bcrypt');

const query = require('../../queries/admin/profile.query');

const getAdminProfile = async () => {
  const result = await query.getAdminProfile();

  if (!result.rows.length) {
    throw new Error('Admin not found');
  }

  return result.rows[0];
};

const updateAdminProfile = async (data) => {
  const result = await query.updateAdminProfile(
    data.name,
    data.mobile,
    data.gmail
  );

  return result.rows[0];
};

const updateAdminPassword = async (data) => {

  const hashed = await bcrypt.hash(
    data.password,
    10
  );

  await query.updateAdminPassword(
    hashed
  );

  return {
    updated: true
  };
};

module.exports = {
  getAdminProfile,
  updateAdminProfile,
  updateAdminPassword
};
