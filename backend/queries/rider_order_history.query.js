const pool = require('../config/db');

const getHistory = async (rider_id) => {

  return pool.query(
    `
    SELECT
      o.id AS order_id,

      STRING_AGG(
        DISTINCT rp.restaurant_name,
        ', '
      ) AS restaurants,

      o.cod_amount,

      o.dispatch_status

    FROM orders o

    LEFT JOIN order_restaurants orr
      ON orr.order_id = o.id

    LEFT JOIN restaurant_profiles rp
      ON rp.user_id = orr.restaurant_id

    WHERE o.assigned_rider_id = $1
      AND o.dispatch_status IN (
        'delivered',
        'returned'
      )

    GROUP BY
      o.id,
      o.cod_amount,
      o.dispatch_status

    ORDER BY o.id DESC
    `,
    [rider_id]
  );

};

module.exports = {
  getHistory
};
