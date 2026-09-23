const query = require('../../queries/admin/request.query');

const getPendingRiders = async () => {
  const result = await query.getPendingRiders();

  return result.rows.map(rider => ({
    ...rider,
    age: rider.dob
      ? Math.floor(
          (Date.now() - new Date(rider.dob)) /
          (365.25 * 24 * 60 * 60 * 1000)
        )
      : null
  }));
};

const approveRider = async (user_id) => {
  const result = await query.approveRider(user_id);

  if (!result.rows.length) {
    throw new Error("Rider not found");
  }

  return {
    user_id,
    approved: true
  };
};

module.exports = {
  getPendingRiders,
  approveRider
};
