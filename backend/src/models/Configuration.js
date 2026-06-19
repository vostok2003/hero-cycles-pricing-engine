const mongoose = require('mongoose');

/**
 * Configuration Schema
 * Represents a bicycle configuration (e.g., Mountain Bike, Road Bike)
 */
const configurationSchema = new mongoose.Schema(
  {
    configurationName: {
      type: String,
      required: [true, 'Configuration name is required'],
      trim: true,
      maxlength: [150, 'Configuration name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by user is required'],
    },
  },
  { timestamps: true }
);

configurationSchema.index({ configurationName: 'text' });

module.exports = mongoose.model('Configuration', configurationSchema);
