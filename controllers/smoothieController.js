const {
  getAllSmoothies,
  getFeaturedSmoothies,
  getSmoothieById
} = require('../services/smoothieService');

const fetchAllSmoothies = async (req, res, next) => {
  try {
    const smoothies = await getAllSmoothies();

    res.status(200).json({
      success: true,
      count: smoothies.length,
      data: smoothies
    });
  } catch (error) {
    next(error);
  }
};

const fetchFeaturedSmoothies = async (req, res, next) => {
  try {
    const smoothies = await getFeaturedSmoothies();

    res.status(200).json({
      success: true,
      count: smoothies.length,
      data: smoothies
    });
  } catch (error) {
    next(error);
  }
};

const fetchSmoothieById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const smoothie = await getSmoothieById(id);

    if (!smoothie) {
      return res.status(404).json({
        success: false,
        message: 'Smoothie not found'
      });
    }

    res.status(200).json({
      success: true,
      data: smoothie
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  fetchAllSmoothies,
  fetchFeaturedSmoothies,
  fetchSmoothieById
};