const pool = require("../config/db");
const areaService = require("./area.service");

const getStatus = async (user_id) => {

  const res = await pool.query(
    `SELECT is_online
     FROM riders
     WHERE user_id = $1`,
    [user_id]
  );

  if(!res.rows.length){
    throw new Error("Rider not found");
  }

  return res.rows[0];
};

const toggleStatus = async (
  user_id,
  is_online
) => {

  if(is_online){

    const riderRes = await pool.query(
      `SELECT current_lat,current_lng
       FROM riders
       WHERE user_id = $1`,
      [user_id]
    );

    if(!riderRes.rows.length){
      throw new Error("Rider not found");
    }

    const rider = riderRes.rows[0];

    if(!rider.current_lat || !rider.current_lng){
      throw new Error(
        "Update location first"
      );
    }

    const serviceable =
      await areaService.isServiceable(
        rider.current_lat,
        rider.current_lng
      );

    if(!serviceable){
      throw new Error(
        "Outside serviceable area"
      );
    }
  }

  await pool.query(
    `UPDATE riders
     SET is_online = $1
     WHERE user_id = $2`,
    [is_online,user_id]
  );

  return {
    is_online
  };
};

module.exports = {
  getStatus,
  toggleStatus
};
