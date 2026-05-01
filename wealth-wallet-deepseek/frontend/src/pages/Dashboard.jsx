import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BankOutlined, LineChartOutlined, CreditCardOutlined,
  PlusOutlined, EditOutlined, DeleteOutlined,
  PieChartOutlined, DashboardOutlined,
} from '@ant-design/icons';
import {
  fetchAccounts, fetchSummary,
  createAccount, updateAccount, deleteAccount,
} from '../api';
import SummaryCards, { formatCurrency } from '../components/SummaryCards';
import BalancePieChart from '../components/BalancePieChart';
import AccountForm from '../components/AccountForm';

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

function Dashboard() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [accData, sumData] = await Promise.all([fetchAccounts(), fetchSummary()]);
      setAccounts(accData);
      setSummary(sumData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setEditingAccount(null);
    setShowForm(true);
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setShowForm(true);
  };

  const handleFormSubmit = async (data) => {
    try {
      if (editingAccount) {
        await updateAccount(editingAccount.id, data);
      } else {
        await createAccount(data);
      }
      setShowForm(false);
      setEditingAccount(null);
      loadData();
    } catch (err) {
      console.error('Failed to save account:', err);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete account "${name}"? This will remove all related transactions and stock holdings.`)) return;
    try {
      await deleteAccount(id);
      loadData();
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="page-header">
        <h1><DashboardOutlined /> Dashboard</h1>
        <button className="btn btn-primary btn-icon" onClick={handleCreate}>
          <PlusOutlined /> Add Account
        </button>
      </div>

      <SummaryCards summary={summary} />

      <div className="section">
        <h2><PieChartOutlined /> Account Distribution</h2>
        <BalancePieChart accounts={accounts} />
      </div>

      <div className="section">
        <h2>My Accounts</h2>
        {accounts.length === 0 ? (
          <div className="empty-state">
            <p>No accounts yet. Create your first account to get started!</p>
          </div>
        ) : (
          <div className="account-grid">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="account-card"
                onClick={() => navigate(`/accounts/${acc.id}`)}
              >
                <div className="account-card-header">
                  <span className="account-card-type">
                    {TYPE_ICONS[acc.type]} {TYPE_LABELS[acc.type] || acc.type}
                  </span>
                  <span className="account-card-currency">{acc.currency}</span>
                </div>
                <h3 className="account-card-name">{acc.name}</h3>
                <div className={`account-card-balance ${acc.balance >= 0 ? 'positive' : 'negative'}`}>
                  {formatCurrency(acc.balance, acc.currency)}
                </div>
                <div className="account-card-actions" onClick={(e) => e.stopPropagation()}>
                  <button
                    className="btn btn-sm btn-secondary btn-icon"
                    onClick={() => handleEdit(acc)}
                  >
                    <EditOutlined /> Edit
                  </button>
                  <button
                    className="btn btn-sm btn-danger btn-icon"
                    onClick={() => handleDelete(acc.id, acc.name)}
                  >
                    <DeleteOutlined /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <AccountForm
          account={editingAccount}
          onSubmit={handleFormSubmit}
          onCancel={() => { setShowForm(false); setEditingAccount(null); }}
        />
      )}
    </div>
  );
}

export default Dashboard;
