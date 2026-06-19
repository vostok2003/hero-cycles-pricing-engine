const express = require('express');
const router = express.Router();
const {
  getComponents,
  getAllComponents,
  createComponent,
  updateComponent,
  deleteComponent,
} = require('../controllers/componentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { componentValidation } = require('../utils/validators');

// All routes require authentication
router.use(protect);

router.get('/all', getAllComponents);
router.get('/', getComponents);
router.post('/', authorize('admin'), componentValidation, createComponent);
router.put('/:id', authorize('admin'), componentValidation, updateComponent);
router.delete('/:id', authorize('admin'), deleteComponent);

module.exports = router;
