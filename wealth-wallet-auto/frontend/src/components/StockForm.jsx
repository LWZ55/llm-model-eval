import { useState } from 'react';

const CURRENCIES = [
  { value: 'CNY', label: 'CNY' },
  { value: 'USD', label: 'USD' },
  { value: 'HKD', label: 'HKD' },
];

export default function StockForm({ onSubmit, initialData = null, onCancel = null }) {
  const [symbol, setSymbol] = useState(initialData?.symbol || '');
  const [shares, setShares] = useState(initialData?.shares?.toString() || '');
  const [avgCost, setAvgCost] = useState(initialData?.avg_cost?.toString() || '');
  const [currentPrice, setCurrentPrice] = useState(initialData?.current_price?.toString() || '');
  const [currency, setCurrency] = useState(initialData?.currency || 'CNY');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      symbol,
      shares: parseFloat(shares),
      avg_cost: parseFloat(avgCost),
      current_price: parseFloat(currentPrice),
      currency,
    });
    if (!initialData) {
      setSymbol('');
      setShares('');
      setAvgCost('');
      setCurrentPrice('');
      setCurrency('CNY');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: '400px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-h)' }}>Symbol</label>
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          required
          style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-h)' }}>Shares</label>
          <input
            type="number"
            step="0.01"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            required
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
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
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-h)' }}>Avg Cost</label>
          <input
            type="number"
            step="0.01"
            value={avgCost}
            onChange={(e) => setAvgCost(e.target.value)}
            required
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
          />
        </div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
          <label style={{ fontSize: '0.85rem', marginBottom: '0.25rem', color: 'var(--text-h)' }}>Current Price</label>
          <input
            type="number"
            step="0.01"
            value={currentPrice}
            onChange={(e) => setCurrentPrice(e.target.value)}
            required
            style={{ padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-h)' }}
          />
        </div>
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
          {initialData ? 'Update' : 'Add'}
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
