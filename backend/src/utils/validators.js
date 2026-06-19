const { body, param } = require('express-validator');

/**
 * Validation rules for user registration
 */
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'salesperson']).withMessage('Role must be admin or salesperson'),
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Validation rules for component creation/update
 */
const componentValidation = [
  body('componentName').trim().notEmpty().withMessage('Component name is required'),
  body('category').isIn(['Frame', 'Tyre', 'Gear Set', 'Seat', 'Brake']).withMessage('Invalid category'),
  body('currentPrice').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('isMandatory').optional().isBoolean().withMessage('isMandatory must be boolean'),
];

/**
 * Validation rules for price update
 */
const priceUpdateValidation = [
  body('componentId').notEmpty().withMessage('Component ID is required'),
  body('newPrice').isFloat({ min: 0 }).withMessage('New price must be a non-negative number'),
];

/**
 * Validation rules for configuration
 */
const configurationValidation = [
  body('configurationName').trim().notEmpty().withMessage('Configuration name is required'),
  body('description').optional().trim(),
];

module.exports = {
  registerValidation,
  loginValidation,
  componentValidation,
  priceUpdateValidation,
  configurationValidation,
};
