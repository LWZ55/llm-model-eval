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
  IconButton,
  Chip,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import AccountForm from '../components/AccountForm';
import { formatCurrency } from '../utils/currency';
import { fetchAccounts, createAccount, updateAccount, deleteAccount, getAccountBalance } from '../services/api';

function Accounts() {
  const [accounts, setAccounts] = useState([]);
  const [balances, setBalances] = useState({});
  const [formOpen, setFormOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    try {
      const data = await fetchAccounts();
      setAccounts(data);
      
      // Load balances for each account
      const balanceMap = {};
      await Promise.all(
        data.map(async (account) => {
          const balance = await getAccountBalance(account.id);
          balanceMap[account.id] = balance;
        })
      );
      setBalances(balanceMap);
    } catch (error) {
      console.error('Failed to load accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (accountData) => {
    try {
      await createAccount(accountData);
      loadAccounts();
    } catch (error) {
      console.error('Failed to create account:', error);
    }
  };

  const handleUpdate = async (accountData) => {
    try {
      await updateAccount(editingAccount.id, accountData);
      setEditingAccount(null);
      loadAccounts();
    } catch (error) {
      console.error('Failed to update account:', error);
    }
  };

  const handleDelete = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        await deleteAccount(accountId);
        loadAccounts();
      } catch (error) {
        console.error('Failed to delete account:', error);
      }
    }
  };

  const getAccountTypeLabel = (type) => {
    const labels = {
      bank: 'Bank',
      broker: 'Broker',
      wallet: 'Wallet',
    };
    return labels[type] || type;
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      bank: 'primary',
      broker: 'secondary',
      wallet: 'success',
    };
    return colors[type] || 'default';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
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
        <Typography variant="h4">Accounts</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormOpen(true)}
        >
          Add Account
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Currency</TableCell>
              <TableCell align="right">Balance</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => {
              const balance = balances[account.id];
              return (
                <TableRow key={account.id}>
                  <TableCell>{account.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={getAccountTypeLabel(account.type)}
                      color={getAccountTypeColor(account.type)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{account.currency}</TableCell>
                  <TableCell align="right">
                    {balance ? (
                      <Typography
                        sx={{
                          color: balance.balance >= 0 ? 'success.main' : 'error.main',
                          fontWeight: 'bold',
                        }}
                      >
                        {formatCurrency(balance.balance, account.currency)}
                      </Typography>
                    ) : (
                      '¥0.00'
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setEditingAccount(account);
                        setFormOpen(true);
                      }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(account.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {accounts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  <Typography color="text.secondary" sx={{ py: 3 }}>
                    No accounts yet. Click "Add Account" to get started.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <AccountForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingAccount(null);
        }}
        onSubmit={editingAccount ? handleUpdate : handleCreate}
        initialData={editingAccount}
      />
    </Box>
  );
}

export default Accounts;
