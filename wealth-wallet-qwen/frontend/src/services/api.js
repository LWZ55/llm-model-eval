import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Account APIs
export const fetchAccounts = async () => {
  const response = await api.get('/accounts/');
  return response.data;
};

export const createAccount = async (accountData) => {
  const response = await api.post('/accounts/', accountData);
  return response.data;
};

export const updateAccount = async (accountId, accountData) => {
  const response = await api.put(`/accounts/${accountId}`, accountData);
  return response.data;
};

export const deleteAccount = async (accountId) => {
  const response = await api.delete(`/accounts/${accountId}`);
  return response.data;
};

export const getAccountBalance = async (accountId) => {
  const response = await api.get(`/accounts/${accountId}/balance`);
  return response.data;
};

// Transaction APIs
export const fetchTransactions = async (accountId) => {
  const response = await api.get(`/accounts/${accountId}/transactions/`);
  return response.data;
};

export const addTransaction = async (accountId, transactionData) => {
  const response = await api.post(`/accounts/${accountId}/transactions/`, transactionData);
  return response.data;
};

// Stock Holding APIs
export const fetchHoldings = async (accountId) => {
  const response = await api.get(`/accounts/${accountId}/holdings`);
  return response.data;
};

export const addHolding = async (accountId, holdingData) => {
  const response = await api.post(`/accounts/${accountId}/holdings`, holdingData);
  return response.data;
};

export const updateHolding = async (holdingId, holdingData) => {
  const response = await api.put(`/holdings/${holdingId}`, holdingData);
  return response.data;
};

export const deleteHolding = async (holdingId) => {
  const response = await api.delete(`/holdings/${holdingId}`);
  return response.data;
};

// Dashboard APIs
export const fetchDashboardSummary = async () => {
  const response = await api.get('/dashboard/summary');
  return response.data;
};

export const fetchAccountHistory = async (accountId) => {
  const response = await api.get(`/dashboard/account-history/${accountId}`);
  return response.data;
};

export const fetchCurrencyBreakdown = async () => {
  const response = await api.get('/dashboard/currency-breakdown');
  return response.data;
};

export default api;
