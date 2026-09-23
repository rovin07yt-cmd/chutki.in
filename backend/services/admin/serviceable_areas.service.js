const query = require('../../queries/admin/serviceable_areas.query');

const getAreas = async () => {
  const result = await query.getAreas();
  return result.rows;
};

const getAreaDetails = async (area_id) => {
  const result = await query.getAreaDetails(area_id);

  if (!result.rows.length) {
    throw new Error('Area not found');
  }

  return {
    id: result.rows[0].id,
    name: result.rows[0].name,
    circles: result.rows.map(row => ({
      circle_id: row.circle_id,
      center_lat: row.center_lat,
      center_lng: row.center_lng,
      radius: row.radius
    })).filter(circle => circle.circle_id)
  };
};

const createArea = async (data) => {
  const result = await query.createArea(
    data.name
  );

  return result.rows[0];
};

const addCircle = async (area_id, data) => {
  const result = await query.addCircle(
    area_id,
    data.center_lat,
    data.center_lng,
    data.radius
  );

  return result.rows[0];
};

const updateArea = async (area_id, data) => {
  const result = await query.updateArea(
    area_id,
    data.name
  );

  if (!result.rows.length) {
    throw new Error('Area not found');
  }

  return result.rows[0];
};

const deleteArea = async (area_id) => {
  const result = await query.deleteArea(area_id);

  if (!result.rows.length) {
    throw new Error('Area not found');
  }

  return {
    area_id
  };
};

const deleteCircle = async (circle_id) => {
  const result = await query.deleteCircle(circle_id);

  if (!result.rows.length) {
    throw new Error('Circle not found');
  }

  return {
    circle_id
  };
};

const updateCircle = async (circle_id, data) => {
  const result = await query.updateCircle(
    circle_id,
    data.center_lat,
    data.center_lng,
    data.radius
  );

  if (!result.rows.length) {
    throw new Error("Circle not found");
  }

  return result.rows[0];
};

module.exports = {
  getAreas,
  getAreaDetails,
  createArea,
  addCircle,
  updateArea,
  deleteArea,
  deleteCircle,
  updateCircle,
};
