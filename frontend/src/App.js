// src/App.js - Main App with Routing
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Borrowers from './pages/Borrowers';
import BorrowerDetail from './pages/BorrowerDetail';
import Loans from './pages/Loans';
import LoanDetail from './pages/LoanDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

// Protected Route wrapper
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="borrowers" element={<Borrowers />} />
        <Route path="borrowers/:id" element={<BorrowerDetail />} />
        <Route path="loans" element={<Loans />} />
        <Route path="loans/:id" element={<LoanDetail />} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' },
            success: { iconTheme: { primary: '#10b981', secondary: '#1e293b' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#1e293b' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
