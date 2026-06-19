const { validationResult } = require('express-validator');
const Configuration = require('../models/Configuration');
const ConfigurationComponent = require('../models/ConfigurationComponent');
const Component = require('../models/Component');

// Mandatory categories for a valid bicycle configuration
const MANDATORY_CATEGORIES = ['Frame', 'Tyre', 'Gear Set'];

/**
 * @desc    Create a new configuration
 * @route   POST /api/configurations
 * @access  Private (Salesperson)
 */
const createConfiguration = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { configurationName, description, components } = req.body;

    // Validate mandatory categories are present
    if (components && components.length > 0) {
      const componentDocs = await Component.find({
        _id: { $in: components.map((c) => c.componentId) },
      });

      const presentCategories = componentDocs.map((c) => c.category);
      const missingMandatory = MANDATORY_CATEGORIES.filter(
        (cat) => !presentCategories.includes(cat)
      );

      if (missingMandatory.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing mandatory categories: ${missingMandatory.join(', ')}`,
        });
      }
    }

    // Create configuration
    const configuration = await Configuration.create({
      configurationName,
      description,
      createdBy: req.user._id,
    });

    // Add components if provided
    if (components && components.length > 0) {
      const configComponents = components.map((c) => ({
        configurationId: configuration._id,
        componentId: c.componentId,
        quantity: c.quantity || 1,
      }));
      await ConfigurationComponent.insertMany(configComponents);
    }

    // Return with populated data
    const populatedConfig = await getConfigurationWithComponents(configuration._id);

    res.status(201).json({
      success: true,
      message: 'Configuration created successfully',
      data: populatedConfig,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a configuration
 * @route   PUT /api/configurations/:id
 * @access  Private (Salesperson)
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

    const { configurationName, description, components } = req.body;

    // Validate mandatory categories if updating components
    if (components && components.length > 0) {
      const componentDocs = await Component.find({
        _id: { $in: components.map((c) => c.componentId) },
      });

      const presentCategories = componentDocs.map((c) => c.category);
      const missingMandatory = MANDATORY_CATEGORIES.filter(
        (cat) => !presentCategories.includes(cat)
      );

      if (missingMandatory.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Missing mandatory categories: ${missingMandatory.join(', ')}`,
        });
      }
    }

    // Update configuration details
    configuration.configurationName = configurationName || configuration.configurationName;
    configuration.description = description !== undefined ? description : configuration.description;
    await configuration.save();

    // Replace components if provided
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

    res.json({
      success: true,
      message: 'Configuration updated successfully',
      data: populatedConfig,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a configuration by ID
 * @route   GET /api/configurations/:id
 * @access  Private
 */
const getConfiguration = async (req, res, next) => {
  try {
    const populatedConfig = await getConfigurationWithComponents(req.params.id);
    if (!populatedConfig) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }
    res.json({ success: true, data: populatedConfig });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all configurations (for salesperson dashboard)
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

    res.json({
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

/**
 * @desc    Delete a configuration
 * @route   DELETE /api/configurations/:id
 * @access  Private (Salesperson)
 */
const deleteConfiguration = async (req, res, next) => {
  try {
    const configuration = await Configuration.findById(req.params.id);
    if (!configuration) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }

    // Remove associated components
    await ConfigurationComponent.deleteMany({ configurationId: configuration._id });
    await configuration.deleteOne();

    res.json({ success: true, message: 'Configuration deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add/replace components in a configuration
 * @route   POST /api/configurations/:id/components
 * @access  Private (Salesperson)
 */
const updateConfigurationComponents = async (req, res, next) => {
  try {
    const { components } = req.body;

    const configuration = await Configuration.findById(req.params.id);
    if (!configuration) {
      return res.status(404).json({ success: false, message: 'Configuration not found' });
    }

    // Delete existing and re-insert
    await ConfigurationComponent.deleteMany({ configurationId: configuration._id });

    if (components && components.length > 0) {
      const configComponents = components.map((c) => ({
        configurationId: configuration._id,
        componentId: c.componentId,
        quantity: c.quantity || 1,
      }));
      await ConfigurationComponent.insertMany(configComponents);
    }

    const populatedConfig = await getConfigurationWithComponents(configuration._id);

    res.json({
      success: true,
      message: 'Configuration components updated',
      data: populatedConfig,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Get configuration with populated component details
 */
const getConfigurationWithComponents = async (configId) => {
  const configuration = await Configuration.findById(configId).populate('createdBy', 'name email');
  if (!configuration) return null;

  const configComponents = await ConfigurationComponent.find({ configurationId: configId }).populate(
    'componentId'
  );

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
