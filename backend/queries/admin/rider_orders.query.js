const pool = require('../../config/db');

const getRiderOrders = async (user_id, filter, date) => {
  let whereClause = `
    WHERE o.assigned_rider_id = (
      SELECT id
      FROM riders
      WHERE user_id = $1
    )
  `;

  if (filter === 'active') {
    whereClause += `
      AND o.status NOT IN ('delivered','cancelled','returned')
      AND o.dispatch_status <> 'returned'
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
      u.name AS customer_name
    FROM orders o
    JOIN users u
      ON u.id = o.user_id
    ${whereClause}
    ORDER BY o.created_at DESC
    `,
    date
      ? [user_id, date]
      : [user_id]
  );
};

module.exports = {
  getRiderOrders
};
