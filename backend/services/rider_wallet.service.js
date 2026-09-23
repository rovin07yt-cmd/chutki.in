const pool = require('../config/db');


const getSummary = async (user_id) => {

  const riderRes = await pool.query(
    `SELECT id,cod_collected,cod_submitted
     FROM riders
     WHERE user_id = $1`,
    [user_id]
  );

  if (riderRes.rows.length === 0) {
    throw new Error("Rider not found");
  }

  const rider = riderRes.rows[0];

  const todayRes = await pool.query(
    `SELECT COALESCE(SUM(e.rider_earning),0) AS today_earning
     FROM earnings e
     JOIN orders o ON o.id = e.order_id
     JOIN riders r ON r.id = o.assigned_rider_id
     WHERE r.user_id = $1
       AND DATE(o.delivered_at) = CURRENT_DATE`,
    [user_id]
  );

  return {
    pending_salary: Number(todayRes.rows[0].today_earning || 0),
    today_earning: Number(todayRes.rows[0].today_earning || 0),
    cod_pending: Number(rider.cod_collected) - Number(rider.cod_submitted)
  };
};

const getBankDetails = async (user_id) => {

  const res = await pool.query(
    `SELECT
       holder_name,
       account_no,
       ifsc,
       upi_id
     FROM bank_details
     WHERE user_id = $1`,
    [user_id]
  );

  return res.rows[0] || null;
};

const saveBankDetails = async (user_id, body) => {

  const {
    holder_name,
    account_no,
    ifsc,
    upi_id
  } = body;

  await pool.query(
    `INSERT INTO bank_details
      (user_id, holder_name, account_no, ifsc, upi_id)
     VALUES
      ($1,$2,$3,$4,$5)
     ON CONFLICT (user_id)
     DO UPDATE SET
       holder_name = EXCLUDED.holder_name,
       account_no  = EXCLUDED.account_no,
       ifsc        = EXCLUDED.ifsc,
       upi_id      = EXCLUDED.upi_id`,
    [user_id, holder_name, account_no, ifsc, upi_id]
  );

  return { message: "Bank details saved" };
};

const getEarnings = async (user_id) => {

  const res = await pool.query(
    `SELECT
       o.id AS order_id,
       e.rider_earning,
       o.delivered_at

     FROM earnings e

     JOIN orders o
       ON o.id = e.order_id

     JOIN riders r
       ON r.id = o.assigned_rider_id

     WHERE r.user_id = $1

     ORDER BY o.delivered_at DESC`,
    [user_id]
  );

  return res.rows;
};

module.exports = {
  getSummary,
  getBankDetails,
  saveBankDetails,
  getEarnings
};
