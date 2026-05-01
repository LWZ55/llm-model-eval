import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Accounts
export const getAccounts = () => api.get('/accounts').then(r => r.data);
export const getAccount = (id) => api.get(`/accounts/${id}`).then(r => r.data);
export const createAccount = (data) => api.post('/accounts', data).then(r => r.data);
export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data).then(r => r.data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`).then(r => r.data);

// Account Balance
export const getAccountBalance = (id) => api.get(`/accounts/${id}/balance`).then(r => r.data);

// Deposits
export const getDeposits = (accountId) => api.get(`/accounts/${accountId}/deposits`).then(r => r.data);
export const createDeposit = (accountId, data) => api.post(`/accounts/${accountId}/deposits`, data).then(r => r.data);
export const updateDeposit = (id, data) => api.put(`/accounts/deposits/${id}`, data).then(r => r.data);
export const deleteDeposit = (id) => api.delete(`/accounts/deposits/${id}`).then(r => r.data);

// Liabilities
export const getLiabilities = (accountId) => api.get(`/accounts/${accountId}/liabilities`).then(r => r.data);
export const createLiability = (accountId, data) => api.post(`/accounts/${accountId}/liabilities`, data).then(r => r.data);
export const updateLiability = (id, data) => api.put(`/accounts/liabilities/${id}`, data).then(r => r.data);
export const deleteLiability = (id) => api.delete(`/accounts/liabilities/${id}`).then(r => r.data);

// Stock Holdings
export const getHoldings = (accountId) => api.get(`/accounts/${accountId}/holdings`).then(r => r.data);
export const createHolding = (accountId, data) => api.post(`/accounts/${accountId}/holdings`, data).then(r => r.data);
export const updateHolding = (id, data) => api.put(`/accounts/holdings/${id}`, data).then(r => r.data);
export const deleteHolding = (id) => api.delete(`/accounts/holdings/${id}`).then(r => r.data);

// Balance Snapshots
export const getSnapshots = (accountId) => api.get(`/accounts/${accountId}/snapshots`).then(r => r.data);

// Dashboard
export const getDashboardSummary = () => api.get('/dashboard/summary').then(r => r.data);
export const getAccountsBalance = () => api.get('/dashboard/accounts-balance').then(r => r.data);

export default api;
