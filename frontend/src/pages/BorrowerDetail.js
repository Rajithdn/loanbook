// src/pages/BorrowerDetail.js - Single Borrower with their loans
import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getBorrower } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/format';

const BorrowerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBorrower(id)
      .then((res) => setData(res.data))
      .catch(() => { toast.error('Borrower not found'); navigate('/borrowers'); })
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}><div className="spinner" style={{ width: 36, height: 36 }} /></div>;

  const { borrower, loans } = data;
  const totalLent = loans.reduce((s, l) => s + l.principal, 0);
  const totalAmount = loans.reduce((s, l) => s + l.totalAmount, 0);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <Link to="/borrowers" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: 13 }}>← Back to Borrowers</Link>
      </div>

      {/* Borrower Header */}
      <div className="card" style={{ marginBottom: 24, display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--accent)', color: '#000',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, flexShrink: 0
        }}>
          {borrower.name[0].toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800 }}>{borrower.name}</h1>
          <div style={{ display: 'flex', gap: 20, marginTop: 6, flexWrap: 'wrap' }}>
            {borrower.phone && <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>📞 {borrower.phone}</span>}
            {borrower.email && <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>✉ {borrower.email}</span>}
            {borrower.notes && <span style={{ color: 'var(--text-muted)', fontSize: 13, fontStyle: 'italic' }}>"{borrower.notes}"</span>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, textAlign: 'center' }}>
          <div><div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--blue)' }}>{formatCurrency(totalLent)}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Principal</div></div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div><div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)' }}>{loans.length}</div><div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Loans</div></div>
        </div>
      </div>

      {/* Loans */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 18 }}>Loans</h2>
        <Link to="/loans" className="btn btn-primary btn-sm">+ Add Loan</Link>
      </div>

      {loans.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No loans recorded for this borrower yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {loans.map((loan) => (
            <Link key={loan._id} to={`/loans/${loan._id}`} style={{ textDecoration: 'none' }}>
              <div className="card" style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', cursor: 'pointer' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span className={`badge badge-${loan.status || 'active'}`}>{loan.status || 'active'}</span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{loan.interestType === 'simple' ? 'Simple' : 'Compound'} Interest @ {loan.interestRate}%</span>
                  </div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 800 }}>{formatCurrency(loan.principal)}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Started {formatDate(loan.startDate)} · Due {formatDate(loan.dueDate)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 24, textAlign: 'center', flexWrap: 'wrap' }}>
                  <div><div style={{ fontSize: 15, fontWeight: 700, color: 'var(--amber)' }}>{formatCurrency(loan.totalInterest)}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Interest</div></div>
                  <div><div style={{ fontSize: 15, fontWeight: 700 }}>{formatCurrency(loan.totalAmount)}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Total</div></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default BorrowerDetail;
