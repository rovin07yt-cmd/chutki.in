const authService = require('../services/auth.service');

const register = async (req, res) => {
  try {
    const result = await authService.registerUser(req.body);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const verify = async (req, res) => {
  try {
    const user = await authService.verifyAndCreateUser(req.body);
    res.json({ message: 'User created', user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password, role } = req.body;
    const data = await authService.loginUser(identifier, password, role);
    res.json({ message: 'Login successful', ...data });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  register,
  verify,
  login
};
