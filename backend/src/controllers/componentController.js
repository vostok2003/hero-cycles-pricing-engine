const { validationResult } = require('express-validator');
const Component = require('../models/Component');

/**
 * @desc    Get all components with search and filter
 * @route   GET /api/components
 * @access  Private
 */
const getComponents = async (req, res, next) => {
  try {
    const { search, category, page = 1, limit = 10 } = req.query;

    const query = {};

    // Search by name
    if (search) {
      query.componentName = { $regex: search, $options: 'i' };
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [components, total] = await Promise.all([
      Component.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Component.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: components,
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
 * @desc    Get all components without pagination (for dropdowns)
 * @route   GET /api/components/all
 * @access  Private
 */
const getAllComponents = async (req, res, next) => {
  try {
    const { category } = req.query;
    const query = category ? { category } : {};
    const components = await Component.find(query).sort({ category: 1, componentName: 1 });
    res.json({ success: true, data: components });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new component
 * @route   POST /api/components
 * @access  Private (Admin)
 */
const createComponent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { componentName, category, currentPrice, isMandatory } = req.body;

    const component = await Component.create({
      componentName,
      category,
      currentPrice,
      isMandatory: isMandatory || false,
      lastUpdatedDate: new Date(),
    });

    res.status(201).json({
      success: true,
      message: 'Component created successfully',
      data: component,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a component
 * @route   PUT /api/components/:id
 * @access  Private (Admin)
 */
const updateComponent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ success: false, message: 'Component not found' });
    }

    const { componentName, category, currentPrice, isMandatory } = req.body;

    component.componentName = componentName || component.componentName;
    component.category = category || component.category;
    component.currentPrice = currentPrice !== undefined ? currentPrice : component.currentPrice;
    component.isMandatory = isMandatory !== undefined ? isMandatory : component.isMandatory;
    component.lastUpdatedDate = new Date();

    const updated = await component.save();

    res.json({
      success: true,
      message: 'Component updated successfully',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a component
 * @route   DELETE /api/components/:id
 * @access  Private (Admin)
 */
const deleteComponent = async (req, res, next) => {
  try {
    const component = await Component.findById(req.params.id);
    if (!component) {
      return res.status(404).json({ success: false, message: 'Component not found' });
    }

    await component.deleteOne();

    res.json({
      success: true,
      message: 'Component deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getComponents,
  getAllComponents,
  createComponent,
  updateComponent,
  deleteComponent,
};
