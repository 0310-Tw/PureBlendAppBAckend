const { body, validationResult } = require('express-validator');
const {
  getAddressesByUserId,
  getAddressByIdAndUserId,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} = require('../services/addressService');

const validateAddress = async (req) => {
  await body('label').notEmpty().withMessage('Label is required').run(req);
  await body('street_address').notEmpty().withMessage('Street address is required').run(req);
  await body('town').notEmpty().withMessage('Town is required').run(req);
  await body('parish').notEmpty().withMessage('Parish is required').run(req);
};

const fetchAddresses = async (req, res, next) => {
  try {
    const addresses = await getAddressesByUserId(req.user.id);

    res.status(200).json({
      success: true,
      count: addresses.length,
      data: addresses
    });
  } catch (error) {
    next(error);
  }
};

const createNewAddress = async (req, res, next) => {
  try {
    await validateAddress(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const address = await createAddress(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      data: address
    });
  } catch (error) {
    next(error);
  }
};

const updateExistingAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingAddress = await getAddressByIdAndUserId(id, req.user.id);

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await validateAddress(req);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const updatedAddress = await updateAddress(id, req.user.id, req.body);

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      data: updatedAddress
    });
  } catch (error) {
    next(error);
  }
};

const deleteExistingAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingAddress = await getAddressByIdAndUserId(id, req.user.id);

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const deleted = await deleteAddress(id, req.user.id);

    if (!deleted) {
      return res.status(400).json({
        success: false,
        message: 'Failed to delete address'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const makeDefaultAddress = async (req, res, next) => {
  try {
    const { id } = req.params;

    const existingAddress = await getAddressByIdAndUserId(id, req.user.id);

    if (!existingAddress) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    const updatedAddress = await setDefaultAddress(id, req.user.id);

    res.status(200).json({
      success: true,
      message: 'Default address updated successfully',
      data: updatedAddress
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchAddresses,
  createNewAddress,
  updateExistingAddress,
  deleteExistingAddress,
  makeDefaultAddress
};