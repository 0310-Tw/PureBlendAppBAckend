const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const [rows] = await pool.query(
      'SELECT id, full_name, email, phone, preferred_fulfillment, profile_image_url, is_active, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, token failed'
    });
  }
};

module.exports = { protect };