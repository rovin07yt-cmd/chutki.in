const pool = require('../config/db');
const historyQuery =
  require('../queries/rider_order_history.query');

const getHistory = async (user_id) => {

  const riderRes = await pool.query(
    `
    SELECT id
    FROM riders
    WHERE user_id = $1
    `,
    [user_id]
  );

  if (!riderRes.rows.length) {
    throw new Error('Rider not found');
  }

  const rider_id =
    riderRes.rows[0].id;

  const res =
    await historyQuery.getHistory(
      rider_id
    );

  return res.rows.map(
    (row, index) => ({
      serial_no: index + 1,
      order_id: row.order_id,
      restaurants: row.restaurants,
      cod_collected:
        Number(row.cod_amount || 0),
      status:
        row.dispatch_status === 'delivered'
          ? 'Delivered'
          : 'Returned'
    })
  );

};

module.exports = {
  getHistory
};
