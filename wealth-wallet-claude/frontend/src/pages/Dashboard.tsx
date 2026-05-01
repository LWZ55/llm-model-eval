import {
  AppstoreOutlined,
  DollarCircleOutlined,
  PieChartOutlined,
  PlusOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Summary, api, fmt } from '../api/client';
import AccountCard from '../components/AccountCard';
import AccountPieChart from '../components/AccountPieChart';
import NewAccountForm from '../components/NewAccountForm';

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const { data } = await api.get<Summary>('/summary');
      setSummary(data);
      setError(null);
    } catch (err) {
      setError('Failed to load summary. Is the backend running?');
    }
  };

  useEffect(() => {
    load();
  }, []);

  if (error) return <div className="card">{error}</div>;
  if (!summary) return <div className="card">Loading…</div>;

  const total = parseFloat(summary.total);
  const sign = total >= 0 ? 'pos' : 'neg';

  return (
    <>
      <div className="card">
        <div className="summary-card">
          <div>
            <div className="summary-label">
              <DollarCircleOutlined /> Total Net Worth ({summary.base_currency})
            </div>
            <div className={`summary-total ${sign}`}>
              {fmt(summary.total, summary.base_currency)}
            </div>
            <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>
              <RiseOutlined /> Across {summary.accounts.length} account
              {summary.accounts.length === 1 ? '' : 's'}
            </div>
          </div>
          <div className="breakdown">
            {summary.by_currency.map((b) => (
              <div className="pill-stat" key={b.currency}>
                <div className="ccy">{b.currency}</div>
                <div style={{ fontWeight: 600 }}>{fmt(b.balance, b.currency)}</div>
                {b.currency !== summary.base_currency && (
                  <div className="muted" style={{ fontSize: 11 }}>
                    ≈ {fmt(b.balance_in_base, summary.base_currency)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="section-title">
          <PieChartOutlined className="ico" /> Account Allocation
        </h3>
        <AccountPieChart accounts={summary.accounts} />
      </div>

      <div className="row between" style={{ marginBottom: 12 }}>
        <h2 className="section-title">
          <AppstoreOutlined className="ico" /> Accounts
        </h2>
        {!showForm && (
          <button className="btn" onClick={() => setShowForm(true)}>
            <PlusOutlined /> Add Account
          </button>
        )}
      </div>

      {showForm && (
        <NewAccountForm
          onCreated={() => {
            setShowForm(false);
            load();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {summary.accounts.length === 0 ? (
        <div className="card empty">No accounts yet. Add your first one.</div>
      ) : (
        <div className="grid">
          {summary.accounts.map((a) => (
            <AccountCard key={a.id} account={a} />
          ))}
        </div>
      )}
    </>
  );
}
