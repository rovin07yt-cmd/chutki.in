const pool = require('../../config/db');

const getDashboardStats = async () => {
  return pool.query(`
    SELECT
      (SELECT COUNT(*)
       FROM orders
       WHERE status NOT IN ('delivered','cancelled','returned')
      ) AS active_orders,

      (SELECT COUNT(*)
       FROM riders
       WHERE is_online = true
      ) AS online_riders,

      (SELECT COUNT(*)
       FROM restaurant_profiles
       WHERE is_online = true
      ) AS online_restaurants,

      (SELECT COUNT(*)
       FROM users
       WHERE role IN ('user','workwithus')
      ) AS users,

      (SELECT COUNT(*)
       FROM riders
      ) AS riders,

      (SELECT COUNT(*)
       FROM restaurant_profiles
       WHERE is_approved = false
      ) AS pending_restaurant_requests,

      (SELECT COUNT(*)
       FROM work_profiles
       WHERE status = 'pending'
      ) AS pending_work_requests
  `);
};

module.exports = {
  getDashboardStats
};
