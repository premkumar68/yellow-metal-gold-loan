const mongoose = require('mongoose');

const loanSchemeSchema = new mongoose.Schema(
  {
    schemeId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Bullet Repayment Plan', 'Monthly EMI Plan'],
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    maxLTV: {
      type: Number,
      required: true,
      default: 75,
      max: 75,
      min: 1,
    },
    tenureMonths: {
      type: Number,
      default: 12,
    },
    description: {
      type: String,
      default: '',
    },
    bulletFeatures: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('LoanScheme', loanSchemeSchema);
