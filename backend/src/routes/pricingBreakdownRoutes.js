const express = require('express');
const router = express.Router();
const { getPricingBreakdown } = require('../controllers/pricingController');
const { protect } = require('../middleware/authMiddleware');

// GET /api/pricing/:configurationId
router.get('/:configurationId', protect, getPricingBreakdown);

module.exports = router;
