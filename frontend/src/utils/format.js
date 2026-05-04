// src/utils/format.js - Formatting helpers

export const formatCurrency = (amount, currency = '₹') =>
  `${currency}${Number(amount || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const formatDate = (date) =>
  date ? new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  }) : '—';

export const daysFromNow = (date) => {
  const diff = new Date(date) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const getStatusColor = (status) => ({
  active: '#3b82f6',
  paid: '#10b981',
  overdue: '#ef4444',
  partial: '#f59e0b',
}[status] || '#6b7280');

export const getStatusBg = (status) => ({
  active: 'rgba(59,130,246,0.12)',
  paid: 'rgba(16,185,129,0.12)',
  overdue: 'rgba(239,68,68,0.12)',
  partial: 'rgba(245,158,11,0.12)',
}[status] || 'rgba(107,114,128,0.12)');

export const calcSimpleInterest = (P, R, months) =>
  Math.round(P * (R / 100) * (months / 12) * 100) / 100;

export const calcCompoundInterest = (P, R, months, freq = 'monthly') => {
  const n = freq === 'monthly' ? 12 : freq === 'quarterly' ? 4 : 1;
  const T = months / 12;
  return Math.round((P * Math.pow(1 + R / 100 / n, n * T) - P) * 100) / 100;
};
