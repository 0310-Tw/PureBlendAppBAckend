const express = require('express');
const {
  fetchFavorites,
  createFavorite,
  deleteFavorite
} = require('../controllers/favoriteController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', fetchFavorites);
router.post('/', createFavorite);
router.delete('/:smoothieId', deleteFavorite);

module.exports = router;