import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { AccountWithBalance, accountTypeLabel, fmt } from '../api/client';

const COLORS = [
  '#38bdf8', // sky
  '#a78bfa', // violet
  '#f472b6', // pink
  '#fb923c', // orange
  '#34d399', // emerald
  '#facc15', // yellow
  '#60a5fa', // blue
  '#f87171', // red
  '#22d3ee', // cyan
];

interface Props {
  accounts: AccountWithBalance[];
}

export default function AccountPieChart({ accounts }: Props) {
  // Use absolute value of balance_in_base for share computation; skip zero-balance accounts.
  const data = accounts
    .map((a) => ({
      name: a.name,
      type: accountTypeLabel[a.type],
      currency: a.currency,
      raw: parseFloat(a.balance_in_base),
      value: Math.abs(parseFloat(a.balance_in_base)),
    }))
    .filter((d) => d.value > 0);

  if (data.length === 0) {
    return <div className="empty">No balances to chart yet.</div>;
  }

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ width: '100%', height: 320 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="40%"
            cy="50%"
            innerRadius={60}
            outerRadius={110}
            paddingAngle={2}
            stroke="#0f172a"
            strokeWidth={2}
            isAnimationActive
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'rgba(30,41,59,0.95)',
              border: '1px solid #334155',
              borderRadius: 8,
              color: '#f1f5f9',
              backdropFilter: 'blur(8px)',
            }}
            formatter={(v: number, _name, props: any) => {
              const pct = ((v / total) * 100).toFixed(1);
              const sign = props?.payload?.raw < 0 ? '-' : '';
              return [`${sign}${fmt(v, 'CNY')} (${pct}%)`, props?.payload?.name];
            }}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            formatter={(value: string, _entry: any, idx: number) => {
              const d = data[idx];
              if (!d) return value;
              const pct = ((d.value / total) * 100).toFixed(1);
              return (
                <span style={{ color: '#cbd5e1', fontSize: 12 }}>
                  {value}{' '}
                  <span style={{ color: '#94a3b8' }}>· {pct}%</span>
                </span>
              );
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
