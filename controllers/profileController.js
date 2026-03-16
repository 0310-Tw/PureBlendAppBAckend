const { body, validationResult } = require('express-validator');
const {
  getProfileByUserId,
  getUserByEmail,
  updateProfileByUserId,
  updatePreferencesByUserId
} = require('../services/profileService');

const fetchProfile = async (req, res, next) => {
  try {
    const profile = await getProfileByUserId(req.user.id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Profile not found'
      });
    }

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    await body('full_name')
      .notEmpty()
      .withMessage('Full name is required')
      .run(req);

    await body('email')
      .isEmail()
      .withMessage('Valid email is required')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    const existingUser = await getUserByEmail(email);
    if (existingUser && Number(existingUser.id) !== Number(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Email is already in use by another account'
      });
    }

    const updatedProfile = await updateProfileByUserId(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

const updatePreferences = async (req, res, next) => {
  try {
    await body('preferred_fulfillment')
      .notEmpty()
      .withMessage('preferred_fulfillment is required')
      .isIn(['delivery', 'pickup'])
      .withMessage('preferred_fulfillment must be delivery or pickup')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updatedProfile = await updatePreferencesByUserId(req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: updatedProfile
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchProfile,
  updateProfile,
  updatePreferences
};