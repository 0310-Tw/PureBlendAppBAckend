const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/adminMiddleware');

const {
  getDashboard,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getAllSmoothies,
  createSmoothie,
  updateSmoothie,
  deleteSmoothie,
} = require('../controllers/adminController');

router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);

router.get('/orders', getAllOrders);
router.patch('/orders/:id/status', updateOrderStatus);

router.get('/users', getAllUsers);

router.get('/smoothies', getAllSmoothies);
router.post('/smoothies', createSmoothie);
router.put('/smoothies/:id', updateSmoothie);
router.delete('/smoothies/:id', deleteSmoothie);

module.exports = router;