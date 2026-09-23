const pool = require('../../config/db');

const getAreas = async () => {
  return pool.query(
    `
    SELECT
      sa.id,
      sa.name,
      COUNT(sac.id) AS total_circles
    FROM serviceable_areas sa
    LEFT JOIN serviceable_area_circles sac
      ON sac.area_id = sa.id
    GROUP BY sa.id
    ORDER BY sa.name
    `
  );
};

const getAreaDetails = async (area_id) => {
  return pool.query(
    `
    SELECT
      sa.id,
      sa.name,
      sac.id AS circle_id,
      sac.center_lat,
      sac.center_lng,
      sac.radius
    FROM serviceable_areas sa
    LEFT JOIN serviceable_area_circles sac
      ON sac.area_id = sa.id
    WHERE sa.id = $1
    ORDER BY sac.id
    `,
    [area_id]
  );
};

const createArea = async (name) => {
  return pool.query(
    `
    INSERT INTO serviceable_areas(name)
    VALUES($1)
    RETURNING *
    `,
    [name]
  );
};

const addCircle = async (
  area_id,
  center_lat,
  center_lng,
  radius
) => {
  return pool.query(
    `
    INSERT INTO serviceable_area_circles(
      area_id,
      center_lat,
      center_lng,
      radius
    )
    VALUES($1,$2,$3,$4)
    RETURNING *
    `,
    [
      area_id,
      center_lat,
      center_lng,
      radius
    ]
  );
};

const updateArea = async (
  area_id,
  name
) => {
  return pool.query(
    `
    UPDATE serviceable_areas
    SET name = $1
    WHERE id = $2
    RETURNING *
    `,
    [name, area_id]
  );
};

const deleteArea = async (area_id) => {
  await pool.query(
    `
    DELETE FROM serviceable_area_circles
    WHERE area_id = $1
    `,
    [area_id]
  );

  return pool.query(
    `
    DELETE FROM serviceable_areas
    WHERE id = $1
    RETURNING id
    `,
    [area_id]
  );
};

const deleteCircle = async (circle_id) => {
  return pool.query(
    `
    DELETE FROM serviceable_area_circles
    WHERE id = $1
    RETURNING id
    `,
    [circle_id]
  );
};

const updateCircle = async (circle_id, center_lat, center_lng, radius) => {
  return pool.query(
    `
    UPDATE serviceable_area_circles
    SET center_lat = $1,
        center_lng = $2,
        radius = $3
    WHERE id = $4
    RETURNING *
    `,
    [center_lat, center_lng, radius, circle_id]
  );
};

module.exports = {
  getAreas,
  getAreaDetails,
  createArea,
  addCircle,
  updateArea,
  deleteArea,
  deleteCircle,
  updateCircle
};
