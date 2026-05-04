// src/utils/api.js - Configured Axios Instance
import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 globally (auto logout)
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ────────────────────────────────────────────────────────────────────
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);

// ── Dashboard ───────────────────────────────────────────────────────────────
export const getDashboard = () => API.get('/dashboard');

// ── Borrowers ───────────────────────────────────────────────────────────────
export const getBorrowers = () => API.get('/borrowers');
export const getBorrower = (id) => API.get(`/borrowers/${id}`);
export const createBorrower = (data) => API.post('/borrowers', data);
export const updateBorrower = (id, data) => API.put(`/borrowers/${id}`, data);
export const deleteBorrower = (id) => API.delete(`/borrowers/${id}`);

// ── Loans ───────────────────────────────────────────────────────────────────
export const getLoans = (params) => API.get('/loans', { params });
export const getLoan = (id) => API.get(`/loans/${id}`);
export const createLoan = (data) => API.post('/loans', data);
export const updateLoan = (id, data) => API.put(`/loans/${id}`, data);
export const deleteLoan = (id) => API.delete(`/loans/${id}`);

// ── Payments ────────────────────────────────────────────────────────────────
export const getPayments = (params) => API.get('/payments', { params });
export const createPayment = (data) => API.post('/payments', data);
export const deletePayment = (id) => API.delete(`/payments/${id}`);

export default API;
