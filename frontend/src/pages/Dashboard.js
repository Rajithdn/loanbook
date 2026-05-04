// src/pages/Dashboard.js - Main Dashboard with Stats & Charts
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { getDashboard } from '../utils/api';
import { formatCurrency, formatDate } from '../utils/format';

const StatCard = ({ label, value, sub, accent, icon }) => (
  <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
    <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
    <div style={{ fontSize: 28, fontFamily: 'var(--font-display)', fontWeight: 800, color: accent || 'var(--text-primary)', letterSpacing: '-1px' }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    <div style={{ position: 'absolute', top: -10, right: -10, width: 60, height: 60, borderRadius: '50%', background: accent ? `${accent}15` : 'var(--bg-elevated)' }} />
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 4 }}>{label}</div>
      <div style={{ color: 'var(--accent)', fontWeight: 700, fontSize: 16 }}>{formatCurrency(payload[0].value)}</div>
    </div>
  );
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboard()
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 80 }}>
      <div className="spinner" style={{ width: 36, height: 36 }} />
    </div>
  );

  const { summary, loanStatus, overdueDetails, recentPayments, monthlyData } = data || {};

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Your lending overview at a glance</p>
        </div>
        <Link to="/loans" className="btn btn-primary">+ New Loan</Link>
      </div>

      {/* Summary Cards */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <StatCard icon="💰" label="Total Lent" value={formatCurrency(summary?.totalLent)} accent="var(--blue)" sub={`${summary?.totalLoans} loans`} />
        <StatCard icon="✅" label="Received" value={formatCurrency(summary?.totalReceived)} accent="var(--green)" sub="All time collections" />
        <StatCard icon="⏳" label="Outstanding" value={formatCurrency(summary?.outstandingBalance)} accent="var(--amber)" sub="Pending recovery" />
        <StatCard icon="🚨" label="Overdue" value={loanStatus?.overdueLoans || 0} accent="var(--red)" sub="Loans past due date" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20, marginBottom: 24 }}>
        {/* Monthly Collection Chart */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>Monthly Collections</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barSize={28}>
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="collected" radius={[6, 6, 0, 0]}>
                {monthlyData?.map((_, i) => (
                  <Cell key={i} fill={i === (monthlyData.length - 1) ? 'var(--accent)' : 'var(--bg-elevated)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Loan Status Donut */}
        <div className="card">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, marginBottom: 20 }}>Loan Status</h3>
          {[
            { label: 'Active', count: loanStatus?.activeLoans, color: 'var(--blue)' },
            { label: 'Partial', count: loanStatus?.partialLoans, color: 'var(--amber)' },
            { label: 'Overdue', count: loanStatus?.overdueLoans, color: 'var(--red)' },
            { label: 'Paid', count: loanStatus?.paidLoans, color: 'var(--green)' },
          ].map((item) => {
            const total = summary?.totalLoans || 1;
            const pct = Math.round((item.count / total) * 100);
            return (
              <div key={item.label} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: item.color }}>{item.count || 0}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${pct}%`, background: item.color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Overdue Loans */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>⚠ Overdue Loans</h3>
            <Link to="/loans?status=overdue" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none' }}>View all →</Link>
          </div>
          {overdueDetails?.length ? overdueDetails.map((loan) => (
            <Link key={loan._id} to={`/loans/${loan._id}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{loan.borrowerName}</div>
                  <div style={{ fontSize: 12, color: 'var(--red)' }}>{loan.daysOverdue} days overdue</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, color: 'var(--red)', fontSize: 15 }}>{formatCurrency(loan.remainingBalance)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Due: {formatDate(loan.dueDate)}</div>
                </div>
              </div>
            </Link>
          )) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>🎉 No overdue loans!</div>
          )}
        </div>

        {/* Recent Payments */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>Recent Payments</h3>
          </div>
          {recentPayments?.length ? recentPayments.map((p) => (
            <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 14 }}>{p.borrower?.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{formatDate(p.paymentDate)}</div>
              </div>
              <div style={{ fontWeight: 700, color: 'var(--green)', fontSize: 15 }}>+{formatCurrency(p.amount)}</div>
            </div>
          )) : (
            <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No payments recorded yet</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
