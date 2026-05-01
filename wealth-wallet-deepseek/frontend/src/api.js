import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// --- Summary ---
export const fetchSummary = () => api.get('/summary').then(r => r.data);

// --- Accounts ---
export const fetchAccounts = () => api.get('/accounts').then(r => r.data);
export const fetchAccount = (id) => api.get(`/accounts/${id}`).then(r => r.data);
export const createAccount = (data) => api.post('/accounts', data).then(r => r.data);
export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data).then(r => r.data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`).then(r => r.data);

// --- Transactions ---
export const fetchTransactions = (accountId) =>
  api.get(`/accounts/${accountId}/transactions`).then(r => r.data);
export const createTransaction = (accountId, data) =>
  api.post(`/accounts/${accountId}/transactions`, data).then(r => r.data);
export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data).then(r => r.data);
export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`).then(r => r.data);

// --- Stock Holdings ---
export const fetchStockHoldings = (accountId) =>
  api.get(`/accounts/${accountId}/stock-holdings`).then(r => r.data);
export const createStockHolding = (accountId, data) =>
  api.post(`/accounts/${accountId}/stock-holdings`, data).then(r => r.data);
export const updateStockHolding = (id, data) =>
  api.put(`/stock-holdings/${id}`, data).then(r => r.data);
export const deleteStockHolding = (id) =>
  api.delete(`/stock-holdings/${id}`).then(r => r.data);

// --- Balance ---
export const fetchBalance = (accountId) =>
  api.get(`/accounts/${accountId}/balance`).then(r => r.data);
export const fetchBalanceHistory = (accountId, days = 30) =>
  api.get(`/accounts/${accountId}/balance-history`, { params: { days } }).then(r => r.data);
