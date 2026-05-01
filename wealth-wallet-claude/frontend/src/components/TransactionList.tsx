import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { Transaction, TxKind, api, fmt, txKindLabel } from '../api/client';
import { Currency } from '../api/client';

interface Props {
  accountId: number;
  currency: Currency;
  transactions: Transaction[];
  onChanged: () => void;
}

export default function TransactionList({ accountId, currency, transactions, onChanged }: Props) {
  const [kind, setKind] = useState<TxKind>('deposit');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const a = parseFloat(amount);
    if (!a || a <= 0) return;
    setBusy(true);
    try {
      await api.post(`/accounts/${accountId}/transactions`, {
        kind,
        amount: a,
        note: note || null,
        date,
      });
      setAmount('');
      setNote('');
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this transaction?')) return;
    await api.delete(`/transactions/${id}`);
    onChanged();
  };

  return (
    <>
      <form className="inline-form" onSubmit={submit}>
        <label>
          Type
          <select value={kind} onChange={(e) => setKind(e.target.value as TxKind)}>
            <option value="deposit">Deposit (+ cash)</option>
            <option value="withdraw">Withdraw (- cash)</option>
            <option value="liability">Liability (- net)</option>
            <option value="repay">Repay (+ net)</option>
          </select>
        </label>
        <label>
          Amount ({currency})
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <label>
          Date
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label>
          Note
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="optional" />
        </label>
        <div>
          <button className="btn" type="submit" disabled={busy}><PlusOutlined /> Add</button>
        </div>
      </form>

      {transactions.length === 0 ? (
        <div className="empty">No transactions yet.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Note</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id}>
                <td>{tx.date}</td>
                <td><span className={`pill ${tx.kind}`}>{txKindLabel[tx.kind]}</span></td>
                <td>{fmt(tx.amount, currency)}</td>
                <td className="muted">{tx.note ?? ''}</td>
                <td style={{ textAlign: 'right' }}>
                  <button className="btn small danger" onClick={() => remove(tx.id)}>
                    <DeleteOutlined />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
