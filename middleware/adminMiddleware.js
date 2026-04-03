const adminOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized',
    });
  }

  const isAdmin =
    req.user.is_admin === 1 ||
    req.user.is_admin === true ||
    req.user.isAdmin === true;

  if (!isAdmin) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }

  next();
};

module.exports = { adminOnly };