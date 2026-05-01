import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { useState } from 'react';
import {
  AccountType,
  Currency,
  api,
} from '../api/client';

interface Props {
  onCreated: () => void;
  onCancel: () => void;
}

export default function NewAccountForm({ onCreated, onCancel }: Props) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('bank');
  const [currency, setCurrency] = useState<Currency>('CNY');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await api.post('/accounts', { name: name.trim(), type, currency });
      onCreated();
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="inline-form" onSubmit={submit}>
      <label>
        Name
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. ICBC Card" />
      </label>
      <label>
        Type
        <select value={type} onChange={(e) => setType(e.target.value as AccountType)}>
          <option value="bank">Bank</option>
          <option value="brokerage">Brokerage</option>
          <option value="transit_card">Transit Card</option>
        </select>
      </label>
      <label>
        Currency
        <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
          <option value="CNY">CNY</option>
          <option value="USD">USD</option>
          <option value="HKD">HKD</option>
        </select>
      </label>
      <div className="row">
        <button className="btn" type="submit" disabled={busy}><CheckOutlined /> Create</button>
        <button className="btn secondary" type="button" onClick={onCancel}><CloseOutlined /> Cancel</button>
      </div>
    </form>
  );
}
