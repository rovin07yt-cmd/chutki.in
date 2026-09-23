const query = require('../../queries/user/cart.query');

const getCartSummary = async (items) => {

  let total_price = 0;
  let total_mrp = 0;

  const detailedItems = [];

  for (let item of items) {

    const res = await query.getFoodDetails(item.food_id);
    const food = res.rows[0];

    if (!food || !food.is_available) continue;

    const price = Number(food.price);
    const mrp = Number(food.mrp);
    const prep_time = Number(food.prep_time || 0);
    const qty = Number(item.quantity);

    total_price += price * qty;
    total_mrp += mrp * qty;

    detailedItems.push({
      food_id: food.id,
      name: food.name,
      restaurant_id: food.restaurant_id,
      quantity: qty,
      price,
      mrp,
      prep_time
    });
  }

  const discount = total_mrp - total_price;
  const settingsRes = await query.getSystemSettings();
  const settings = settingsRes.rows[0];

  const restaurant_count = new Set(
    detailedItems.map(i => i.restaurant_id)
  ).size;


  // 🔥 dummy charges (we will connect admin later)
  const delivery_charge = Number(settings.delivery_charge || 0);
  const extra_charge = restaurant_count > 1
    ? (restaurant_count - 1) * Number(settings.extra_per_restaurant || 0)
    : 0;
  const gst = Math.round(
    total_price * (Number(settings.gst_percent || 0) / 100)
  );

  const final_total = total_price + delivery_charge + extra_charge + gst;

  return {
    items: detailedItems,
    total_price,
    discount,
    delivery_charge,
    extra_charge,
    gst,
    final_total
  };
};

module.exports = { getCartSummary };
