const pool = require('../config/db');

module.exports = (requiredRole = null) => {
  return async (req, res, next) => {
    const user_id = req.headers['x-user-id'];
    const role = req.headers['x-role'];

    if (!user_id || !role) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    if (requiredRole && role !== requiredRole) {
      return res.status(403).json({
        success: false,
        message: "Forbidden"
      });
    }

    req.user = {
      id: Number(user_id),
      role
    };

    try {
      await pool.query(
        'UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = $1',
        [req.user.id]
      );
    } catch (err) {
      console.error("LAST_SEEN UPDATE ERROR:", err.message);
    }

    next();
  };
};
