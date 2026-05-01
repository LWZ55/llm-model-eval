import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

export interface Account {
  id: number;
  name: string;
  type: 'bank' | 'securities' | 'transit';
  currency: 'CNY' | 'USD' | 'HKD';
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  type: 'deposit' | 'debt';
  amount: number;
  description: string;
  date: string;
  created_at: string;
}

export interface StockHolding {
  id: number;
  account_id: number;
  symbol: string;
  name: string;
  quantity: number;
  cost_price: number;
  current_price: number;
  updated_at: string;
}

export interface AccountSummary {
  id: number;
  name: string;
  type: string;
  currency: string;
  balance: number;
  balance_cny: number;
}

export interface DashboardSummary {
  total_balance_cny: number;
  accounts: AccountSummary[];
  currency_rates: {
    CNY_to_USD: number;
    CNY_to_HKD: number;
  };
}

export interface BalanceHistoryItem {
  date: string;
  balance: number;
}

export interface BalanceHistory {
  account_id: number;
  account_name: string;
  currency: string;
  history: BalanceHistoryItem[];
}

// Account APIs
export const getAccounts = () => api.get<Account[]>('/accounts').then(res => res.data);
export const createAccount = (data: { name: string; type: string; currency: string }) =>
  api.post<Account>('/accounts', data).then(res => res.data);
export const getAccount = (id: number) => api.get<Account>(`/accounts/${id}`).then(res => res.data);
export const updateAccount = (id: number, data: { name?: string; currency?: string }) =>
  api.put<Account>(`/accounts/${id}`, data).then(res => res.data);
export const deleteAccount = (id: number) => api.delete(`/accounts/${id}`);

// Transaction APIs
export const getTransactions = (accountId: number) =>
  api.get<Transaction[]>(`/accounts/${accountId}/transactions`).then(res => res.data);
export const createTransaction = (accountId: number, data: {
  type: string;
  amount: number;
  description: string;
  date: string;
}) => api.post<Transaction>(`/accounts/${accountId}/transactions`, data).then(res => res.data);
export const deleteTransaction = (id: number) => api.delete(`/transactions/${id}`);

// Stock Holding APIs
export const getHoldings = (accountId: number) =>
  api.get<StockHolding[]>(`/accounts/${accountId}/holdings`).then(res => res.data);
export const createHolding = (accountId: number, data: {
  symbol: string;
  name: string;
  quantity: number;
  cost_price: number;
  current_price: number;
}) => api.post<StockHolding>(`/accounts/${accountId}/holdings`, data).then(res => res.data);
export const updateHolding = (id: number, data: { current_price: number; quantity?: number }) =>
  api.put<StockHolding>(`/holdings/${id}`, data).then(res => res.data);
export const deleteHolding = (id: number) => api.delete(`/holdings/${id}`);

// Dashboard APIs
export const getDashboardSummary = () =>
  api.get<DashboardSummary>('/dashboard/summary').then(res => res.data);
export const getAccountBalanceHistory = (accountId: number) =>
  api.get<BalanceHistory>(`/accounts/${accountId}/balance-history`).then(res => res.data);
export const getTotalBalanceHistory = () =>
  api.get<{ history: BalanceHistoryItem[] }>('/dashboard/balance-history').then(res => res.data);

// Currency API
export const getCurrencyRates = () =>
  api.get<{ CNY_to_USD: number; CNY_to_HKD: number; updated_at: string }>('/currencies/rates')
    .then(res => res.data);