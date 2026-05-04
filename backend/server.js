// server.js - Main Express Server Entry Point
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to MongoDB Atlas
connectDB();

// ── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logger (dev)
app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// ── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth'));
app.use('/api/borrowers', require('./routes/borrowers'));
app.use('/api/loans', require('./routes/loans'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Error Handler ───────────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// 404 handler
app.use('*', (_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});

module.exports = app;
