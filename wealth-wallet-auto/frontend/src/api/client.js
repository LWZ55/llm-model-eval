import axios from 'axios';

const API_BASE = 'http://localhost:8000/api';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

export const getAccounts = () => client.get('/accounts');
export const getAccount = (id) => client.get(`/accounts/${id}`);
export const createAccount = (data) => client.post('/accounts', data);
export const updateAccount = (id, data) => client.put(`/accounts/${id}`, data);
export const deleteAccount = (id) => client.delete(`/accounts/${id}`);

export const getTransactions = (accountId) => client.get(`/accounts/${accountId}/transactions`);
export const createTransaction = (accountId, data) => client.post(`/accounts/${accountId}/transactions`, data);
export const deleteTransaction = (id) => client.delete(`/transactions/${id}`);

export const getStockHoldings = (accountId) => client.get(`/accounts/${accountId}/stocks`);
export const createStockHolding = (accountId, data) => client.post(`/accounts/${accountId}/stocks`, data);
export const updateStockHolding = (id, data) => client.put(`/stocks/${id}`, data);
export const deleteStockHolding = (id) => client.delete(`/stocks/${id}`);

export const getBalanceHistory = (accountId) => client.get(`/accounts/${accountId}/balance-history`);
export const getTotalBalance = () => client.get('/total-balance');

export default client;
