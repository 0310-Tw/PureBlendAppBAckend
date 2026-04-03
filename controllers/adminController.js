const { body, validationResult } = require('express-validator');
const {
  getAllOrders: serviceGetAllOrders,
  getOrderById,
  updateOrderStatus: serviceUpdateOrderStatus,
} = require('../services/orderService');


// ================= DASHBOARD =================
const getDashboard = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Admin dashboard data',
    });
  } catch (error) {
    next(error);
  }
};


// ================= ORDERS =================
const getAllOrders = async (req, res, next) => {
  try {
    const orders = await serviceGetAllOrders();

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
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
      .run(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
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

    const updatedOrder = await serviceUpdateOrderStatus(id, req.body.status);

    res.status(200).json({
      success: true,
      message: 'Order updated',
      data: updatedOrder,
    });
  } catch (error) {
    next(error);
  }
};


// ================= USERS =================
const getAllUsers = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Users list (implement DB logic)',
    });
  } catch (error) {
    next(error);
  }
};


// ================= SMOOTHIES =================
const getAllSmoothies = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Smoothies list (implement DB logic)',
    });
  } catch (error) {
    next(error);
  }
};

const createSmoothie = async (req, res, next) => {
  try {
    res.status(201).json({
      success: true,
      message: 'Smoothie created (implement DB logic)',
    });
  } catch (error) {
    next(error);
  }
};

const updateSmoothie = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Smoothie updated (implement DB logic)',
    });
  } catch (error) {
    next(error);
  }
};

const deleteSmoothie = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      message: 'Smoothie deleted (implement DB logic)',
    });
  } catch (error) {
    next(error);
  }
};


// ================= EXPORTS =================
module.exports = {
  getDashboard,
  getAllOrders,
  updateOrderStatus,
  getAllUsers,
  getAllSmoothies,
  createSmoothie,
  updateSmoothie,
  deleteSmoothie,
};