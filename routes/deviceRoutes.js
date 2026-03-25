const express = require('express');
const {
  registerDeviceToken,
  unregisterDeviceToken,
} = require('../controllers/deviceController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/register-token', registerDeviceToken);
router.delete('/unregister-token', unregisterDeviceToken);

module.exports = router;