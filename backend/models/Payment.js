// models/Payment.js - Payment Schema
const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    loan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Loan',
      required: [true, 'Loan reference is required'],
    },
    borrower: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Borrower',
      required: true,
    },
    amount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0.01, 'Payment must be greater than 0'],
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
    paymentMethod: {
      type: String,
      enum: ['cash', 'bank_transfer', 'upi', 'cheque', 'other'],
      default: 'cash',
    },
    notes: {
      type: String,
      maxlength: [300, 'Notes cannot exceed 300 characters'],
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

module.exports = mongoose.model('Payment', paymentSchema);
