const { body, validationResult } = require('express-validator');
const {
  upsertUserDeviceToken,
  deleteUserDeviceToken,
} = require('../services/deviceService');

const registerDeviceToken = async (req, res, next) => {
  try {
    await body('fcm_token')
      .notEmpty()
      .withMessage('fcm_token is required')
      .run(req);

    await body('platform')
      .optional()
      .isIn(['android', 'ios', 'web'])
      .withMessage('platform must be android, ios, or web')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const device = await upsertUserDeviceToken({
      userId: req.user.id,
      fcmToken: req.body.fcm_token,
      platform: req.body.platform,
    });

    res.status(200).json({
      success: true,
      message: 'Device token registered successfully',
      data: device,
    });
  } catch (error) {
    next(error);
  }
};

const unregisterDeviceToken = async (req, res, next) => {
  try {
    await body('fcm_token')
      .notEmpty()
      .withMessage('fcm_token is required')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const deleted = await deleteUserDeviceToken({
      userId: req.user.id,
      fcmToken: req.body.fcm_token,
    });

    res.status(200).json({
      success: true,
      message: deleted
          ? 'Device token removed successfully'
          : 'Device token was not found for this user',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerDeviceToken,
  unregisterDeviceToken,
};