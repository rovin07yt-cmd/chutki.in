const pool = require('../../config/db');

const getRestaurantOrders = async (
  restaurant_id,
  filter,
  date
) => {

  let whereClause = `
    WHERE r.restaurant_id = $1
  `;

  if (filter === 'active') {
    whereClause += `
      AND o.status NOT IN ('delivered','cancelled','returned')
    `;
  }

  if (filter === 'today') {
    whereClause += `
      AND DATE(o.created_at) = CURRENT_DATE
    `;
  }

  if (filter === 'week') {
    whereClause += `
      AND o.created_at >= NOW() - INTERVAL '7 days'
    `;
  }

  if (filter === 'month') {
    whereClause += `
      AND o.created_at >= NOW() - INTERVAL '30 days'
    `;
  }

  if (date) {
    whereClause += `
      AND DATE(o.created_at) = $2
    `;
  }

  return pool.query(
    `
    SELECT
      o.id AS order_id,
      o.status,
      o.dispatch_status,
      o.final_total,
      o.created_at,
      u.name AS rider_name
    FROM order_restaurants r
    JOIN orders o
      ON o.id = r.order_id
    LEFT JOIN users u
      ON u.id = o.assigned_rider_id
    ${whereClause}
    ORDER BY o.created_at DESC
    `,
    date
      ? [restaurant_id, date]
      : [restaurant_id]
  );
};

module.exports = {
  getRestaurantOrders
};
