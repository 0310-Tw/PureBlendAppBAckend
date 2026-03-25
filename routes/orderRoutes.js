const express = require('express');
const {
  createOrder,
  fetchOrders,
  fetchOrderById,
  patchOrderStatus,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/', fetchOrders);
router.get('/:id', fetchOrderById);
router.patch('/:id/status', patchOrderStatus);

module.exports = router;