import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import { formatCurrency } from '../utils/currency';

const COLORS = [
  '#1976d2', // Blue
  '#2e7d32', // Green
  '#ed6c02', // Orange
  '#9c27b0', // Purple
  '#d32f2f', // Red
  '#0288d1', // Light Blue
  '#388e3c', // Dark Green
  '#f57c00', // Dark Orange
  '#7b1fa2', // Dark Purple
  '#c2185b', // Pink
];

function AccountPieChart({ data, title = 'Account Distribution' }) {
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No account data available.
        </Typography>
      </Paper>
    );
  }

  // Filter out accounts with zero or negative balance for better visualization
  const positiveAccounts = data.filter((item) => item.value > 0);
  
  if (positiveAccounts.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">
          No positive balances to display.
        </Typography>
      </Paper>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            bgcolor: 'background.paper',
            p: 2,
            border: 1,
            borderColor: 'divider',
            borderRadius: 1,
            boxShadow: 2,
          }}
        >
          <Typography variant="body2" sx={{ mb: 0.5, fontWeight: 'bold' }}>
            {data.name}
          </Typography>
          <Typography variant="body1" color="primary">
            {formatCurrency(data.value, data.currency)}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {data.percent.toFixed(1)}% of total
          </Typography>
        </Box>
      );
    }
    return null;
  };

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show label for small slices
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {(percent * 100).toFixed(0)}%
      </text>
    );
  };

  return (
    <Paper
      sx={{
        p: 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: 2,
        boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
      }}
    >
      <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Box sx={{ width: '100%', height: 350 }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={positiveAccounts}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomLabel}
              outerRadius={130}
              innerRadius={60}
              fill="#8884d8"
              dataKey="value"
              strokeWidth={3}
              stroke="#fff"
            >
              {positiveAccounts.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value, entry) => {
                return (
                  <span style={{ color: '#333', fontSize: '12px' }}>
                    {value}
                  </span>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export default AccountPieChart;
