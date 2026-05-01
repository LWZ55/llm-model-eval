import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  BankOutlined, LineChartOutlined, CreditCardOutlined,
  ArrowLeftOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  TransactionOutlined, StockOutlined, LineChartOutlined as ChartIcon,
} from '@ant-design/icons';
import {
  fetchAccount,
  fetchTransactions, createTransaction, updateTransaction, deleteTransaction,
  fetchStockHoldings, createStockHolding, updateStockHolding, deleteStockHolding,
  fetchBalanceHistory,
} from '../api';
import { formatCurrency } from '../components/SummaryCards';
import TransactionForm from '../components/TransactionForm';
import StockHoldingForm from '../components/StockHoldingForm';
import BalanceChart from '../components/BalanceChart';

const TYPE_LABELS = {
  bank: 'Bank',
  brokerage: 'Brokerage',
  transit: 'Transit Card',
};

const TYPE_ICONS = {
  bank: <BankOutlined />,
  brokerage: <LineChartOutlined />,
  transit: <CreditCardOutlined />,
};

function AccountDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const accountId = parseInt(id);

  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stockHoldings, setStockHoldings] = useState([]);
  const [balanceHistory, setBalanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showTxnForm, setShowTxnForm] = useState(false);
  const [editingTxn, setEditingTxn] = useState(null);
  const [showStockForm, setShowStockForm] = useState(false);
  const [editingStock, setEditingStock] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [acc, txns, stocks, history] = await Promise.all([
        fetchAccount(accountId),
        fetchTransactions(accountId),
        fetchStockHoldings(accountId),
        fetchBalanceHistory(accountId),
      ]);
      setAccount(acc);
      setTransactions(txns);
      setStockHoldings(stocks);
      setBalanceHistory(history);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // --- Transaction handlers ---
  const handleAddTxn = () => { setEditingTxn(null); setShowTxnForm(true); };
  const handleEditTxn = (txn) => { setEditingTxn(txn); setShowTxnForm(true); };

  const handleTxnSubmit = async (data) => {
    try {
      if (editingTxn) {
        await updateTransaction(editingTxn.id, data);
      } else {
        await createTransaction(accountId, data);
      }
      setShowTxnForm(false);
      setEditingTxn(null);
      loadData();
    } catch (err) {
      console.error('Failed to save transaction:', err);
    }
  };

  const handleDeleteTxn = async (txnId) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await deleteTransaction(txnId);
      loadData();
    } catch (err) {
      console.error('Failed to delete transaction:', err);
    }
  };

  // --- Stock Holding handlers ---
  const handleAddStock = () => { setEditingStock(null); setShowStockForm(true); };
  const handleEditStock = (s) => { setEditingStock(s); setShowStockForm(true); };

  const handleStockSubmit = async (data) => {
    try {
      if (editingStock) {
        await updateStockHolding(editingStock.id, data);
      } else {
        await createStockHolding(accountId, data);
      }
      setShowStockForm(false);
      setEditingStock(null);
      loadData();
    } catch (err) {
      console.error('Failed to save stock holding:', err);
    }
  };

  const handleDeleteStock = async (stockId) => {
    if (!window.confirm('Delete this stock holding?')) return;
    try {
      await deleteStockHolding(stockId);
      loadData();
    } catch (err) {
      console.error('Failed to delete stock holding:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (!account) {
    return <div className="loading">Account not found.</div>;
  }

  return (
    <div className="account-detail">
      <button className="btn btn-link" onClick={() => navigate('/')}>
        <ArrowLeftOutlined /> Back to Dashboard
      </button>

      <div className="page-header">
        <div>
          <h1>{account.name}</h1>
          <span className="account-meta">
            {TYPE_ICONS[account.type]} {TYPE_LABELS[account.type]} · {account.currency}
          </span>
        </div>
        <div className={`account-balance-large ${account.balance >= 0 ? 'positive' : 'negative'}`}>
          {formatCurrency(account.balance, account.currency)}
        </div>
      </div>

      {/* Balance Chart */}
      <div className="section">
        <h2><ChartIcon /> Balance History (30 days)</h2>
        <BalanceChart data={balanceHistory} currency={account.currency} />
      </div>

      {/* Transactions */}
      <div className="section">
        <div className="section-header">
          <h2><TransactionOutlined /> Transactions</h2>
          <button className="btn btn-primary btn-icon" onClick={handleAddTxn}>
            <PlusOutlined /> Add Transaction
          </button>
        </div>
        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions yet. Add your first transaction!</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th className="text-right">Amount</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{txn.date}</td>
                    <td>
                      <span className={`badge ${txn.type === 'deposit' ? 'badge-deposit' : 'badge-liability'}`}>
                        {txn.type === 'deposit' ? 'Deposit' : 'Liability'}
                      </span>
                    </td>
                    <td>{txn.description || '-'}</td>
                    <td className={`text-right ${txn.type === 'deposit' ? 'positive' : 'negative'}`}>
                      {txn.type === 'deposit' ? '+' : '-'}
                      {formatCurrency(txn.amount, account.currency)}
                    </td>
                    <td className="text-center">
                      <button className="btn btn-sm btn-secondary btn-icon" onClick={() => handleEditTxn(txn)}>
                        <EditOutlined /> Edit
                      </button>
                      <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDeleteTxn(txn.id)}>
                        <DeleteOutlined /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stock Holdings - only for brokerage accounts */}
      {account.type === 'brokerage' && (
        <div className="section">
          <div className="section-header">
            <h2><StockOutlined /> Stock Holdings</h2>
            <button className="btn btn-primary btn-icon" onClick={handleAddStock}>
              <PlusOutlined /> Add Stock
            </button>
          </div>
          {stockHoldings.length === 0 ? (
            <div className="empty-state">
              <p>No stock holdings yet. Add your first holding!</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Name</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Cost</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Market Value</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stockHoldings.map((s) => (
                    <tr key={s.id}>
                      <td><strong>{s.stock_code}</strong></td>
                      <td>{s.stock_name}</td>
                      <td className="text-right">{s.quantity}</td>
                      <td className="text-right">{formatCurrency(s.cost_price, account.currency)}</td>
                      <td className="text-right">{formatCurrency(s.current_price, account.currency)}</td>
                      <td className={`text-right ${s.market_value >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency(s.market_value, account.currency)}
                      </td>
                      <td className="text-center">
                        <button className="btn btn-sm btn-secondary btn-icon" onClick={() => handleEditStock(s)}>
                          <EditOutlined /> Edit
                        </button>
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDeleteStock(s.id)}>
                          <DeleteOutlined /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      {showTxnForm && (
        <TransactionForm
          transaction={editingTxn}
          onSubmit={handleTxnSubmit}
          onCancel={() => { setShowTxnForm(false); setEditingTxn(null); }}
        />
      )}
      {showStockForm && (
        <StockHoldingForm
          holding={editingStock}
          onSubmit={handleStockSubmit}
          onCancel={() => { setShowStockForm(false); setEditingStock(null); }}
        />
      )}
    </div>
  );
}

export default AccountDetail;
