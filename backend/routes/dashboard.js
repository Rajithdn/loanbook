// routes/dashboard.js - Dashboard Summary Stats
const express = require('express');
const router = express.Router();
const Loan = require('../models/Loan');
const Payment = require('../models/Payment');
const Borrower = require('../models/Borrower');
const { protect } = require('../middleware/auth');

// @route   GET /api/dashboard
// @desc    Get dashboard summary statistics
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch all loans for this user
    const loans = await Loan.find({ userId }).populate('borrower', 'name phone');
    const payments = await Payment.find({ userId });

    // --- Core Stats ---
    const totalLent = loans.reduce((sum, l) => sum + l.principal, 0);
    const totalExpected = loans.reduce((sum, l) => sum + l.totalAmount, 0);
    const totalReceived = payments.reduce((sum, p) => sum + p.amount, 0);
    const outstandingBalance = totalExpected - totalReceived;

    // --- Loan Status Breakdown ---
    const now = new Date();
    let activeLoans = 0, overdueLoans = 0, paidLoans = 0, partialLoans = 0;

    const loanDetails = await Promise.all(
      loans.map(async (loan) => {
        const loanPayments = payments.filter(
          (p) => p.loan.toString() === loan._id.toString()
        );
        const paid = loanPayments.reduce((sum, p) => sum + p.amount, 0);
        const balance = Math.max(0, loan.totalAmount - paid);

        let status;
        if (balance <= 0.01) { status = 'paid'; paidLoans++; }
        else if (now > loan.dueDate) { status = 'overdue'; overdueLoans++; }
        else if (paid > 0) { status = 'partial'; partialLoans++; }
        else { status = 'active'; activeLoans++; }

        return { ...loan.toObject(), paidAmount: paid, remainingBalance: balance, status };
      })
    );

    // --- Recent Activity (last 5 payments) ---
    const recentPayments = await Payment.find({ userId })
      .populate('borrower', 'name')
      .populate('loan', 'principal')
      .sort({ paymentDate: -1 })
      .limit(5);

    // --- Overdue Loans Detail ---
    const overdueDetails = loanDetails
      .filter((l) => l.status === 'overdue')
      .map((l) => ({
        _id: l._id,
        borrowerName: l.borrower?.name,
        remainingBalance: l.remainingBalance,
        dueDate: l.dueDate,
        daysOverdue: Math.floor((now - new Date(l.dueDate)) / (1000 * 60 * 60 * 24)),
      }));

    // --- Monthly Collection (last 6 months) ---
    const monthlyData = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthPayments = payments.filter((p) => {
        const pd = new Date(p.paymentDate);
        return pd >= monthStart && pd <= monthEnd;
      });

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        collected: monthPayments.reduce((sum, p) => sum + p.amount, 0),
      });
    }

    res.json({
      summary: {
        totalLent,
        totalExpected,
        totalReceived,
        outstandingBalance,
        totalBorrowers: await Borrower.countDocuments({ userId }),
        totalLoans: loans.length,
      },
      loanStatus: { activeLoans, overdueLoans, paidLoans, partialLoans },
      overdueDetails,
      recentPayments,
      monthlyData,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
