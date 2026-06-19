const Configuration = require('../models/Configuration');
const ConfigurationComponent = require('../models/ConfigurationComponent');
const Component = require('../models/Component');

/**
 * Pricing Engine Service
 * Calculates total price for a bicycle configuration
 * using the latest component prices
 */

/**
 * Calculate total price for a configuration
 * @param {string} configurationId - MongoDB ObjectId of the configuration
 * @returns {Object} Structured pricing breakdown
 */
const calculateConfigurationPrice = async (configurationId) => {
  // Fetch the configuration
  const configuration = await Configuration.findById(configurationId).populate('createdBy', 'name email');
  if (!configuration) {
    throw new Error('Configuration not found');
  }

  // Fetch all components for this configuration
  const configComponents = await ConfigurationComponent.find({
    configurationId,
  }).populate('componentId');

  if (configComponents.length === 0) {
    return {
      configurationId: configuration._id,
      configurationName: configuration.configurationName,
      description: configuration.description,
      components: [],
      totalPrice: 0,
      createdBy: configuration.createdBy,
    };
  }

  // Build component breakdown using latest prices
  const components = configComponents.map((cc) => {
    const comp = cc.componentId;
    const unitPrice = comp.currentPrice;
    const subtotal = unitPrice * cc.quantity;

    return {
      _id: cc._id,
      componentId: comp._id,
      name: comp.componentName,
      category: comp.category,
      quantity: cc.quantity,
      unitPrice,
      subtotal,
      isMandatory: comp.isMandatory,
    };
  });

  // Sort by category for display
  const categoryOrder = ['Frame', 'Tyre', 'Gear Set', 'Seat', 'Brake'];
  components.sort((a, b) => {
    const aIdx = categoryOrder.indexOf(a.category);
    const bIdx = categoryOrder.indexOf(b.category);
    return (aIdx === -1 ? 99 : aIdx) - (bIdx === -1 ? 99 : bIdx);
  });

  // Calculate total price
  const totalPrice = components.reduce((sum, c) => sum + c.subtotal, 0);

  return {
    configurationId: configuration._id,
    configurationName: configuration.configurationName,
    description: configuration.description,
    components,
    totalPrice,
    createdBy: configuration.createdBy,
    calculatedAt: new Date(),
  };
};

module.exports = { calculateConfigurationPrice };
