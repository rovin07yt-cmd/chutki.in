const validateRegister = (data) => {

  // common fields
  if (!data.gmail) throw new Error('Gmail is required');
  if (!data.password) throw new Error('Password is required');
  if (!data.role) throw new Error('Role is required');

  // normalize gmail
  data.gmail = data.gmail.toLowerCase();

  // role-based validation
  if (data.role === 'user') {
    if (!data.name) throw new Error('Name is required');
    if (!data.mobile) throw new Error('Mobile is required');
  }

  if (data.role === 'restaurant') {
    if (!data.restaurant_name) throw new Error('Restaurant name is required');
    if (!data.owner_name) throw new Error('Owner name is required');
    if (!data.owner_mobile) throw new Error('Owner mobile is required');
    if (!data.restaurant_mobile) throw new Error('Restaurant mobile is required');
  }

  if (data.role === 'rider') {
    if (!data.name) throw new Error('Name is required');
    if (!data.mobile) throw new Error('Mobile is required');
    if (!data.driving_license) throw new Error('Driving license is required');
  }

  if (data.role === 'workwithus') {
    if (!data.name) throw new Error('Name is required');
    if (!data.mobile) throw new Error('Mobile is required');
  }

  return true;
};

module.exports = {
  validateRegister
};
