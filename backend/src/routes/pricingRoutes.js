const express = require('express');
const router = express.Router();
const {
  updatePrice,
  getPriceHistory,
  getAllPriceHistory,
  getPricingBreakdown,
} = require('../controllers/pricingController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { priceUpdateValidation } = require('../utils/validators');

router.use(protect);

// Price management (admin only)
router.post('/update', authorize('admin'), priceUpdateValidation, updatePrice);
router.get('/history', authorize('admin'), getAllPriceHistory);
router.get('/history/:componentId', authorize('admin'), getPriceHistory);

// Pricing breakdown (all authenticated users)
router.get('/:configurationId', getPricingBreakdown);

module.exports = router;
