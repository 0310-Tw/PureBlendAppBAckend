const db = require('../config/db');

const adminOnly = async (req, res, next) => {
  try {
    const userId =
      req.user?.id ||
      req.user?.userId ||
      req.user?.user_id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized. User not found in token.',
      });
    }

    if (
      req.user?.is_admin === 1 ||
      req.user?.is_admin === true ||
      req.user?.isAdmin === 1 ||
      req.user?.isAdmin === true
    ) {
      return next();
    }

    const [rows] = await db.query(
      'SELECT id, is_admin FROM users WHERE id = ? LIMIT 1',
      [userId]
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: 'User not found.',
      });
    }

    if (!Number(rows[0].is_admin)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.',
      });
    }

    req.user.is_admin = Number(rows[0].is_admin);
    next();
  } catch (error) {
    console.error('adminOnly error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking admin access.',
    });
  }
};

module.exports = { adminOnly };