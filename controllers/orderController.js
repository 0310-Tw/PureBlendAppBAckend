const { body, validationResult } = require('express-validator');
const {
  createOrderFromCart,
  getOrdersByUserId,
  getOrderByIdAndUserId,
  getOrderById,
  updateOrderStatus,
} = require('../services/orderService');

const createOrder = async (req, res, next) => {
  try {
    await body('fulfillment_type')
      .notEmpty()
      .withMessage('fulfillment_type is required')
      .isIn(['delivery', 'pickup'])
      .withMessage('fulfillment_type must be delivery or pickup')
      .run(req);

    await body('payment_method')
      .notEmpty()
      .withMessage('payment_method is required')
      .isIn(['cash_on_delivery', 'pay_at_pickup', 'card'])
      .withMessage('payment_method must be cash_on_delivery, pay_at_pickup, or card')
      .run(req);

    await body('address_id')
      .optional({ nullable: true })
      .isInt({ gt: 0 })
      .withMessage('address_id must be a valid integer')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const { fulfillment_type, payment_method } = req.body;

    if (fulfillment_type === 'delivery' && payment_method === 'pay_at_pickup') {
      return res.status(400).json({
        success: false,
        message: 'pay_at_pickup cannot be used for delivery orders',
      });
    }

    if (fulfillment_type === 'pickup' && payment_method === 'cash_on_delivery') {
      return res.status(400).json({
        success: false,
        message: 'cash_on_delivery cannot be used for pickup orders',
      });
    }

    const order = await createOrderFromCart(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: order,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    next(error);
  }
};

const fetchOrders = async (req, res, next) => {
  try {
    const orders = await getOrdersByUserId(req.user.id);

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const fetchOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const order = await getOrderByIdAndUserId(id, req.user.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const patchOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;

    await body('status')
      .notEmpty()
      .withMessage('status is required')
      .isIn([
        'pending',
        'confirmed',
        'preparing',
        'ready',
        'out_for_delivery',
        'completed',
        'cancelled',
      ])
      .withMessage('Invalid status value')
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array(),
      });
    }

    const existingOrder = await getOrderById(id);

    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
      });
    }

    const updatedOrder = await updateOrderStatus(id, req.body.status);

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  fetchOrders,
  fetchOrderById,
  patchOrderStatus,
};