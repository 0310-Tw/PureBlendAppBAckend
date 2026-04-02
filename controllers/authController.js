const {
  registerUser,
  loginUser,
  getUserProfileById,
  createPasswordResetToken,
  resetPasswordWithToken,
} = require('../services/authService');

const register = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;

    const result = await registerUser({
      name,
      email,
      phone,
      password,
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser({
      email,
      password,
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: result.user,
      token: result.token,
    });
  } catch (error) {
    next(error);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await getUserProfileById(req.user.id);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || email.toString().trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const result = await createPasswordResetToken(email);

    res.status(200).json({
      success: true,
      message: result.message,
      resetToken: result.resetToken,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || token.toString().trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reset token is required',
      });
    }

    if (!newPassword || newPassword.toString().trim().length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters',
      });
    }

    const result = await resetPasswordWithToken(token, newPassword);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getProfile,
  forgotPassword,
  resetPassword,
};