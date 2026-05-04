// routes/payments.js - Payment Routes
const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const Loan = require('../models/Loan');
const { protect } = require('../middleware/auth');

// @route   GET /api/payments
// @desc    Get all payments (optionally filter by loan)
router.get('/', protect, async (req, res) => {
  try {
    const query = { userId: req.user._id };
    if (req.query.loan) query.loan = req.query.loan;

    const payments = await Payment.find(query)
      .populate('borrower', 'name')
      .populate('loan', 'principal totalAmount')
      .sort({ paymentDate: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/payments
// @desc    Record a new payment
router.post('/', protect, async (req, res) => {
  try {
    const { loan: loanId, amount, paymentDate, paymentMethod, notes } = req.body;

    // Verify loan belongs to user
    const loan = await Loan.findOne({ _id: loanId, userId: req.user._id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    // Validate payment doesn't exceed remaining balance
    const existingPayments = await Payment.find({ loan: loanId });
    const totalPaid = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const balance = loan.totalAmount - totalPaid;

    if (amount > balance + 0.01) {
      return res.status(400).json({
        message: `Payment amount (${amount}) exceeds remaining balance (${balance.toFixed(2)})`,
      });
    }

    const payment = await Payment.create({
      loan: loanId,
      borrower: loan.borrower,
      amount,
      paymentDate: paymentDate || Date.now(),
      paymentMethod,
      notes,
      userId: req.user._id,
    });

    // Update loan status after payment
    const newTotalPaid = totalPaid + amount;
    let status = 'partial';
    if (newTotalPaid >= loan.totalAmount - 0.01) status = 'paid';
    else if (new Date() > loan.dueDate) status = 'overdue';
    await Loan.findByIdAndUpdate(loanId, { status });

    res.status(201).json(payment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/payments/:id
// @desc    Delete a payment (undo)
router.delete('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findOne({ _id: req.params.id, userId: req.user._id });
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    await payment.deleteOne();
    res.json({ message: 'Payment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
