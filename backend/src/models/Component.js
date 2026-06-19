const mongoose = require('mongoose');

/**
 * Component Schema
 * Represents a bicycle component (Frame, Tyre, Gear Set, Seat, Brake, etc.)
 */
const componentSchema = new mongoose.Schema(
  {
    componentName: {
      type: String,
      required: [true, 'Component name is required'],
      trim: true,
      maxlength: [150, 'Component name cannot exceed 150 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Frame', 'Tyre', 'Gear Set', 'Seat', 'Brake'],
    },
    currentPrice: {
      type: Number,
      required: [true, 'Current price is required'],
      min: [0, 'Price cannot be negative'],
    },
    lastUpdatedDate: {
      type: Date,
      default: Date.now,
    },
    isMandatory: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for faster search
componentSchema.index({ componentName: 'text', category: 1 });

module.exports = mongoose.model('Component', componentSchema);
