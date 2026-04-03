const express = require('express');
const {
  createOrder,
  fetchOrders,
  fetchOrderById,
  patchOrderStatus,
  fetchAllOrders,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const router = express.Router();

router.use(protect);

router.post('/', createOrder);
router.get('/', fetchOrders);

// admin routes
router.get('/admin/all', adminOnly, fetchAllOrders);
router.patch('/:id/status', adminOnly, patchOrderStatus);

// user route
router.get('/:id', fetchOrderById);

module.exports = router;