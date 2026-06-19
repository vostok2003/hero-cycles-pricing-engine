const express = require('express');
const router = express.Router();
const {
  createConfiguration,
  updateConfiguration,
  getConfiguration,
  getAllConfigurations,
  deleteConfiguration,
  updateConfigurationComponents,
} = require('../controllers/configurationController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { configurationValidation } = require('../utils/validators');

router.use(protect);

router.get('/', getAllConfigurations);
router.post('/', authorize('salesperson', 'admin'), configurationValidation, createConfiguration);
router.get('/:id', getConfiguration);
router.put('/:id', authorize('salesperson', 'admin'), configurationValidation, updateConfiguration);
router.delete('/:id', authorize('salesperson', 'admin'), deleteConfiguration);
router.post('/:id/components', authorize('salesperson', 'admin'), updateConfigurationComponents);

module.exports = router;
