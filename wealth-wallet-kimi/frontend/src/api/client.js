import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

export const getAccounts = () => api.get('/accounts/');
export const getAccount = (id) => api.get(`/accounts/${id}`);
export const createAccount = (data) => api.post('/accounts/', data);
export const updateAccount = (id, data) => api.put(`/accounts/${id}`, data);
export const deleteAccount = (id) => api.delete(`/accounts/${id}`);

export const getTransactions = (accountId) => api.get('/transactions/', { params: { account_id: accountId } });
export const createTransaction = (data) => api.post('/transactions/', data);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const getBalanceHistory = (accountId) => api.get(`/transactions/account/${accountId}/history`);

export const getHoldings = (accountId) => api.get('/holdings/', { params: { account_id: accountId } });
export const createHolding = (data) => api.post('/holdings/', data);
export const updateHolding = (id, data) => api.put(`/holdings/${id}`, data);
export const deleteHolding = (id) => api.delete(`/holdings/${id}`);

export const getDashboardBalance = () => api.get('/dashboard/balance');
