const pool = require('../../config/db');

const getBankDetails = async (user_id) => {
  return pool.query(
    `SELECT *
     FROM bank_details
     WHERE user_id = $1`,
    [user_id]
  );
};

const getWalletSummary = async (user_id) => {
  return pool.query(
    `SELECT
       cod_collected,
       cod_submitted,
       (cod_collected - cod_submitted) AS pending_cod
     FROM riders
     WHERE user_id = $1`,
    [user_id]
  );
};

const getEarningsSummary = async (user_id) => {
  return pool.query(
    `SELECT
       COALESCE(SUM(e.rider_earning),0) AS total_earned,
       COALESCE(SUM(
         CASE
           WHEN DATE(o.created_at)=CURRENT_DATE
           THEN e.rider_earning
           ELSE 0
         END
       ),0) AS today_earned,
       COALESCE(SUM(
         CASE
           WHEN o.created_at >= NOW() - INTERVAL '30 days'
           THEN e.rider_earning
           ELSE 0
         END
       ),0) AS month_earned
     FROM earnings e
     JOIN orders o
       ON o.id = e.order_id
     WHERE o.assigned_rider_id = (
       SELECT id
       FROM riders
       WHERE user_id = $1
     )`,
    [user_id]
  );
};

const getTransactions = async (user_id) => {
  return pool.query(
    `SELECT
       id,
       user_id,
       amount,
       type,
       method,
       created_at,
       reference_id
     FROM transactions
     WHERE user_id = $1
     ORDER BY created_at DESC, id DESC`,
    [user_id]
  );
};

const getPaidSalary = async (user_id) => {
  return pool.query(
    `SELECT
       COALESCE(SUM(amount),0) AS paid_salary
     FROM transactions
     WHERE user_id = $1
       AND type = 'debit'`,
    [user_id]
  );
};

const createSalaryPayout = async (user_id, amount, method) => {
  return pool.query(
    `
    INSERT INTO transactions
    (
      user_id,
      amount,
      type,
      method,
      reference_id
    )
    VALUES
    (
      $1,
      $2,
      'debit',
      $3,
      $1
    )
    RETURNING *
    `,
    [user_id, amount, method]
  );
};

const submitCod = async (user_id, amount) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const riderResult = await client.query(
      `
      UPDATE riders
      SET cod_submitted = cod_submitted + $2
      WHERE user_id = $1
      RETURNING
        cod_collected,
        cod_submitted,
        (cod_collected - cod_submitted) AS pending_cod
      `,
      [user_id, amount]
    );

    if (!riderResult.rows.length) {
      throw new Error("Rider not found");
    }

    /*
     * Existing transactions schema only permits:
     * credit / debit
     *
     * COD submitted by rider = money received by admin,
     * therefore record it as CREDIT.
     */
    const transactionResult = await client.query(
      `
      INSERT INTO transactions
      (
        user_id,
        amount,
        type,
        method,
        reference_id
      )
      VALUES
      (
        $1,
        $2,
        'credit',
        NULL,
        $1
      )
      RETURNING *
      `,
      [user_id, amount]
    );

    await client.query("COMMIT");

    return {
      rider: riderResult.rows[0],
      transaction: transactionResult.rows[0]
    };

  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

module.exports = {
  getBankDetails,
  getWalletSummary,
  getEarningsSummary,
  createSalaryPayout,
  getPaidSalary,
  submitCod,
  getTransactions
};
