import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#722ed1', '#13c2c2', '#52c41a', '#fa8c16', '#f5222d', '#2f4554', '#eb2f96', '#1890ff'];

export default function AccountPieChart({ accounts }) {
  const data = accounts.map((acc) => ({
    name: acc.name,
    value: acc.balance + acc.stock_value,
  })).filter((d) => d.value > 0);

  if (data.length === 0) return null;

  const total = data.reduce((sum, d) => sum + d.value, 0);

  const renderLabel = ({ name, percent }) => {
    return `${name}: ${(percent * 100).toFixed(1)}%`;
  };

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={renderLabel}
          outerRadius={110}
          innerRadius={55}
          fill="#8884d8"
          dataKey="value"
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [value.toFixed(2), 'Amount']}
          contentStyle={{
            borderRadius: '10px',
            border: '1px solid var(--border)',
            background: '#fff',
            boxShadow: 'var(--shadow)',
          }}
        />
        <Legend verticalAlign="bottom" height={36} />
      </PieChart>
    </ResponsiveContainer>
  );
}
