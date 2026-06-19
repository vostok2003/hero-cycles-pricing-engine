const express = require('express');
const router = express.Router();
const { getDashboardSummary, getRecentPriceUpdates } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/summary', getDashboardSummary);
router.get('/recent-price-updates', getRecentPriceUpdates);

module.exports = router;
