const pool = require('../../config/db');

const getOrders = async () => {
  return pool.query(
    `
    SELECT
      o.id,
      o.status,
      o.dispatch_status,
      o.final_total,
      o.created_at,
      u.name AS customer_name,
      u.mobile AS customer_mobile,
      ru.name AS rider_name
    FROM orders o
    JOIN users u
      ON u.id = o.user_id
    LEFT JOIN riders r
      ON r.id = o.assigned_rider_id
    LEFT JOIN users ru
      ON ru.id = r.user_id
    ORDER BY o.created_at DESC
    `
  );
};

const getOrderDetails = async (order_id) => {
  return pool.query(
    `
    SELECT
      o.*,
      u.name AS customer_name,
      u.mobile AS customer_mobile,
      u.gmail AS customer_gmail,

      ru.name AS rider_name,
      ru.mobile AS rider_mobile,

      COALESCE(
        (
          SELECT json_agg(
            json_build_object(
              'restaurant_id', restaurant_data.restaurant_id,
              'name', restaurant_data.restaurant_name,
              'mobile', restaurant_data.restaurant_mobile,
              'status', restaurant_data.restaurant_status,
              'items', restaurant_data.items
            )
            ORDER BY restaurant_data.restaurant_name
          )
          FROM (
            SELECT
              orr.restaurant_id,
              restaurant_user.name AS restaurant_name,
              restaurant_user.mobile AS restaurant_mobile,
              orr.status AS restaurant_status,

              COALESCE(
                json_agg(
                  json_build_object(
                    'food_id', oi.food_id,
                    'name', fi.name,
                    'quantity', oi.quantity,
                    'price', oi.price,
                    'mrp', oi.mrp,
                    'prep_time', oi.prep_time
                  )
                  ORDER BY fi.name
                ) FILTER (WHERE oi.food_id IS NOT NULL),
                '[]'::json
              ) AS items

            FROM order_restaurants orr

            JOIN users restaurant_user
              ON restaurant_user.id = orr.restaurant_id

            LEFT JOIN order_items oi
              ON oi.order_id = orr.order_id
             AND oi.restaurant_id = orr.restaurant_id

            LEFT JOIN food_items fi
              ON fi.id = oi.food_id

            WHERE orr.order_id = $1

            GROUP BY
              orr.restaurant_id,
              restaurant_user.name,
              restaurant_user.mobile,
              orr.status
          ) restaurant_data
        ),
        '[]'::json
      ) AS restaurants

    FROM orders o

    JOIN users u
      ON u.id = o.user_id

    LEFT JOIN riders r
      ON r.id = o.assigned_rider_id

    LEFT JOIN users ru
      ON ru.id = r.user_id

    WHERE o.id = $1
    `,
    [order_id]
  );
};

const getAvailableRiders = async () => {
  return pool.query(
    `
    SELECT
      r.id,
      r.user_id,
      u.name,
      u.mobile,
      r.active_items
    FROM riders r
    JOIN users u
      ON u.id = r.user_id
    WHERE r.is_online = true
      AND u.is_blocked = false
    ORDER BY u.name
    `
  );
};

const assignRider = async (order_id, rider_id) => {
  return pool.query(
    `
    UPDATE orders
    SET
      assigned_rider_id = $1,
      dispatch_status = 'assigned',
      assigned_at = NOW()
    WHERE id = $2
      AND dispatch_status IN ('waiting','assigned')
      AND status NOT IN ('cancelled','cancelled_returned','delivered','returned')
    RETURNING id, assigned_rider_id
    `,
    [rider_id, order_id]
  );
};

const cancelOrder = async (order_id) => {
  return pool.query(
    `
    UPDATE orders
    SET status = 'cancelled'
    WHERE id = $1
      AND status NOT IN ('delivered', 'cancelled', 'cancelled_returned', 'returned')
    RETURNING id, status, dispatch_status
    `,
    [order_id]
  );
};

const deleteOrder = async (order_id) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const check = await client.query(
      `
      SELECT id, status
      FROM orders
      WHERE id = $1
      FOR UPDATE
      `,
      [order_id]
    );

    if (!check.rows.length) {
      await client.query('ROLLBACK');
      throw new Error('Order not found');
    }

    await client.query(
      `DELETE FROM pickup_sequence WHERE order_id = $1`,
      [order_id]
    );

    await client.query(
      `DELETE FROM rider_assignments WHERE order_id = $1`,
      [order_id]
    );

    await client.query(
      `DELETE FROM earnings WHERE order_id = $1`,
      [order_id]
    );

    await client.query(
      `DELETE FROM order_items WHERE order_id = $1`,
      [order_id]
    );

    await client.query(
      `DELETE FROM order_restaurants WHERE order_id = $1`,
      [order_id]
    );

    const deleted = await client.query(
      `
      DELETE FROM orders
      WHERE id = $1
      RETURNING id
      `,
      [order_id]
    );

    await client.query('COMMIT');

    return {
      order_id: deleted.rows[0].id,
      deleted: true
    };

  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (_) {}

    throw err;
  } finally {
    client.release();
  }
};

module.exports = {
  getOrders,
  getOrderDetails,
  getAvailableRiders,
  assignRider,
  cancelOrder,
  deleteOrder
};
