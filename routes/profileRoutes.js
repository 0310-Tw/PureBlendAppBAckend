const express = require('express');
const {
  fetchProfile,
  updateProfile,
  updatePreferences
} = require('../controllers/profileController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', fetchProfile);
router.put('/', updateProfile);
router.patch('/preferences', updatePreferences);

module.exports = router;