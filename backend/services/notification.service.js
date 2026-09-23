const pool = require('../config/db');
const notificationQuery = require("../queries/notification.query");


const notify = async ({ user_id, type, message }) => {
  return pool.query(
    `INSERT INTO notifications (user_id, type, message)
     VALUES ($1, $2, $3)`,
    [user_id, type, message]
  );
};

module.exports = {
  notify
};

const listNotifications = async (user_id) => {
  const res =
    await notificationQuery.getNotifications(user_id);

  return res.rows;
};

const getUnreadCount = async (user_id) => {
  const res =
    await notificationQuery.getUnreadCount(user_id);

  return {
    unread_count: res.rows[0].count
  };
};

const markRead = async (user_id) => {
  await notificationQuery.markAllRead(user_id);

  return {
    message: "Notifications marked read"
  };
};

module.exports.listNotifications =
  listNotifications;

module.exports.getUnreadCount =
  getUnreadCount;

module.exports.markRead =
  markRead;

const listUnreadNotifications = async (user_id) => {
  const res =
    await notificationQuery.getUnreadNotifications(user_id);

  return res.rows;
};

const markOneRead = async (id, user_id) => {
  await notificationQuery.markOneRead(
    id,
    user_id
  );

  return {
    message: "Notification marked read"
  };
};

module.exports.listUnreadNotifications =
  listUnreadNotifications;

module.exports.markOneRead =
  markOneRead;

