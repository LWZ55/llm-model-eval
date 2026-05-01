import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Currency, HistoryPoint, fmt } from '../api/client';

interface Props {
  data: HistoryPoint[];
  currency: Currency;
}

export default function BalanceChart({ data, currency }: Props) {
  const chartData = data.map((p) => ({
    date: p.date,
    balance: parseFloat(p.balance),
  }));

  return (
    <div style={{ width: '100%', height: 280 }}>
      <ResponsiveContainer>
        <LineChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis
            dataKey="date"
            stroke="#94a3b8"
            fontSize={11}
            tickFormatter={(v: string) => v.slice(5)}
            minTickGap={24}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickFormatter={(v: number) =>
              v.toLocaleString(undefined, { maximumFractionDigits: 0 })
            }
            width={70}
          />
          <Tooltip
            contentStyle={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: 8,
              color: '#f1f5f9',
            }}
            formatter={(v: number) => fmt(v, currency)}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Line
            type="monotone"
            dataKey="balance"
            stroke="#38bdf8"
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
