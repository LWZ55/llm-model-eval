import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { ArrowUpward, ArrowDownward } from '@mui/icons-material';
import { RiseOutlined, FallOutlined } from '@ant-design/icons';
import { formatCurrency } from '../utils/currency';

function BalanceCard({ title, amount, currency = 'CNY', trend }) {
  const isPositive = amount >= 0;

  return (
    <Card
      sx={{
        minWidth: 275,
        height: '100%',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
        borderRadius: 2,
        background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1.5 }}>
          {isPositive ? (
            <RiseOutlined style={{ color: '#4caf50', fontSize: 18 }} />
          ) : (
            <FallOutlined style={{ color: '#f44336', fontSize: 18 }} />
          )}
          <Typography color="text.secondary" variant="body2" sx={{ fontWeight: 500 }}>
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{
            mb: 1,
            fontWeight: 'bold',
            color: isPositive ? 'success.main' : 'error.main',
          }}
        >
          {formatCurrency(amount, currency)}
        </Typography>
        {trend !== undefined && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {isPositive ? (
              <ArrowUpward color="success" fontSize="small" />
            ) : (
              <ArrowDownward color="error" fontSize="small" />
            )}
            <Typography
              variant="body2"
              color={isPositive ? 'success.main' : 'error.main'}
              sx={{ fontWeight: 500 }}
            >
              {isPositive ? 'Positive' : 'Negative'} Balance
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default BalanceCard;
