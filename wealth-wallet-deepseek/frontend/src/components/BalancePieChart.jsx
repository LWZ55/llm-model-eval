import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from './SummaryCards';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#14b8a6'];

const TYPE_ICONS = {
  bank: '🏦',
  brokerage: '📈',
  transit: '🚇',
};

function BalancePieChart({ accounts }) {
  if (!accounts || accounts.length === 0) {
    return <div className="chart-empty">No accounts to display.</div>;
  }

  // Only show accounts with positive balance in the pie
  const positiveAccounts = accounts.filter((a) => a.balance > 0);

  if (positiveAccounts.length === 0) {
    return <div className="chart-empty">No positive balances to display in chart.</div>;
  }

  const data = positiveAccounts.map((acc, index) => ({
    name: acc.name,
    value: Math.abs(acc.balance),
    currency: acc.currency,
    type: acc.type,
    color: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="chart-tooltip-label">
            {TYPE_ICONS[item.type]} {item.name}
          </p>
          <p className="chart-tooltip-value">
            {formatCurrency(item.value, item.currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = ({ payload }) => (
    <ul className="pie-legend">
      {payload.map((entry, index) => (
        <li key={`legend-${index}`} className="pie-legend-item">
          <span
            className="pie-legend-dot"
            style={{ backgroundColor: entry.color }}
          />
          <span className="pie-legend-name">
            {TYPE_ICONS[entry.payload.type]} {entry.payload.name}
          </span>
          <span className="pie-legend-value">
            {formatCurrency(entry.payload.value, entry.payload.currency)}
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="chart-container pie-chart-wrapper">
      <ResponsiveContainer width="100%" height={360}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={70}
            outerRadius={130}
            paddingAngle={3}
            dataKey="value"
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.12))',
                  transition: 'opacity 0.2s',
                }}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export default BalancePieChart;
