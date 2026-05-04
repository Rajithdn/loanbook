// models/Loan.js - Loan Schema with Interest Calculation
const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Borrower',
      required: [true, 'Borrower is required'],
    },
    principal: {
      type: Number,
      required: [true, 'Principal amount is required'],
      min: [1, 'Principal must be greater than 0'],
    },
    interestRate: {
      type: Number,
      required: [true, 'Interest rate is required'],
      min: [0, 'Interest rate cannot be negative'],
    },
    interestType: {
      type: String,
      enum: ['simple', 'compound'],
      default: 'simple',
    },
    compoundFrequency: {
      // For compound interest: monthly, quarterly, annually
      type: String,
      enum: ['monthly', 'quarterly', 'annually'],
      default: 'monthly',
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    durationMonths: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [1, 'Duration must be at least 1 month'],
    },
    // Auto-calculated fields (stored for performance)
    totalInterest: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: 0,
    },
    dueDate: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['active', 'paid', 'overdue', 'partial'],
      default: 'active',
    },
    purpose: {
      type: String,
      maxlength: [200, 'Purpose cannot exceed 200 characters'],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to auto-calculate interest and due date
loanSchema.pre('save', function (next) {
  const P = this.principal;
  const R = this.interestRate / 100;
  const T = this.durationMonths / 12; // Convert months to years

  if (this.interestType === 'simple') {
    // Simple Interest: SI = P * R * T
    this.totalInterest = Math.round(P * R * T * 100) / 100;
  } else {
    // Compound Interest: A = P * (1 + R/n)^(n*T) - P
    const n = this.compoundFrequency === 'monthly' ? 12
      : this.compoundFrequency === 'quarterly' ? 4
      : 1; // annually
    this.totalInterest = Math.round((P * Math.pow(1 + R / n, n * T) - P) * 100) / 100;
  }

  this.totalAmount = Math.round((P + this.totalInterest) * 100) / 100;

  // Calculate due date
  const due = new Date(this.startDate);
  due.setMonth(due.getMonth() + this.durationMonths);
  this.dueDate = due;

  next();
});

module.exports = mongoose.model('Loan', loanSchema);
