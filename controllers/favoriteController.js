const { body, validationResult } = require('express-validator');
const {
  getFavoritesByUserId,
  smoothieExists,
  favoriteExists,
  addFavorite,
  removeFavorite
} = require('../services/favoriteService');

const fetchFavorites = async (req, res, next) => {
  try {
    const favorites = await getFavoritesByUserId(req.user.id);

    res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites
    });
  } catch (error) {
    next(error);
  }
};

const createFavorite = async (req, res, next) => {
  try {
    await body('smoothie_id')
      .isInt({ gt: 0 })
      .withMessage('Valid smoothie_id is required')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { smoothie_id } = req.body;

    const smoothie = await smoothieExists(smoothie_id);
    if (!smoothie) {
      return res.status(404).json({
        success: false,
        message: 'Smoothie not found'
      });
    }

    const existingFavorite = await favoriteExists(req.user.id, smoothie_id);
    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Smoothie is already in favorites'
      });
    }

    const favorite = await addFavorite(req.user.id, smoothie_id);

    res.status(201).json({
      success: true,
      message: 'Smoothie added to favorites',
      data: favorite
    });
  } catch (error) {
    next(error);
  }
};

const deleteFavorite = async (req, res, next) => {
  try {
    const { smoothieId } = req.params;

    const smoothie = await smoothieExists(smoothieId);
    if (!smoothie) {
      return res.status(404).json({
        success: false,
        message: 'Smoothie not found'
      });
    }

    const existingFavorite = await favoriteExists(req.user.id, smoothieId);
    if (!existingFavorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found for this user'
      });
    }

    const removed = await removeFavorite(req.user.id, smoothieId);

    if (!removed) {
      return res.status(400).json({
        success: false,
        message: 'Failed to remove favorite'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Smoothie removed from favorites'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchFavorites,
  createFavorite,
  deleteFavorite
};