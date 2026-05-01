import { GlobalOutlined, SaveOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { Currency, Rate, api } from '../api/client';

const PAIRS: Array<{ base: Currency; quote: Currency; label: string }> = [
  { base: 'USD', quote: 'CNY', label: '1 USD = ? CNY' },
  { base: 'HKD', quote: 'CNY', label: '1 HKD = ? CNY' },
];

export default function Settings() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    const { data } = await api.get<Rate[]>('/rates');
    setRates(data);
    const next: Record<string, string> = {};
    for (const r of data) {
      next[`${r.base_ccy}-${r.quote_ccy}`] = r.rate;
    }
    setEdits(next);
  };

  useEffect(() => {
    load();
  }, []);

  const save = async (base: Currency, quote: Currency) => {
    const key = `${base}-${quote}`;
    const value = parseFloat(edits[key] || '0');
    if (Number.isNaN(value) || value <= 0) return;
    setSaving(key);
    try {
      await api.put('/rates', { base_ccy: base, quote_ccy: quote, rate: value });
      await load();
    } finally {
      setSaving(null);
    }
  };

  const findRate = (base: Currency, quote: Currency) =>
    rates.find((r) => r.base_ccy === base && r.quote_ccy === quote);

  return (
    <div className="card">
      <h2 className="section-title"><GlobalOutlined className="ico" /> Exchange Rates</h2>
      <p className="muted" style={{ marginTop: 6 }}>
        Used to convert account balances to CNY for the total net worth.
      </p>
      <table>
        <thead>
          <tr>
            <th>Pair</th>
            <th>Rate</th>
            <th>Last updated</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {PAIRS.map(({ base, quote, label }) => {
            const key = `${base}-${quote}`;
            const r = findRate(base, quote);
            return (
              <tr key={key}>
                <td>{label}</td>
                <td>
                  <input
                    type="number"
                    step="0.0001"
                    min="0"
                    value={edits[key] ?? ''}
                    onChange={(e) => setEdits({ ...edits, [key]: e.target.value })}
                    style={{ width: 120 }}
                  />
                </td>
                <td className="muted">
                  {r ? new Date(r.updated_at).toLocaleString() : '—'}
                </td>
                <td style={{ textAlign: 'right' }}>
                  <button
                    className="btn small"
                    disabled={saving === key}
                    onClick={() => save(base, quote)}
                  >
                    <SaveOutlined /> Save
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
