// src/pages/LoanDetail.js - Loan Details + Payment History + Add Payment
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getLoan, createPayment, deletePayment } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/format';

const PAYMENT_METHODS = ['cash', 'bank_transfer', 'upi', 'cheque', 'other'];

const AddPaymentModal = ({ loan, onClose, onSave }) => {
  const [form, setForm] = useState({
    amount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) return toast.error('Enter a valid amount');
    if (amount > loan.remainingBalance + 0.01) return toast.error(`Cannot exceed balance of ${formatCurrency(loan.remainingBalance)}`);

    setSaving(true);
    try {
      const { data } = await createPayment({ loan: loan._id, ...form, amount });
      onSave(data);
      toast.success(`Payment of ${formatCurrency(amount)} recorded!`);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>Record Payment</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 14, display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>Remaining Balance</span>
            <span style={{ fontWeight: 800, color: 'var(--amber)', fontFamily: 'var(--font-display)', fontSize: 18 }}>
              {formatCurrency(loan.remainingBalance)}
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Payment Amount (₹) *</label>
            <input className="form-input" type="number" placeholder="Enter amount" value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
            />
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Max: {formatCurrency(loan.remainingBalance)}
              <button style={{ background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer', marginLeft: 8, fontSize: 11 }}
                onClick={() => setForm({ ...form, amount: loan.remainingBalance.toString() })}>
                Pay full balance
              </button>
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Payment Date</label>
              <input className="form-input" type="date" value={form.paymentDate}
                onChange={(e) => setForm({ ...form, paymentDate: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Payment Method</label>
              <select className="form-select" value={form.paymentMethod}
                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                {PAYMENT_METHODS.map((m) => (
                  <option key={m} value={m}>{m.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <input className="form-input" placeholder="e.g. Partial repayment via UPI" value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Record Payment'}
          </button>
        </div>
      </div>
    </div>
  );
};

const METHOD_ICONS = { cash: '💵', bank_transfer: '🏦', upi: '📱', cheque: '📝', other: '💳' };

const LoanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);

  const load = async () => {
    try {
      const { data } = await getLoan(id);
      setLoan(data);
    } catch {
      toast.error('Loan not found');
      navigate('/loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [id]);

  const handlePaymentSave = (payment) => {
    setLoan((prev) => {
      const newPaid = prev.paidAmount + payment.amount;
      const newBalance = Math.max(0, prev.totalAmount - newPaid);
      const newStatus = newBalance <= 0.01 ? 'paid'
        : new Date() > new Date(prev.dueDate) ? 'overdue'
        : newPaid > 0 ? 'partial' : 'active';
      return {
        ...prev,
        payments: [payment, ...prev.payments],
        paidAmount: newPaid,
        remainingBalance: newBalance,
        status: newStatus,
      };
    });
  };

  const handleDeletePayment = async (paymentId) => {
    if (!window.confirm('Delete this payment record?')) return;
    try {
      await deletePayment(paymentId);
      setLoan((prev) => {
        const deleted = prev.payments.find((p) => p._id === paymentId);
        const newPaid = prev.paidAmount - (deleted?.amount || 0);
        const newBalance = Math.max(0, prev.totalAmount - newPaid);
        return {
          ...prev,
          payments: prev.payments.filter((p) => p._id !== paymentId),
          paidAmount: newPaid,
          remainingBalance: newBalance,
        };
      });
      toast.success('Payment deleted');
    } catch {
      toast.error('Failed to delete payment');
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;
  if (!loan) return null;

  const progress = loan.totalAmount > 0 ? Math.min(100, (loan.paidAmount / loan.totalAmount) * 100) : 0;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/loans" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13 }}>← Back to Loans</Link>
      </div>

      {/* Loan Summary Header */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span className={`badge badge-${loan.status}`}>{loan.status}</span>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                {loan.interestType === 'simple' ? 'Simple' : 'Compound'} Interest
                {loan.interestType === 'compound' && ` (${loan.compoundFrequency})`}
              </span>
            </div>
            <Link to={`/borrowers/${loan.borrower?._id}`} style={{ textDecoration: 'none' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, color: 'var(--text-primary)' }}>
                {loan.borrower?.name}
              </h1>
            </Link>
            {loan.purpose && <div style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 2 }}>Purpose: {loan.purpose}</div>}
          </div>
          {loan.remainingBalance > 0 && (
            <button className="btn btn-primary" onClick={() => setShowPayment(true)}>+ Record Payment</button>
          )}
        </div>

        {/* Key metrics */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 20 }}>
          {[
            { label: 'Principal', value: formatCurrency(loan.principal), color: 'var(--blue)' },
            { label: 'Interest Rate', value: `${loan.interestRate}% p.a.`, color: 'var(--text-primary)' },
            { label: 'Total Interest', value: formatCurrency(loan.totalInterest), color: 'var(--amber)' },
            { label: 'Total Amount', value: formatCurrency(loan.totalAmount), color: 'var(--text-primary)' },
            { label: 'Amount Paid', value: formatCurrency(loan.paidAmount), color: 'var(--green)' },
            { label: 'Balance Due', value: formatCurrency(loan.remainingBalance), color: loan.remainingBalance > 0 ? 'var(--red)' : 'var(--green)' },
          ].map((item) => (
            <div key={item.label} style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 4 }}>{item.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Repayment Progress */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Repayment Progress</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)' }}>{progress.toFixed(1)}%</span>
          </div>
          <div className="progress-bar" style={{ height: 10 }}>
            <div className="progress-fill" style={{ width: `${progress}%`, background: progress >= 100 ? 'var(--green)' : 'linear-gradient(90deg, var(--blue), var(--accent))' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Start: {formatDate(loan.startDate)}</span>
            <span style={{ fontSize: 11, color: loan.status === 'overdue' ? 'var(--red)' : 'var(--text-muted)' }}>Due: {formatDate(loan.dueDate)}</span>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>Payment History</h2>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{loan.payments?.length || 0} payments</span>
        </div>

        {!loan.payments?.length ? (
          <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
            No payments recorded yet.
            {loan.remainingBalance > 0 && (
              <div style={{ marginTop: 12 }}>
                <button className="btn btn-primary btn-sm" onClick={() => setShowPayment(true)}>Record First Payment</button>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {loan.payments.map((p) => (
              <div key={p._id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px' }}>
                <div style={{ fontSize: 24 }}>{METHOD_ICONS[p.paymentMethod] || '💳'}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{formatDate(p.paymentDate)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                    {p.paymentMethod?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
                    {p.notes && ` · ${p.notes}`}
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 800, color: 'var(--green)' }}>
                  +{formatCurrency(p.amount)}
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => handleDeletePayment(p._id)}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {showPayment && (
        <AddPaymentModal
          loan={loan}
          onClose={() => setShowPayment(false)}
          onSave={handlePaymentSave}
        />
      )}
    </div>
  );
};

export default LoanDetail;
