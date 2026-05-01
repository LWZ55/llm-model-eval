import { useState } from 'react';

const TX_TYPES = [
  { value: 'deposit', label: 'Deposit' },
  { value: 'liability', label: 'Liability' },
];

export default function TransactionForm({ accountId, onSubmit, onCancel = null }) {
  const [type, setType] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      type,
      amount: parseFloat(amount),
      description,
      date: new Date().toISOString(),
    });
    setType('deposit');
    setAmount('');
    setDescription('');
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-h)' }}>Type</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        >
          {TX_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-h)' }}>Amount</label>
        <input
          type="number"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-h)' }}>Description</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        />
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
          Add
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
