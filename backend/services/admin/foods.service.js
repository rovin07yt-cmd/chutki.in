const query = require('../../queries/admin/foods.query');

const allowedCategories = [
  'breakfast',
  'lunch',
  'dinner',
  'snacks',
  'sweets',
  'dessert',
  'drinks'
];

const validateFood = ({
  food_id,
  name,
  type,
  categories,
  prices
}) => {
  if (!food_id) {
    throw new Error('food_id required');
  }

  if (!name || !String(name).trim()) {
    throw new Error('name required');
  }

  if (!['veg', 'nonveg'].includes(type)) {
    throw new Error('invalid food type');
  }

  if (!Array.isArray(categories) || !categories.length) {
    throw new Error('categories required');
  }

  for (const category of categories) {
    if (!allowedCategories.includes(category)) {
      throw new Error('invalid category');
    }
  }

  if (!Array.isArray(prices) || !prices.length) {
    throw new Error('prices required');
  }

  for (const price of prices) {
    if (!['half', 'full'].includes(price.type)) {
      throw new Error('invalid price type');
    }

    if (
      price.prep_time === undefined ||
      price.prep_time === null
    ) {
      throw new Error('prep_time required');
    }

    if (Number(price.price) > Number(price.mrp)) {
      throw new Error('price cannot exceed MRP');
    }
  }
};

const getFoods = async () => {
  const result = await query.getFoods();
  return result.rows;
};

const updateFood = async (data) => {
  validateFood(data);

  return query.updateFood({
    food_id: data.food_id,
    name: data.name,
    description: data.description,
    type: data.type,
    categories: data.categories,
    prices: data.prices
  });
};

const deleteFood = async (food_id) => {
  if (!food_id) {
    throw new Error('food_id required');
  }

  return query.deleteFood(food_id);
};

const cleanupExpiredFoods = async () => {
  const result = await query.deleteExpiredFoods();

  if (result.rows.length) {
    console.log(
      `Deleted ${result.rows.length} expired food item(s):`,
      result.rows.map(row => row.id)
    );
  }
};

module.exports = {
  getFoods,
  updateFood,
  deleteFood,
  cleanupExpiredFoods
};
