import { useState, useEffect } from 'react';

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'brokerage', label: 'Brokerage Account' },
  { value: 'transit', label: 'Transit Card' },
];

const CURRENCIES = [
  { value: 'CNY', label: 'CNY (¥)' },
  { value: 'USD', label: 'USD ($)' },
  { value: 'HKD', label: 'HKD (HK$)' },
];

function AccountForm({ account, onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('bank');
  const [currency, setCurrency] = useState('CNY');

  useEffect(() => {
    if (account) {
      setName(account.name || '');
      setType(account.type || 'bank');
      setCurrency(account.currency || 'CNY');
    }
  }, [account]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, type, currency });
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{account ? 'Edit Account' : 'Add Account'}</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Account Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. My Savings Account"
              required
            />
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {ACCOUNT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
              {CURRENCIES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {account ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AccountForm;
