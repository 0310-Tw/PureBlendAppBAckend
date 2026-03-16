const { validationResult, body } = require('express-validator');
const generateToken = require('../utils/generateToken');
const {
  findUserByEmail,
  findUserById,
  createUser,
  matchPassword
} = require('../services/authService');

const registerUser = async (req, res, next) => {
  try {
    await body('full_name').notEmpty().withMessage('Full name is required').run(req);
    await body('email').isEmail().withMessage('Valid email is required').run(req);
    await body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { full_name, email, phone, password } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const user = await createUser({ full_name, email, phone, password });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    await body('email').isEmail().withMessage('Valid email is required').run(req);
    await body('password').notEmpty().withMessage('Password is required').run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const isMatch = await matchPassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const safeUser = await findUserById(user.id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: safeUser,
        token: generateToken(user.id)
      }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe
};