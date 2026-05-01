import axios from 'axios';

export const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

export type AccountType = 'bank' | 'brokerage' | 'transit_card';
export type Currency = 'CNY' | 'USD' | 'HKD';
export type TxKind = 'deposit' | 'withdraw' | 'liability' | 'repay';

export interface Account {
  id: number;
  name: string;
  type: AccountType;
  currency: Currency;
  created_at: string;
}

export interface AccountWithBalance extends Account {
  balance: string;
  balance_in_base: string;
}

export interface Transaction {
  id: number;
  account_id: number;
  kind: TxKind;
  amount: string;
  note?: string | null;
  date: string;
}

export interface Holding {
  id: number;
  account_id: number;
  symbol: string;
  shares: string;
  cost_basis: string;
  current_price: string;
  currency: Currency;
  market_value: string;
}

export interface HistoryPoint {
  date: string;
  balance: string;
}

export interface CurrencyBreakdown {
  currency: Currency;
  balance: string;
  balance_in_base: string;
}

export interface Summary {
  base_currency: Currency;
  total: string;
  by_currency: CurrencyBreakdown[];
  accounts: AccountWithBalance[];
}

export interface Rate {
  base_ccy: Currency;
  quote_ccy: Currency;
  rate: string;
  updated_at: string;
}

// ---- helpers ----
export const fmt = (value: string | number, currency: Currency = 'CNY') => {
  const n = typeof value === 'string' ? parseFloat(value) : value;
  const symbols: Record<Currency, string> = { CNY: '¥', USD: '$', HKD: 'HK$' };
  return `${symbols[currency]}${n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const accountTypeLabel: Record<AccountType, string> = {
  bank: 'Bank',
  brokerage: 'Brokerage',
  transit_card: 'Transit Card',
};

export const txKindLabel: Record<TxKind, string> = {
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  liability: 'Liability',
  repay: 'Repay',
};
