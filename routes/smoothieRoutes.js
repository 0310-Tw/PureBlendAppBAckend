const express = require('express');
const {
  fetchAllSmoothies,
  fetchFeaturedSmoothies,
  fetchSmoothieById
} = require('../controllers/smoothieController');

const router = express.Router();

router.get('/featured/list', fetchFeaturedSmoothies);
router.get('/:id', fetchSmoothieById);
router.get('/', fetchAllSmoothies);

module.exports = router;