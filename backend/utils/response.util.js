const success = (res, message, data = null) => {
  return res.json({
    success: true,
    message,
    data
  });
};

const error = (res, message, code = 400) => {
  return res.status(code).json({
    success: false,
    message
  });
};

module.exports = {
  success,
  error
};
