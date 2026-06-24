const Component = require('../models/Component');

/** Categories that must always be present in a valid configuration */
const MANDATORY_CATEGORIES = ['Frame', 'Tyre', 'Gear Set'];

/**
 * Validate that all mandatory categories are covered by the given component IDs.
 * Fetches component docs from DB and checks categories.
 *
 * @param {string[]} componentIds - Array of component ObjectId strings
 * @returns {{ valid: boolean, missing: string[] }}
 */
const validateMandatoryCategories = async (componentIds) => {
  if (!componentIds || componentIds.length === 0) {
    return { valid: false, missing: [...MANDATORY_CATEGORIES] };
  }

  const componentDocs = await Component.find({ _id: { $in: componentIds } }).select('category');
  const presentCategories = componentDocs.map((c) => c.category);

  const missing = MANDATORY_CATEGORIES.filter((cat) => !presentCategories.includes(cat));

  return { valid: missing.length === 0, missing };
};

/**
 * Check if a user owns a configuration or is an admin.
 * Returns false if salesperson tries to touch another user's config.
 *
 * @param {Object} configuration - Mongoose configuration document
 * @param {Object} user          - req.user from authMiddleware
 * @returns {boolean}
 */
const canMutateConfiguration = (configuration, user) => {
  if (user.role === 'admin') return true;
  return configuration.createdBy.toString() === user._id.toString();
};

module.exports = { MANDATORY_CATEGORIES, validateMandatoryCategories, canMutateConfiguration };
