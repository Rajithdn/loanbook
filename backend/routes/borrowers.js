// routes/borrowers.js - Borrower CRUD Routes
const express = require('express');
const router = express.Router();
const Borrower = require('../models/Borrower');
const Loan = require('../models/Loan');
const { protect } = require('../middleware/auth');

// @route   GET /api/borrowers
// @desc    Get all borrowers (with loan summary)
router.get('/', protect, async (req, res) => {
  try {
    const borrowers = await Borrower.find({ userId: req.user._id }).sort({ createdAt: -1 });

    // Attach loan summary to each borrower
    const borrowersWithStats = await Promise.all(
      borrowers.map(async (b) => {
        const loans = await Loan.find({ borrower: b._id, userId: req.user._id });
        const totalLent = loans.reduce((sum, l) => sum + l.principal, 0);
        const activeLoans = loans.filter((l) => l.status !== 'paid').length;
        return { ...b.toObject(), totalLent, activeLoans, totalLoans: loans.length };
      })
    );

    res.json(borrowersWithStats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/borrowers
// @desc    Create a new borrower
router.post('/', protect, async (req, res) => {
  try {
    const { name, phone, email, notes } = req.body;
    const borrower = await Borrower.create({
      name,
      phone,
      email,
      notes,
      userId: req.user._id,
    });
    res.status(201).json(borrower);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   GET /api/borrowers/:id
// @desc    Get single borrower with their loans
router.get('/:id', protect, async (req, res) => {
  try {
    const borrower = await Borrower.findOne({ _id: req.params.id, userId: req.user._id });
    if (!borrower) return res.status(404).json({ message: 'Borrower not found' });

    const loans = await Loan.find({ borrower: req.params.id, userId: req.user._id });
    res.json({ borrower, loans });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   PUT /api/borrowers/:id
// @desc    Update a borrower
router.put('/:id', protect, async (req, res) => {
  try {
    const borrower = await Borrower.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!borrower) return res.status(404).json({ message: 'Borrower not found' });
    res.json(borrower);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// @route   DELETE /api/borrowers/:id
// @desc    Delete a borrower (and their loans/payments)
router.delete('/:id', protect, async (req, res) => {
  try {
    const borrower = await Borrower.findOne({ _id: req.params.id, userId: req.user._id });
    if (!borrower) return res.status(404).json({ message: 'Borrower not found' });

    // Cascade delete associated loans and payments
    const Payment = require('../models/Payment');
    const loans = await Loan.find({ borrower: req.params.id });
    for (const loan of loans) {
      await Payment.deleteMany({ loan: loan._id });
    }
    await Loan.deleteMany({ borrower: req.params.id });
    await borrower.deleteOne();

    res.json({ message: 'Borrower and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
