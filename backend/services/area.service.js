const areaQuery = require('../queries/area.query');

const isServiceable = async (lat, lng) => {
  const result = await areaQuery.checkServiceable(lat, lng);
  return result.rows.length > 0;
};

module.exports = {
  isServiceable
};
