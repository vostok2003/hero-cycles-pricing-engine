const { validationResult } = require('express-validator');
const Configuration = require('../models/Configuration');
const ConfigurationComponent = require('../models/ConfigurationComponent');
const {
  validateMandatoryCategories,
  canMutateConfiguration,
} = require('../utils/configValidation');

// ─────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────

/**
 * @desc    Create a new bicycle configuration
 * @route   POST /api/configurations
 * @access  Private (Admin | Salesperson)
 */
const createConfiguration = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { configurationName, description, components } = req.body;

    // Mandatory category check — required even at creation time
    const componentIds = (components || []).map((c) => c.componentId);
    const { valid, missing } = await validateMandatoryCategories(componentIds);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: `Missing mandatory categories: ${missing.join(', ')}`,
      });
    }

    // Create the configuration record
    const configuration = await Configuration.create({
      configurationName,
      description,
      createdBy: req.user._id,
    });

    // Persist component links
    const configComponents = components.map((c) => ({
      configurationId: configuration._id,
      componentId: c.componentId,
      quantity: c.quantity || 1,
    }));
    await ConfigurationComponent.insertMany(configComponents);

    const populatedConfig = await getConfigurationWithComponents(configuration._id);

    return res.status(201).json({
      success: true,
      message: 'Configuration created successfully',
      data: populatedConfig,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────

/**
 * @desc    Update a configuration (name, description, components)
 * @route   PUT /api/configurations/:id
 * @access  Private (Admin | Salesperson — owner only)
 */
const updateConfiguration = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const configuration = await Configuration.findById(req.params.id);
    if (!configuration) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }

    // ── Ownership check ──────────────────────────────────────────────────
    if (!canMutateConfiguration(configuration, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only edit your own configurations',
      });
    }

    const { configurationName, description, components } = req.body;

    // Validate mandatory categories whenever components are supplied
    if (components !== undefined) {
      const componentIds = (components || []).map((c) => c.componentId);
      const { valid, missing } = await validateMandatoryCategories(componentIds);
      if (!valid) {
        return res.status(400).json({
          success: false,
          message: `Missing mandatory categories: ${missing.join(', ')}`,
        });
      }
    }

    // Apply field updates
    if (configurationName) configuration.configurationName = configurationName;
    if (description !== undefined) configuration.description = description;
    await configuration.save();

    // Replace component list if a new one was provided
    if (components !== undefined) {
      await ConfigurationComponent.deleteMany({ configurationId: configuration._id });

      if (components.length > 0) {
        const configComponents = components.map((c) => ({
          configurationId: configuration._id,
          componentId: c.componentId,
          quantity: c.quantity || 1,
        }));
        await ConfigurationComponent.insertMany(configComponents);
      }
    }

    const populatedConfig = await getConfigurationWithComponents(configuration._id);

    return res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: populatedConfig,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// READ (single)
// ─────────────────────────────────────────────

/**
 * @desc    Get a single configuration by ID
 * @route   GET /api/configurations/:id
 * @access  Private
 */
const getConfiguration = async (req, res, next) => {
  try {
    const populatedConfig = await getConfigurationWithComponents(req.params.id);
    if (!populatedConfig) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }
    return res.json({ success: true, data: populatedConfig });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// READ (all)
// ─────────────────────────────────────────────

/**
 * @desc    Get all configurations with optional search and pagination
 * @route   GET /api/configurations
 * @access  Private
 */
const getAllConfigurations = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const query = {};
    if (search) {
      query.configurationName = { $regex: search, $options: 'i' };
    }

    const [configurations, total] = await Promise.all([
      Configuration.find(query)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Configuration.countDocuments(query),
    ]);

    return res.json({
      success: true,
      data: configurations,
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

// ─────────────────────────────────────────────
// DELETE
// ─────────────────────────────────────────────

/**
 * @desc    Delete a configuration and its component links
 * @route   DELETE /api/configurations/:id
 * @access  Private (Admin | Salesperson — owner only)
 */
const deleteConfiguration = async (req, res, next) => {
  try {
    const configuration = await Configuration.findById(req.params.id);
    if (!configuration) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }

    // ── Ownership check ──────────────────────────────────────────────────
    if (!canMutateConfiguration(configuration, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only delete your own configurations',
      });
    }

    await ConfigurationComponent.deleteMany({ configurationId: configuration._id });
    await configuration.deleteOne();

    return res.json({ success: true, message: 'Configuration deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// UPDATE COMPONENTS (standalone route)
// ─────────────────────────────────────────────

/**
 * @desc    Replace all components in a configuration
 * @route   POST /api/configurations/:id/components
 * @access  Private (Admin | Salesperson — owner only)
 */
const updateConfigurationComponents = async (req, res, next) => {
  try {
    const { components } = req.body;

    const configuration = await Configuration.findById(req.params.id);
    if (!configuration) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }

    // ── Ownership check ──────────────────────────────────────────────────
    if (!canMutateConfiguration(configuration, req.user)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: you can only modify your own configurations',
      });
    }

    // ── Mandatory category check ─────────────────────────────────────────
    const componentIds = (components || []).map((c) => c.componentId);
    const { valid, missing } = await validateMandatoryCategories(componentIds);
    if (!valid) {
      return res.status(400).json({
        success: false,
        message: `Missing mandatory categories: ${missing.join(', ')}`,
      });
    }

    // Replace components
    await ConfigurationComponent.deleteMany({ configurationId: configuration._id });

    const configComponents = components.map((c) => ({
      configurationId: configuration._id,
      componentId: c.componentId,
      quantity: c.quantity || 1,
    }));
    await ConfigurationComponent.insertMany(configComponents);

    const populatedConfig = await getConfigurationWithComponents(configuration._id);

    return res.json({
      success: true,
      message: 'Configuration components updated',
      data: populatedConfig,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────
// HELPER
// ─────────────────────────────────────────────

/**
 * Fetch a configuration document with its components populated.
 * @param {string} configId
 * @returns {Object|null}
 */
const getConfigurationWithComponents = async (configId) => {
  const configuration = await Configuration.findById(configId).populate('createdBy', 'name email');
  if (!configuration) return null;

  const configComponents = await ConfigurationComponent.find({
    configurationId: configId,
  }).populate('componentId');

  return {
    ...configuration.toObject(),
    components: configComponents.map((cc) => ({
      _id: cc._id,
      componentId: cc.componentId,
      quantity: cc.quantity,
    })),
  };
};

module.exports = {
  createConfiguration,
  updateConfiguration,
  getConfiguration,
  getAllConfigurations,
  deleteConfiguration,
  updateConfigurationComponents,
};
