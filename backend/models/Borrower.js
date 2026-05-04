// models/Borrower.js - Borrower Schema
const mongoose = require('mongoose');

const borrowerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Borrower name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Phone cannot exceed 20 characters'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    // Reference to user (for multi-user support)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
  }
);

module.exports = mongoose.model('Borrower', borrowerSchema);
