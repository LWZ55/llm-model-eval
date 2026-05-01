import { useState } from 'react';

const ACCOUNT_TYPES = [
  { value: 'bank', label: 'Bank Account' },
  { value: 'broker', label: 'Broker Account' },
  { value: 'transit', label: 'Transit Card' },
];

const CURRENCIES = [
  { value: 'CNY', label: 'CNY (RMB)' },
  { value: 'USD', label: 'USD' },
  { value: 'HKD', label: 'HKD' },
];

export default function AccountForm({ onSubmit, initialData = null, onCancel = null }) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'bank');
  const [currency, setCurrency] = useState(initialData?.currency || 'CNY');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, type, currency });
    if (!initialData) {
      setName('');
      setType('bank');
      setCurrency('CNY');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-h)' }}>Account Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-h)' }}>Account Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        >
          {ACCOUNT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-h)' }}>Currency</label>
        <select
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        >
          {CURRENCIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
        <button type="submit" style={{
          padding: '0.5rem 1rem',
          borderRadius: '6px',
          border: 'none',
          background: 'var(--accent)',
          color: '#fff',
          cursor: 'pointer',
          fontWeight: 600,
        }}>
          {initialData ? 'Update' : 'Create'}
        </button>
        {onCancel && (
          <button type="button" onClick={onCancel} style={{
            padding: '0.5rem 1rem',
            borderRadius: '6px',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--text)',
            cursor: 'pointer',
          }}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
