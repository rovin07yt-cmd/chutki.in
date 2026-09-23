const query = require('../../queries/admin/users.query');

const getUsers = async () => {
  const result = await query.getUsers();

  return result.rows.map(user => ({
    ...user,
    status:
      user.last_seen &&
      (Date.now() - new Date(user.last_seen).getTime()) < 300000
        ? 'online'
        : 'offline'
  }));
};

const blockUser = async (user_id) => {
  const result = await query.blockUser(user_id);

  if (!result.rows.length) {
    throw new Error('User not found');
  }

  return {
    user_id,
    blocked: true
  };
};

const unblockUser = async (user_id) => {
  const result = await query.unblockUser(user_id);

  if (!result.rows.length) {
    throw new Error('User not found');
  }

  return {
    user_id,
    blocked: false
  };
};

const deleteUser = async (user_id) => {
  const result = await query.deleteUser(user_id);

  if (!result.rows.length) {
    throw new Error('User not found');
  }

  return {
    user_id,
    deleted: true
  };
};

module.exports = {
  getUsers,
  blockUser,
  unblockUser,
  deleteUser
};
