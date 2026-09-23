const query = require('../queries/food_images.query');

const saveFoodImages = async (food_id, images) => {

  console.log("UPLOAD START:", food_id);

  try {

    let isFirst = true;

    for (const img of images) {

      const count = await query.getImageCount(food_id);
      console.log("CURRENT COUNT:", count);

      // 🔥 max 5 images
      if (count >= 5) {
        console.log("REMOVING OLDEST IMAGE");
        await query.deleteOldestImage(food_id);
      }

      console.log("INSERTING:", img);

      await query.insertOne(food_id, img, isFirst);
      isFirst = false;
    }

  } catch (err) {
    console.error("UPLOAD ERROR:", err.message);
    throw err;
  }

  return {
    message: 'Images updated successfully'
  };
};

module.exports = {
  saveFoodImages
};
