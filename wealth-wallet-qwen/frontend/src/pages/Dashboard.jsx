import React, { useState, useEffect } from 'react';
import {
  Grid,
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  BankOutlined,
  WalletOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import BalanceCard from '../components/BalanceCard';
import BalanceChart from '../components/BalanceChart';
import AccountPieChart from '../components/AccountPieChart';
import { formatCurrency } from '../utils/currency';
import {
  fetchDashboardSummary,
  fetchAccounts,
  fetchAccountHistory,
} from '../services/api';

function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadAccountHistory(selectedAccount);
    }
  }, [selectedAccount]);

  const loadData = async () => {
    try {
      const [summaryData, accountsData] = await Promise.all([
        fetchDashboardSummary(),
        fetchAccounts(),
      ]);
      setSummary(summaryData);
      setAccounts(accountsData);
      if (accountsData.length > 0) {
        setSelectedAccount(accountsData[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAccountHistory = async (accountId) => {
    try {
      const historyData = await fetchAccountHistory(accountId);
      setHistory(historyData);
    } catch (error) {
      console.error('Failed to load account history:', error);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  const selectedAccountData = accounts.find(
    (acc) => acc.id.toString() === selectedAccount
  );

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            backgroundClip: 'text',
            webkitBackgroundClip: 'text',
            webkitTextFillColor: 'transparent',
            mb: 0.5,
          }}
        >
          Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Your complete financial overview
        </Typography>
      </Box>

      {/* Total Balance */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              height: '100%',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              boxShadow: '0 8px 16px rgba(102, 126, 234, 0.3)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <WalletOutlined style={{ fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Total Balance
                </Typography>
              </Box>
              <Typography variant="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                {formatCurrency(summary?.total_balance || 0)}
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.9 }}>
                Across all accounts
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Currency Breakdown */}
        {summary?.currency_breakdown &&
          Object.entries(summary.currency_breakdown).map(([currency, amount]) => (
            <Grid item xs={12} md={4} key={currency}>
              <BalanceCard
                title={`${currency} Balance`}
                amount={amount}
                currency={currency}
              />
            </Grid>
          ))}
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* Pie Chart */}
        <Grid item xs={12} md={5}>
          <AccountPieChart
            data={
              summary?.accounts?.map((account) => ({
                name: account.account_name,
                value: account.balance,
                currency: account.currency.value || account.currency,
              })) || []
            }
            title="Account Distribution"
          />
        </Grid>

        {/* Account Balances */}
        <Grid item xs={12} md={7}>
          <Card
            sx={{
              height: '100%',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              borderRadius: 2,
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <BankOutlined style={{ fontSize: 20 }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Account Balances
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {summary?.accounts?.map((account) => {
                  const isPositive = account.balance >= 0;
                  return (
                    <Grid item xs={12} sm={6} md={4} key={account.account_id}>
                      <Card
                        variant="outlined"
                        sx={{
                          borderRadius: 2,
                          borderLeft: `4px solid ${isPositive ? '#4caf50' : '#f44336'}`,
                          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        }}
                      >
                        <CardContent>
                          <Typography
                            color="text.secondary"
                            variant="body2"
                            sx={{ mb: 0.5 }}
                          >
                            {account.account_name}
                          </Typography>
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 'bold',
                              color: isPositive ? 'success.main' : 'error.main',
                            }}
                          >
                            {formatCurrency(
                              account.balance,
                              account.currency.value || account.currency
                            )}
                          </Typography>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              mt: 1,
                            }}
                          >
                            {isPositive ? (
                              <RiseOutlined
                                style={{ color: '#4caf50', fontSize: 14 }}
                              />
                            ) : (
                              <FallOutlined
                                style={{ color: '#f44336', fontSize: 14 }}
                              />
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {account.currency.value || account.currency}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Balance History Chart */}
      <Card
        sx={{
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2,
              flexWrap: 'wrap',
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <RiseOutlined style={{ fontSize: 20 }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Balance History
              </Typography>
            </Box>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Select Account</InputLabel>
              <Select
                value={selectedAccount}
                label="Select Account"
                onChange={(e) => setSelectedAccount(e.target.value)}
              >
                {accounts.map((account) => (
                  <MenuItem key={account.id} value={account.id.toString()}>
                    {account.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <BalanceChart
            data={history}
            currency={selectedAccountData?.currency || 'CNY'}
            title=""
          />
        </CardContent>
      </Card>
    </Box>
  );
}

export default Dashboard;
