const dashboardService = require('../services/dashboardService');

/**
 * @desc    Get dashboard summary statistics
 * @route   GET /api/dashboard/summary
 * @access  Private
 */
const getDashboardSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary(req.user.role);
    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get recent price updates
 * @route   GET /api/dashboard/recent-price-updates
 * @access  Private
 */
const getRecentPriceUpdates = async (req, res, next) => {
  try {
    const updates = await dashboardService.getRecentPriceUpdates();
    res.json({ success: true, data: updates });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboardSummary, getRecentPriceUpdates };
