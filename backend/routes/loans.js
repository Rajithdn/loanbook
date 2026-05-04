// routes/loans.js - Loan Management Routes
const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const { protect } = require('../middleware/auth');

// Helper: Calculate remaining balance for a loan
const calcBalance = async (loanId, totalAmount) => {
  const payments = await Payment.find({ loan: loanId });
  const paid = payments.reduce((sum, p) => sum + p.amount, 0);
  return { paid, balance: Math.max(0, totalAmount - paid) };
};

// @route   GET /api/loans
// @desc    Get all loans with payment info
router.get('/', protect, async (req, res) => {
  try {
    const { status, borrower, search } = req.query;
    const query = { userId: req.user._id };

    if (status) query.status = status;
    if (borrower) query.borrower = borrower;

    const loans = await Loan.find(query)
      .populate('borrower', 'name phone')
      .sort({ createdAt: -1 });

    // Attach payment info and auto-update overdue status
    const loansWithPayments = await Promise.all(
      loans.map(async (loan) => {
        const { paid, balance } = await calcBalance(loan._id, loan.totalAmount);
        
        // Auto-update status based on balance and due date
        let status = loan.status;
        if (balance === 0) status = 'paid';
        else if (new Date() > loan.dueDate) status = 'overdue';
        else if (paid > 0) status = 'partial';
        else status = 'active';

        // Update status in DB if changed
        if (status !== loan.status) {
          await Loan.findByIdAndUpdate(loan._id, { status });
        }

        return { ...loan.toObject(), paidAmount: paid, remainingBalance: balance, status };
      })
    );

    res.json(loansWithPayments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/loans
// @desc    Create a new loan
router.post('/', protect, async (req, res) => {
  try {
    const {
      borrower, principal, interestRate, interestType,
      compoundFrequency, startDate, durationMonths, purpose
    } = req.body;

    const loan = await Loan.create({
      borrower, principal, interestRate, interestType,
      compoundFrequency, startDate, durationMonths, purpose,
      userId: req.user._id,
    });

    await loan.populate('borrower', 'name phone');
    res.status(201).json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/loans/:id
// @desc    Get single loan with full payment history
router.get('/:id', protect, async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id })
      .populate('borrower', 'name phone email notes');

    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    const payments = await Payment.find({ loan: loan._id }).sort({ paymentDate: -1 });
    const { paid, balance } = await calcBalance(loan._id, loan.totalAmount);

    res.json({ ...loan.toObject(), payments, paidAmount: paid, remainingBalance: balance });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/loans/:id
// @desc    Update a loan
router.put('/:id', protect, async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    // Update fields and trigger pre-save recalculation
    Object.assign(loan, req.body);
    await loan.save();
    await loan.populate('borrower', 'name phone');

    res.json(loan);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/loans/:id
// @desc    Delete a loan and its payments
router.delete('/:id', protect, async (req, res) => {
  try {
    const loan = await Loan.findOne({ _id: req.params.id, userId: req.user._id });
    if (!loan) return res.status(404).json({ message: 'Loan not found' });

    await Payment.deleteMany({ loan: loan._id });
    await loan.deleteOne();

    res.json({ message: 'Loan deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
