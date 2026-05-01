import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Currency, Holding, api, fmt } from '../api/client';

interface Props {
  accountId: number;
  accountCurrency: Currency;
  holdings: Holding[];
  onChanged: () => void;
}

export default function HoldingsTable({ accountId, accountCurrency, holdings, onChanged }: Props) {
  const [symbol, setSymbol] = useState('');
  const [shares, setShares] = useState('');
  const [costBasis, setCostBasis] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<Currency>(accountCurrency);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim()) return;
    setBusy(true);
    try {
      await api.post(`/accounts/${accountId}/holdings`, {
        symbol: symbol.trim(),
        shares: parseFloat(shares) || 0,
        cost_basis: parseFloat(costBasis) || 0,
        current_price: parseFloat(price) || 0,
        currency,
      });
      setSymbol('');
      setShares('');
      setCostBasis('');
      setPrice('');
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const updatePrice = async (id: number, newPrice: string) => {
    const p = parseFloat(newPrice);
    if (Number.isNaN(p) || p < 0) return;
    await api.patch(`/holdings/${id}`, { current_price: p });
    onChanged();
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this holding?')) return;
    await api.delete(`/holdings/${id}`);
    onChanged();
  };

  return (
    <>
      <form className="inline-form" onSubmit={submit}>
        <label>
          Symbol
          <input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="AAPL" />
        </label>
        <label>
          Shares
          <input type="number" step="0.0001" min="0" value={shares} onChange={(e) => setShares(e.target.value)} />
        </label>
        <label>
          Cost basis
          <input type="number" step="0.0001" min="0" value={costBasis} onChange={(e) => setCostBasis(e.target.value)} />
        </label>
        <label>
          Current price
          <input type="number" step="0.0001" min="0" value={price} onChange={(e) => setPrice(e.target.value)} />
        </label>
        <label>
          Currency
          <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
            <option value="CNY">CNY</option>
            <option value="USD">USD</option>
            <option value="HKD">HKD</option>
          </select>
        </label>
        <div>
          <button className="btn" type="submit" disabled={busy}><PlusOutlined /> Add</button>
        </div>
      </form>

      {holdings.length === 0 ? (
        <div className="empty">No holdings yet.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Shares</th>
              <th>Cost</th>
              <th>Price</th>
              <th>Market value</th>
              <th>P/L</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const shares = parseFloat(h.shares);
              const cost = parseFloat(h.cost_basis);
              const price = parseFloat(h.current_price);
              const pl = (price - cost) * shares;
              const sign = pl >= 0 ? 'pos' : 'neg';
              return (
                <tr key={h.id}>
                  <td><strong>{h.symbol}</strong></td>
                  <td>{shares}</td>
                  <td>{fmt(h.cost_basis, h.currency)}</td>
                  <td>
                    <input
                      type="number"
                      step="0.0001"
                      defaultValue={h.current_price}
                      onBlur={(e) => {
                        if (e.target.value !== h.current_price) {
                          updatePrice(h.id, e.target.value);
                        }
                      }}
                      style={{ width: 90 }}
                    />
                  </td>
                  <td>{fmt(h.market_value, h.currency)}</td>
                  <td className={sign === 'pos' ? '' : ''} style={{ color: pl >= 0 ? '#22c55e' : '#ef4444' }}>
                    {fmt(pl, h.currency)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn small danger" onClick={() => remove(h.id)}><DeleteOutlined /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </>
  );
}
