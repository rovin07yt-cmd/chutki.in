const pool = require('../config/db');

const getNotifications = async (user_id) => {
  return pool.query(
    `SELECT
       id,
       type,
       message,
       is_read,
       created_at
     FROM notifications
     WHERE user_id = $1
     ORDER BY id DESC`,
    [user_id]
  );
};

const getUnreadCount = async (user_id) => {
  return pool.query(
    `SELECT COUNT(*)::int AS count
     FROM notifications
     WHERE user_id = $1
       AND is_read = false`,
    [user_id]
  );
};

const markAllRead = async (user_id) => {
  return pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE user_id = $1
       AND is_read = false`,
    [user_id]
  );
};


const getUnreadNotifications = async (user_id) => {
  return pool.query(
    `SELECT
       id,
       type,
       message,
       is_read,
       created_at
     FROM notifications
     WHERE user_id = $1
       AND is_read = false
     ORDER BY id DESC`,
    [user_id]
  );
};

const markOneRead = async (id, user_id) => {
  return pool.query(
    `UPDATE notifications
     SET is_read = true
     WHERE id = $1
       AND user_id = $2`,
    [id, user_id]
  );
};

module.exports = {
  getNotifications,
  getUnreadNotifications,
  getUnreadCount,
  markAllRead,
  markOneRead
};
