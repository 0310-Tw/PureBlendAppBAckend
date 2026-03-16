const { body, validationResult } = require('express-validator');
const {
  getSmoothieById,
  getSmoothieSizePrice,
  getCartItemsByUserId,
  getCartItemByIdAndUserId,
  addCartItem,
  updateCartItem,
  deleteCartItem,
  clearCartByUserId
} = require('../services/cartService');

const validateCartItem = async (req) => {
  await body('smoothie_id')
    .optional()
    .isInt({ gt: 0 })
    .withMessage('Valid smoothie_id is required')
    .run(req);

  await body('size_name')
    .notEmpty()
    .withMessage('size_name is required')
    .isIn(['small', 'large'])
    .withMessage('size_name must be small or large')
    .run(req);

  await body('quantity')
    .notEmpty()
    .withMessage('quantity is required')
    .isInt({ gt: 0 })
    .withMessage('quantity must be greater than 0')
    .run(req);
};

const fetchCart = async (req, res, next) => {
  try {
    const cart = await getCartItemsByUserId(req.user.id);

    res.status(200).json({
      success: true,
      count: cart.items.length,
      summary: cart.summary,
      data: cart.items
    });
  } catch (error) {
    next(error);
  }
};

const createCartItem = async (req, res, next) => {
  try {
    await validateCartItem(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { smoothie_id, size_name, quantity } = req.body;

    const smoothie = await getSmoothieById(smoothie_id);
    if (!smoothie) {
      return res.status(404).json({
        success: false,
        message: 'Smoothie not found'
      });
    }

    const sizeRow = await getSmoothieSizePrice(smoothie_id, size_name);
    if (!sizeRow) {
      return res.status(404).json({
        success: false,
        message: 'Selected size not found for this smoothie'
      });
    }

    const cartItem = await addCartItem(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Item added to cart successfully',
      data: cartItem
    });
  } catch (error) {
    next(error);
  }
};

const updateExistingCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingItem = await getCartItemByIdAndUserId(id, req.user.id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    await body('size_name')
      .notEmpty()
      .withMessage('size_name is required')
      .isIn(['small', 'large'])
      .withMessage('size_name must be small or large')
      .run(req);

    await body('quantity')
      .notEmpty()
      .withMessage('quantity is required')
      .isInt({ gt: 0 })
      .withMessage('quantity must be greater than 0')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const sizeRow = await getSmoothieSizePrice(existingItem.smoothie_id, req.body.size_name);
    if (!sizeRow) {
      return res.status(404).json({
        success: false,
        message: 'Selected size not found for this smoothie'
      });
    }

    const updatedItem = await updateCartItem(id, req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Cart item updated successfully',
      data: updatedItem
    });
  } catch (error) {
    next(error);
  }
};

const deleteExistingCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingItem = await getCartItemByIdAndUserId(id, req.user.id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Cart item not found'
      });
    }

    const deleted = await deleteCartItem(id, req.user.id);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete cart item'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Cart item deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const clearCart = async (req, res, next) => {
  try {
    await clearCartByUserId(req.user.id);

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchCart,
  createCartItem,
  updateExistingCartItem,
  deleteExistingCartItem,
  clearCart
};