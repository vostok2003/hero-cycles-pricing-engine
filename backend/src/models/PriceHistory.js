const mongoose = require('mongoose');

/**
 * PriceHistory Schema
 * Tracks all price changes for components
 */
const priceHistorySchema = new mongoose.Schema(
  {
    componentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Component',
      required: [true, 'Component ID is required'],
    },
    oldPrice: {
      type: Number,
      required: [true, 'Old price is required'],
      min: [0, 'Price cannot be negative'],
    },
    newPrice: {
      type: Number,
      required: [true, 'New price is required'],
      min: [0, 'Price cannot be negative'],
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Updated by user is required'],
    },
    effectiveDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

priceHistorySchema.index({ componentId: 1, effectiveDate: -1 });

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
