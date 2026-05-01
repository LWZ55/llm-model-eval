import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import TransactionForm from '../components/TransactionForm';
import { formatCurrency } from '../utils/currency';
import { fetchAccounts, fetchTransactions, addTransaction } from '../services/api';
import { format } from 'date-fns';

function Transactions() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadTransactions(selectedAccount);
    }
  }, [selectedAccount]);

  const loadAccounts = async () => {
    try {
      const data = await fetchAccounts();
      setAccounts(data);
      if (data.length > 0) {
        setSelectedAccount(data[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const loadTransactions = async (accountId) => {
    setLoading(true);
    try {
      const data = await fetchTransactions(accountId);
      setTransactions(data);
    } catch (error) {
      console.error('Failed to load transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (transactionData) => {
    try {
      await addTransaction(selectedAccount, transactionData);
      loadTransactions(selectedAccount);
    } catch (error) {
      console.error('Failed to add transaction:', error);
    }
  };

  const selectedAccountData = accounts.find(
    (acc) => acc.id.toString() === selectedAccount
  );

  if (accounts.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Transactions
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">
            Please create an account first to add transactions.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4">Transactions</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
          disabled={!selectedAccount}
        >
          Add Transaction
        </Button>
      </Box>

      <FormControl sx={{ mb: 3, minWidth: 300 }}>
        <InputLabel>Select Account</InputLabel>
        <Select
          value={selectedAccount}
          label="Select Account"
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id.toString()}>
              {account.name} ({account.currency})
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Description</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.date), 'yyyy-MM-dd')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.type === 'deposit' ? 'Deposit' : 'Liability'}
                      color={transaction.type === 'deposit' ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{
                      color:
                        transaction.type === 'deposit'
                          ? 'success.main'
                          : 'error.main',
                      fontWeight: 'bold',
                    }}
                  >
                    {transaction.type === 'deposit' ? '+' : '-'}
                    {formatCurrency(
                      transaction.amount,
                      selectedAccountData?.currency || 'CNY'
                    )}
                  </TableCell>
                  <TableCell>
                    {transaction.description || '-'}
                  </TableCell>
                </TableRow>
              ))}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No transactions yet. Click "Add Transaction" to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TransactionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSubmit={handleAddTransaction}
      />
    </Box>
  );
}

export default Transactions;
