const express = require('express');
const {
  fetchAddresses,
  createNewAddress,
  updateExistingAddress,
  deleteExistingAddress,
  makeDefaultAddress
} = require('../controllers/addressController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', fetchAddresses);
router.post('/', createNewAddress);
router.put('/:id', updateExistingAddress);
router.delete('/:id', deleteExistingAddress);
router.patch('/:id/default', makeDefaultAddress);

module.exports = router;