const query = require('../../queries/admin/settings.query');

const getSettings = async () => {
  const result = await query.getSettings();
  return result.rows[0];
};

const updateSettings = async (data) => {
  const result = await query.updateSettings(data);
  return result.rows[0];
};

module.exports = {
  getSettings,
  updateSettings
};