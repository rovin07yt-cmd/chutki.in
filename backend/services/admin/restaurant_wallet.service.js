const query = require('../../queries/admin/restaurant_wallet.query');

const getRestaurantsWallet = async () => {
  const result = await query.getRestaurantsWallet();

  return result.rows;
};

const getRestaurantWalletDetails = async (user_id) => {
  const profileResult =
    await query.getRestaurantProfile(user_id);

  if (!profileResult.rows.length) {
    throw new Error('Restaurant not found');
  }

  const bankResult =
    await query.getBankDetails(user_id);

  const earningsResult =
    await query.getRestaurantEarnings(user_id);

  const transactionsResult =
    await query.getTransactions(user_id);

  const paidResult =
    await query.getPaidEarnings(user_id);

  const yesterdayResult =
    await query.getYesterdayEarnings(user_id);

  const totalEarnings =
    Number(
      earningsResult.rows[0]?.total_earnings || 0
    );

  const paidEarnings =
    Number(
      paidResult.rows[0]?.paid_earnings || 0
    );

  return {
    profile: profileResult.rows[0],
    bank_details: bankResult.rows[0] || {},
    earnings: {
      total_earnings: totalEarnings,
      paid_earnings: paidEarnings,
      pending_earnings:
        totalEarnings - paidEarnings,
      yesterday_earnings:
        Number(
          yesterdayResult.rows[0]
            ?.yesterday_earnings || 0
        )
    },
    transactions: transactionsResult.rows
  };
};

const payRestaurant = async (
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

  if (Number(amount) <= 0) {
    throw new Error("Invalid amount");
  }

  const profileResult =
    await query.getRestaurantProfile(user_id);

  if (!profileResult.rows.length) {
    throw new Error("Restaurant not found");
  }

  const earningsResult =
    await query.getRestaurantEarnings(user_id);

  const paidResult =
    await query.getPaidEarnings(user_id);

  const pendingEarnings =
    Number(
      earningsResult.rows[0]?.total_earnings || 0
    ) -
    Number(
      paidResult.rows[0]?.paid_earnings || 0
    );

  if (Number(amount) > pendingEarnings) {
    throw new Error("Amount exceeds pending earnings");
  }

  const payout =
    await query.createPayout(
      user_id,
      amount,
      paymentMethod
    );

  return payout.rows[0];
};

module.exports = {
  getRestaurantsWallet,
  getRestaurantWalletDetails,
  payRestaurant
};
