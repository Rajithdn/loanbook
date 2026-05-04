// src/pages/Loans.js - All Loans with Add Loan Modal
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getLoans, createLoan, deleteLoan, getBorrowers } from '../utils/api';
import { formatCurrency, formatDate, daysFromNow, calcSimpleInterest, calcCompoundInterest } from '../utils/format';

const EMPTY_LOAN = {
  borrower: '', principal: '', interestRate: '', interestType: 'simple',
  compoundFrequency: 'monthly', startDate: new Date().toISOString().split('T')[0],
  durationMonths: 12, purpose: ''
};

const LoanModal = ({ onClose, onSave, borrowers }) => {
  const [form, setForm] = useState(EMPTY_LOAN);
  const [saving, setSaving] = useState(false);

  const upd = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  // Live calculation preview
  const P = parseFloat(form.principal) || 0;
  const R = parseFloat(form.interestRate) || 0;
  const T = parseInt(form.durationMonths) || 0;
  const interest = form.interestType === 'simple'
    ? calcSimpleInterest(P, R, T)
    : calcCompoundInterest(P, R, T, form.compoundFrequency);
  const total = P + interest;
  const dueDate = form.startDate && T ? (() => {
    const d = new Date(form.startDate); d.setMonth(d.getMonth() + T); return d.toISOString().split('T')[0];
  })() : '';

  const handleSubmit = async () => {
    if (!form.borrower) return toast.error('Select a borrower');
    if (!P || P <= 0) return toast.error('Enter a valid principal amount');
    if (R < 0) return toast.error('Interest rate cannot be negative');
    if (!T || T < 1) return toast.error('Duration must be at least 1 month');

    setSaving(true);
    try {
      const { data } = await createLoan({ ...form, principal: P, interestRate: R, durationMonths: T });
      onSave(data);
      toast.success('Loan created!');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error creating loan');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 560 }}>
        <div className="modal-header">
          <h3>Create New Loan</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Borrower */}
          <div className="form-group">
            <label className="form-label">Borrower *</label>
            <select className="form-select" value={form.borrower} onChange={(e) => upd('borrower', e.target.value)}>
              <option value="">Select borrower...</option>
              {borrowers.map((b) => <option key={b._id} value={b._id}>{b.name} {b.phone ? `(${b.phone})` : ''}</option>)}
            </select>
          </div>

          {/* Amount & Rate */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Principal Amount (₹) *</label>
              <input className="form-input" type="number" placeholder="e.g. 50000" value={form.principal} onChange={(e) => upd('principal', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Interest Rate (% p.a.) *</label>
              <input className="form-input" type="number" step="0.1" placeholder="e.g. 12" value={form.interestRate} onChange={(e) => upd('interestRate', e.target.value)} />
            </div>
          </div>

          {/* Interest Type */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Interest Type</label>
              <select className="form-select" value={form.interestType} onChange={(e) => upd('interestType', e.target.value)}>
                <option value="simple">Simple Interest</option>
                <option value="compound">Compound Interest</option>
              </select>
            </div>
            {form.interestType === 'compound' && (
              <div className="form-group">
                <label className="form-label">Compounding</label>
                <select className="form-select" value={form.compoundFrequency} onChange={(e) => upd('compoundFrequency', e.target.value)}>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="annually">Annually</option>
                </select>
              </div>
            )}
          </div>

          {/* Date & Duration */}
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input className="form-input" type="date" value={form.startDate} onChange={(e) => upd('startDate', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (months) *</label>
              <input className="form-input" type="number" min="1" placeholder="e.g. 12" value={form.durationMonths} onChange={(e) => upd('durationMonths', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Purpose (optional)</label>
            <input className="form-input" placeholder="e.g. Business, Medical, Personal" value={form.purpose} onChange={(e) => upd('purpose', e.target.value)} />
          </div>

          {/* Live Calculation Preview */}
          {P > 0 && R >= 0 && T > 0 && (
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: 16, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 10 }}>📊 Live Calculation Preview</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                {[
                  { label: 'Interest', value: formatCurrency(interest), color: 'var(--amber)' },
                  { label: 'Total Due', value: formatCurrency(total), color: 'var(--blue)' },
                  { label: 'Due Date', value: dueDate, color: 'var(--text-primary)' },
                ].map((item) => (
                  <div key={item.label} style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: item.color }}>{item.value}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="spinner" /> : 'Create Loan'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const status = searchParams.get('status') || '';
    setStatusFilter(status);
  }, [searchParams]);

  const load = async () => {
    try {
      const [loansRes, borrowersRes] = await Promise.all([getLoans(), getBorrowers()]);
      setLoans(loansRes.data);
      setBorrowers(borrowersRes.data);
    } catch (err) {
      toast.error('Failed to load loans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (loan) => {
    if (!window.confirm(`Delete this loan for ${loan.borrower?.name}? All payments will also be deleted.`)) return;
    try {
      await deleteLoan(loan._id);
      setLoans((prev) => prev.filter((l) => l._id !== loan._id));
      toast.success('Loan deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  const filtered = loans.filter((l) => {
    const matchSearch = l.borrower?.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.purpose?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Loans</h1>
          <p className="page-subtitle">{loans.length} total loans</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Loan</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input className="form-input" placeholder="🔍 Search loans..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ maxWidth: 280 }} />
        <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ maxWidth: 160 }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="partial">Partial</option>
          <option value="overdue">Overdue</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div style={{ color: 'var(--text-secondary)' }}>No loans found. Create your first loan!</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Principal</th>
                <th>Total Due</th>
                <th>Paid</th>
                <th>Balance</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((loan) => {
                const days = daysFromNow(loan.dueDate);
                return (
                  <tr key={loan._id}>
                    <td>
                      <Link to={`/loans/${loan._id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{loan.borrower?.name}</div>
                        {loan.purpose && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{loan.purpose}</div>}
                      </Link>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(loan.principal)}</td>
                    <td>{formatCurrency(loan.totalAmount)}</td>
                    <td style={{ color: 'var(--green)' }}>{formatCurrency(loan.paidAmount)}</td>
                    <td style={{ fontWeight: 700, color: loan.remainingBalance > 0 ? 'var(--amber)' : 'var(--green)' }}>
                      {formatCurrency(loan.remainingBalance)}
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>{formatDate(loan.dueDate)}</div>
                      {loan.status !== 'paid' && (
                        <div style={{ fontSize: 11, color: days < 0 ? 'var(--red)' : days < 30 ? 'var(--amber)' : 'var(--text-muted)' }}>
                          {days < 0 ? `${Math.abs(days)}d overdue` : `${days}d left`}
                        </div>
                      )}
                    </td>
                    <td><span className={`badge badge-${loan.status}`}>{loan.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <Link to={`/loans/${loan._id}`} className="btn btn-ghost btn-sm">View</Link>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(loan)}>Del</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <LoanModal
          borrowers={borrowers}
          onClose={() => setShowModal(false)}
          onSave={(loan) => setLoans((prev) => [loan, ...prev])}
        />
      )}
    </div>
  );
};

export default Loans;
