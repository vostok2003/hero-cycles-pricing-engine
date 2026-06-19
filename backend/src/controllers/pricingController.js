const { validationResult } = require('express-validator');
const Component = require('../models/Component');
const PriceHistory = require('../models/PriceHistory');
const pricingEngine = require('../services/pricingEngine');

/**
 * @desc    Update component price and create price history record
 * @route   POST /api/prices/update
 * @access  Private (Admin)
 */
const updatePrice = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { componentId, newPrice } = req.body;

    // Find the component
    const component = await Component.findById(componentId);
    if (!component) {
      return res.status(404).json({ success: false, message: 'Component not found' });
    }

    const oldPrice = component.currentPrice;

    // Skip if same price
    if (oldPrice === newPrice) {
      return res.status(400).json({ success: false, message: 'New price must be different from current price' });
    }

    // Create price history record
    const priceHistory = await PriceHistory.create({
      componentId,
      oldPrice,
      newPrice,
      updatedBy: req.user._id,
      effectiveDate: new Date(),
    });

    // Update component
    component.currentPrice = newPrice;
    component.lastUpdatedDate = new Date();
    await component.save();

    // Populate the history record for response
    await priceHistory.populate([
      { path: 'componentId', select: 'componentName category' },
      { path: 'updatedBy', select: 'name email' },
    ]);

    res.json({
      success: true,
      message: 'Price updated successfully',
      data: {
        component,
        priceHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get price history for a component
 * @route   GET /api/prices/history/:componentId
 * @access  Private (Admin)
 */
const getPriceHistory = async (req, res, next) => {
  try {
    const { componentId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [history, total] = await Promise.all([
      PriceHistory.find({ componentId })
        .populate('componentId', 'componentName category')
        .populate('updatedBy', 'name email')
        .sort({ effectiveDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PriceHistory.countDocuments({ componentId }),
    ]);

    res.json({
      success: true,
      data: history,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all price history
 * @route   GET /api/prices/history
 * @access  Private (Admin)
 */
const getAllPriceHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [history, total] = await Promise.all([
      PriceHistory.find()
        .populate('componentId', 'componentName category')
        .populate('updatedBy', 'name email')
        .sort({ effectiveDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      PriceHistory.countDocuments(),
    ]);

    res.json({
      success: true,
      data: history,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get pricing breakdown for a configuration
 * @route   GET /api/pricing/:configurationId
 * @access  Private
 */
const getPricingBreakdown = async (req, res, next) => {
  try {
    const { configurationId } = req.params;
    const result = await pricingEngine.calculateConfigurationPrice(configurationId);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { updatePrice, getPriceHistory, getAllPriceHistory, getPricingBreakdown };
