import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from 'recharts';
import { Box, Typography, Paper } from '@mui/material';
import { RiseOutlined } from '@ant-design/icons';
import { formatCurrency } from '../utils/currency';

function BalanceChart({ data, currency = 'CNY', title = 'Balance History' }) {
  if (!data || data.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        }}
      >
        <Typography color="text.secondary">
          No historical data available. Add transactions to see the chart.
        </Typography>
      </Paper>
    );
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: 1, borderColor: 'divider' }}>
          <Typography variant="body2">{payload[0].payload.date}</Typography>
          <Typography variant="body1" color="primary">
            {formatCurrency(payload[0].value, currency)}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  return (
    <Paper
      sx={{
        width: '100%',
        p: 3,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      <Box sx={{ width: '100%', height: 400 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              stroke="#757575"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="#757575"
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="balance"
              stroke="none"
              fill="url(#colorBalance)"
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#667eea"
              strokeWidth={3}
              dot={{ r: 4, fill: '#667eea', strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, fill: '#667eea', stroke: '#fff', strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}

export default BalanceChart;
