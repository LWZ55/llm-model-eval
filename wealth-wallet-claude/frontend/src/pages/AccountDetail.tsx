import {
  ArrowLeftOutlined,
  DeleteOutlined,
  LineChartOutlined,
  StockOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AccountWithBalance,
  HistoryPoint,
  Holding,
  Transaction,
  accountTypeLabel,
  api,
  fmt,
} from '../api/client';
import BalanceChart from '../components/BalanceChart';
import TransactionList from '../components/TransactionList';
import HoldingsTable from '../components/HoldingsTable';

type Tab = 'transactions' | 'holdings';

export default function AccountDetail() {
  const { id } = useParams();
  const accountId = Number(id);
  const navigate = useNavigate();

  const [account, setAccount] = useState<AccountWithBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [history, setHistory] = useState<HistoryPoint[]>([]);
  const [days, setDays] = useState(90);
  const [tab, setTab] = useState<Tab>('transactions');
  const [error, setError] = useState<string | null>(null);

  const isBrokerage = account?.type === 'brokerage';

  const loadAll = async () => {
    try {
      const [acc, tx, hist] = await Promise.all([
        api.get<AccountWithBalance>(`/accounts/${accountId}`),
        api.get<Transaction[]>(`/accounts/${accountId}/transactions`),
        api.get<HistoryPoint[]>(`/accounts/${accountId}/history`, { params: { days } }),
      ]);
      setAccount(acc.data);
      setTransactions(tx.data);
      setHistory(hist.data);
      if (acc.data.type === 'brokerage') {
        const hd = await api.get<Holding[]>(`/accounts/${accountId}/holdings`);
        setHoldings(hd.data);
      } else {
        setHoldings([]);
      }
      setError(null);
    } catch (e) {
      setError('Failed to load account.');
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accountId, days]);

  useEffect(() => {
    if (account && !isBrokerage && tab === 'holdings') setTab('transactions');
  }, [account, isBrokerage, tab]);

  const removeAccount = async () => {
    if (!confirm(`Delete account "${account?.name}"? This removes all its data.`)) return;
    await api.delete(`/accounts/${accountId}`);
    navigate('/');
  };

  const balanceSign = useMemo(() => {
    if (!account) return 'pos';
    return parseFloat(account.balance) >= 0 ? 'pos' : 'neg';
  }, [account]);

  if (error) return <div className="card">{error}</div>;
  if (!account) return <div className="card">Loading…</div>;

  return (
    <>
      <Link to="/" className="back-link"><ArrowLeftOutlined /> Back to Dashboard</Link>

      <div className="card" style={{ marginTop: 12 }}>
        <div className="row between wrap">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>
              {accountTypeLabel[account.type]} · {account.currency}
            </div>
            <h2 style={{ margin: '4px 0' }}>{account.name}</h2>
            <div className={`balance-header ${balanceSign}`}>
              {fmt(account.balance, account.currency)}
            </div>
            {account.currency !== 'CNY' && (
              <div className="muted">≈ {fmt(account.balance_in_base, 'CNY')}</div>
            )}
          </div>
          <div className="row">
            <select value={days} onChange={(e) => setDays(parseInt(e.target.value, 10))}>
              <option value={30}>30 days</option>
              <option value={90}>90 days</option>
              <option value={180}>180 days</option>
              <option value={365}>1 year</option>
            </select>
            <button className="btn danger" onClick={removeAccount}><DeleteOutlined /> Delete</button>
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div className="muted" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, fontSize: 12 }}>
            <LineChartOutlined /> Balance history
          </div>
          <BalanceChart data={history} currency={account.currency} />
        </div>
      </div>

      <div className="tabs">
        <button
          className={`tab ${tab === 'transactions' ? 'active' : ''}`}
          onClick={() => setTab('transactions')}
        >
          <SwapOutlined /> Transactions ({transactions.length})
        </button>
        {isBrokerage && (
          <button
            className={`tab ${tab === 'holdings' ? 'active' : ''}`}
            onClick={() => setTab('holdings')}
          >
            <StockOutlined /> Holdings ({holdings.length})
          </button>
        )}
      </div>

      <div className="card">
        {tab === 'transactions' ? (
          <TransactionList
            accountId={accountId}
            currency={account.currency}
            transactions={transactions}
            onChanged={loadAll}
          />
        ) : (
          <HoldingsTable
            accountId={accountId}
            accountCurrency={account.currency}
            holdings={holdings}
            onChanged={loadAll}
          />
        )}
      </div>
    </>
  );
}
