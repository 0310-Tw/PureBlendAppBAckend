const express = require('express');
const {
  fetchCart,
  createCartItem,
  updateExistingCartItem,
  deleteExistingCartItem,
  clearCart
} = require('../controllers/cartController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', fetchCart);
router.post('/', createCartItem);
router.put('/:id', updateExistingCartItem);
router.delete('/:id', deleteExistingCartItem);
router.delete('/', clearCart);

module.exports = router;