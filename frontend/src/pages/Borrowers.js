// src/pages/Borrowers.js - Borrowers List & Management
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getBorrowers, createBorrower, updateBorrower, deleteBorrower } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/format';

const EMPTY_FORM = { name: '', phone: '', email: '', notes: '' };

const BorrowerModal = ({ borrower, onClose, onSave }) => {
  const [form, setForm] = useState(borrower || EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error('Name is required');
    setSaving(true);
    try {
      if (borrower?._id) {
        const { data } = await updateBorrower(borrower._id, form);
        onSave(data, 'update');
        toast.success('Borrower updated!');
      } else {
        const { data } = await createBorrower(form);
        onSave(data, 'create');
        toast.success('Borrower added!');
      }
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving borrower');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{borrower?._id ? 'Edit Borrower' : 'Add New Borrower'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: 20 }}>✕</button>
        </div>
        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input className="form-input" placeholder="e.g. Ramesh Kumar" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" placeholder="+91 98765 43210" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="email@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" rows={3} placeholder="Any additional info..." value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
            {saving ? <span className="spinner" /> : (borrower?._id ? 'Update' : 'Add Borrower')}
          </button>
        </div>
      </div>
    </div>
  );
};

const Borrowers = () => {
  const [borrowers, setBorrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'create' | borrower object
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const { data } = await getBorrowers();
      setBorrowers(data);
    } catch (err) {
      toast.error('Failed to load borrowers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (b) => {
    if (!window.confirm(`Delete ${b.name} and all their loans? This cannot be undone.`)) return;
    try {
      await deleteBorrower(b._id);
      setBorrowers((prev) => prev.filter((x) => x._id !== b._id));
      toast.success('Borrower deleted');
    } catch (err) {
      toast.error('Failed to delete borrower');
    }
  };

  const handleSave = (saved, action) => {
    if (action === 'create') {
      setBorrowers((prev) => [saved, ...prev]);
    } else {
      setBorrowers((prev) => prev.map((b) => (b._id === saved._id ? { ...b, ...saved } : b)));
    }
  };

  const filtered = borrowers.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase()) ||
    b.phone?.includes(search)
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Borrowers</h1>
          <p className="page-subtitle">{borrowers.length} people in your loan book</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal('create')}>+ Add Borrower</button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          className="form-input"
          placeholder="🔍  Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ maxWidth: 360 }}
        />
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 15 }}>No borrowers yet. Add your first one!</div>
        </div>
      ) : (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Borrower</th>
                <th>Phone</th>
                <th>Total Lent</th>
                <th>Active Loans</th>
                <th>Member Since</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b._id}>
                  <td>
                    <Link to={`/borrowers/${b._id}`} style={{ textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'var(--accent-glow)', color: 'var(--accent)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 14, flexShrink: 0
                        }}>
                          {b.name[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{b.name}</div>
                          {b.email && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{b.email}</div>}
                        </div>
                      </div>
                    </Link>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{b.phone || '—'}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{formatCurrency(b.totalLent)}</td>
                  <td>
                    <span className={`badge ${b.activeLoans > 0 ? 'badge-active' : 'badge-paid'}`}>
                      {b.activeLoans} active
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{formatDate(b.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setModal(b)}>Edit</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <BorrowerModal
          borrower={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Borrowers;
