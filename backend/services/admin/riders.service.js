const query = require('../../queries/admin/riders.query');

const getRiders = async () => {
  const result = await query.getRiders();
  return result.rows;
};

const blockRider = async (user_id) => {
  const result = await query.blockRider(user_id);

  if (!result.rows.length) {
    throw new Error('Rider not found');
  }

  return {
    user_id,
    blocked: true
  };
};

const unblockRider = async (user_id) => {
  const result = await query.unblockRider(user_id);

  if (!result.rows.length) {
    throw new Error('Rider not found');
  }

  return {
    user_id,
    blocked: false
  };
};

const getRiderDetails = async (user_id) => {
  const profileResult = await query.getRiderDetails(user_id);

  if (!profileResult.rows.length) {
    throw new Error("Rider not found");
  }

  const bankResult = await query.getRiderBankDetails(user_id);
  const statsResult = await query.getRiderStats(user_id);

  return {
    profile: profileResult.rows[0],
    bank: bankResult.rows[0] || {},
    location: {
      lat: profileResult.rows[0].current_lat,
      lng: profileResult.rows[0].current_lng,
      last_location_update: profileResult.rows[0].last_location_update
    },
    cod: {
      cod_collected: profileResult.rows[0].cod_collected,
      cod_submitted: profileResult.rows[0].cod_submitted
    },
    stats: statsResult.rows[0] || {}
  };
};

module.exports = {
  getRiders,
  getRiderDetails,
  blockRider,
  unblockRider
};
