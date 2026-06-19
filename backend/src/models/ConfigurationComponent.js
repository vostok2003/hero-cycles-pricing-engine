const mongoose = require('mongoose');

/**
 * ConfigurationComponent Schema
 * Junction table linking configurations to components with quantity
 */
const configurationComponentSchema = new mongoose.Schema(
  {
    configurationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Configuration',
      required: [true, 'Configuration ID is required'],
    },
    componentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component',
      required: [true, 'Component ID is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
  },
  { timestamps: true }
);

// Compound index to prevent duplicate component in same configuration
configurationComponentSchema.index({ configurationId: 1, componentId: 1 }, { unique: true });

module.exports = mongoose.model('ConfigurationComponent', configurationComponentSchema);
