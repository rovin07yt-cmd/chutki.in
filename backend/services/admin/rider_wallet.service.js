const query = require('../../queries/admin/rider_wallet.query');
const riderQuery = require("../../queries/admin/riders.query");

const getRiderWallet = async (user_id) => {
  const riderResult = await query.getWalletSummary(user_id);

  if (!riderResult.rows.length) {
    throw new Error("Rider not found");
  }

  const bankResult = await query.getBankDetails(user_id);
  const walletResult = riderResult;
  const earningsResult = await query.getEarningsSummary(user_id);
  const paidResult = await query.getPaidSalary(user_id);
  const transactionsResult = await query.getTransactions(user_id);

  return {
    bank: bankResult.rows[0] || {},
    wallet: walletResult.rows[0] || {},
    earnings: {
      ...earningsResult.rows[0],
      paid_salary: Number(
        paidResult.rows[0]?.paid_salary || 0
      ),
      pending_salary:
        Number(
          earningsResult.rows[0]?.total_earned || 0
        ) -
        Number(
          paidResult.rows[0]?.paid_salary || 0
        )
    },
    transactions: transactionsResult.rows
  };
};

const getRidersWallet = async () => {
  const result = await riderQuery.getRiders();

  return Promise.all(
    result.rows.map(async (rider) => {
      const earningsResult =
        await query.getEarningsSummary(
          rider.user_id
        );

      const paidResult =
        await query.getPaidSalary(
          rider.user_id
        );

      const pendingSalary =
        Number(
          earningsResult.rows[0]?.total_earned || 0
        ) -
        Number(
          paidResult.rows[0]?.paid_salary || 0
        );

      return {
        user_id: rider.user_id,
        name: rider.name,
        image: rider.image,
        mobile: rider.mobile,
        pending_cod:
          Number(rider.cod_collected || 0) -
          Number(rider.cod_submitted || 0),
        pending_salary: pendingSalary
      };
    })
  );
};

const paySalary = async (
  user_id,
  amount,
  method
) => {
  const paymentMethod =
    String(method || '').trim().toLowerCase();

  if (!['bank', 'upi', 'cash'].includes(paymentMethod)) {
    throw new Error(
      'Invalid payment method. Allowed methods: bank, upi, cash'
    );
  }

  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Invalid amount");
  }

  const riderResult =
    await query.getWalletSummary(user_id);

  if (!riderResult.rows.length) {
    throw new Error("Rider not found");
  }

  const earningsResult =
    await query.getEarningsSummary(user_id);

  const paidResult =
    await query.getPaidSalary(user_id);

  const pendingSalary =
    Number(
      earningsResult.rows[0]?.total_earned || 0
    ) -
    Number(
      paidResult.rows[0]?.paid_salary || 0
    );

  if (numericAmount > pendingSalary) {
    throw new Error("Amount exceeds pending salary");
  }

  const payout =
    await query.createSalaryPayout(
      user_id,
      numericAmount,
      paymentMethod
    );

  return payout.rows[0];
};

const submitCod = async (
  user_id,
  amount
) => {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    throw new Error("Invalid amount");
  }

  const walletResult =
    await query.getWalletSummary(user_id);

  if (!walletResult.rows.length) {
    throw new Error("Rider not found");
  }

  const pendingCod =
    Number(
      walletResult.rows[0]?.pending_cod || 0
    );

  if (numericAmount > pendingCod) {
    throw new Error("Amount exceeds pending COD");
  }

  const result =
    await query.submitCod(
      user_id,
      numericAmount
    );

  if (!result?.rider) {
    throw new Error("Rider not found");
  }

  return result.rider;
};

module.exports = {
  getRidersWallet,
  getRiderWallet,
  paySalary,
  submitCod
};
