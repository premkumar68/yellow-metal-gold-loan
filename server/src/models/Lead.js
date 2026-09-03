const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    mobileNumber: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'],
    },
    grossWeightGrams: {
      type: Number,
      required: [true, 'Gross weight in grams is required'],
      min: [0.1, 'Gross weight must be greater than 0'],
    },
    netWeightGrams: {
      type: Number,
      required: [true, 'Net weight in grams is required'],
      min: [0.1, 'Net weight must be greater than 0'],
      validate: {
        validator: function (value) {
          return value <= this.grossWeightGrams;
        },
        message: 'Net weight cannot exceed gross weight',
      },
    },
    purityKarat: {
      type: Number,
      required: [true, 'Gold purity is required'],
      enum: [18, 22, 24],
    },
    pureGoldGrams: {
      type: Number,
      required: true,
    },
    appliedGoldRate24K: {
      type: Number,
      required: true,
    },
    calculatedLoanAmount: {
      type: Number,
      required: true,
    },
    selectedPlanId: {
      type: String,
      required: [true, 'Selected loan plan ID is required'],
    },
    status: {
      type: String,
      enum: ['SUBMITTED', 'VERIFIED', 'SANCTIONED', 'REJECTED'],
      default: 'SUBMITTED',
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index on mobileNumber and createdAt for high-speed 7-day deduplication
leadSchema.index({ mobileNumber: 1, createdAt: -1 });

module.exports = mongoose.model('Lead', leadSchema);
