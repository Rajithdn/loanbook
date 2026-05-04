// src/pages/Register.js - Registration Page
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Please enter your name');
    if (form.password !== form.confirm) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');

    const result = await register(form.name, form.email, form.password);
    if (result.success) {
      toast.success('Account created! Welcome to LoanBook 🎉');
      navigate('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}>
          <span style={styles.logoIcon}>₹</span>
          <div>
            <div style={styles.logoText}>LoanBook</div>
            <div style={styles.logoSub}>Your personal loan ledger</div>
          </div>
        </div>

        <h2 style={styles.title}>Create Account</h2>
        <p style={styles.subtitle}>Start tracking your loans for free.</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input className="form-input" placeholder="Ramesh Kumar"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-input" type="email" placeholder="you@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Min. 6 characters"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className="form-input" type="password" placeholder="Repeat password"
              value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 15 }} disabled={loading}>
            {loading ? <span className="spinner" /> : 'Create Account →'}
          </button>
        </form>

        <div style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    background: 'var(--bg-primary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(240,165,0,0.06) 0%, transparent 60%)',
  },
  card: {
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: 20,
    padding: '40px 36px',
    width: '100%',
    maxWidth: 400,
  },
  logo: { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 },
  logoIcon: { fontSize: 34, color: 'var(--accent)', fontFamily: 'var(--font-display)', fontWeight: 800, lineHeight: 1 },
  logoText: { fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20 },
  logoSub: { fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.5px' },
  title: { fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 800, marginBottom: 6 },
  subtitle: { color: 'var(--text-secondary)', fontSize: 14, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  footer: { textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 },
};

export default Register;
