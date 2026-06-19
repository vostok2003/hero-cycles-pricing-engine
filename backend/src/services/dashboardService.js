const Component = require('../models/Component');
const Configuration = require('../models/Configuration');
const PriceHistory = require('../models/PriceHistory');

/**
 * Get dashboard summary statistics based on user role
 * @param {string} role - User role (admin | salesperson)
 * @returns {Object} Summary statistics
 */
const getSummary = async (role) => {
  const [totalComponents, totalConfigurations, recentPriceUpdates] = await Promise.all([
    Component.countDocuments(),
    Configuration.countDocuments(),
    PriceHistory.countDocuments({
      effectiveDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    }),
  ]);

  // Category breakdown
  const categoryBreakdown = await Component.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  return {
    totalComponents,
    totalConfigurations,
    recentPriceUpdates,
    categoryBreakdown: categoryBreakdown.map((c) => ({
      category: c._id,
      count: c.count,
    })),
  };
};

/**
 * Get recent price updates (last 10)
 * @returns {Array} Recent price history records
 */
const getRecentPriceUpdates = async () => {
  const updates = await PriceHistory.find()
    .populate('componentId', 'componentName category')
    .populate('updatedBy', 'name email')
    .sort({ effectiveDate: -1 })
    .limit(10);

  return updates;
};

/**
 * Get recent configurations (last 5)
 * @returns {Array} Recent configurations
 */
const getRecentConfigurations = async () => {
  const configs = await Configuration.find()
    .populate('createdBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  return configs;
};

module.exports = { getSummary, getRecentPriceUpdates, getRecentConfigurations };
