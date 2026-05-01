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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { formatCurrency } from '../utils/currency';
import {
  fetchAccounts,
  fetchHoldings,
  addHolding,
  updateHolding,
  deleteHolding,
} from '../services/api';

function StockHoldings() {
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [holdings, setHoldings] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editingHolding, setEditingHolding] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    shares: '',
    avg_cost: '',
    current_price: '',
    currency: 'CNY',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    if (selectedAccount) {
      loadHoldings(selectedAccount);
    }
  }, [selectedAccount]);

  const loadAccounts = async () => {
    try {
      const data = await fetchAccounts();
      const brokerAccounts = data.filter((acc) => acc.type === 'broker');
      setAccounts(brokerAccounts);
      if (brokerAccounts.length > 0) {
        setSelectedAccount(brokerAccounts[0].id.toString());
      }
    } catch (error) {
      console.error('Failed to load accounts:', error);
    }
  };

  const loadHoldings = async (accountId) => {
    setLoading(true);
    try {
      const data = await fetchHoldings(accountId);
      setHoldings(data);
    } catch (error) {
      console.error('Failed to load holdings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenForm = (holding = null) => {
    if (holding) {
      setEditingHolding(holding);
      setFormData({
        symbol: holding.symbol,
        shares: holding.shares.toString(),
        avg_cost: holding.avg_cost.toString(),
        current_price: holding.current_price.toString(),
        currency: holding.currency,
      });
    } else {
      setEditingHolding(null);
      setFormData({
        symbol: '',
        shares: '',
        avg_cost: '',
        current_price: '',
        currency: 'CNY',
      });
    }
    setFormOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.symbol || !formData.shares || !formData.avg_cost || !formData.current_price) {
      return;
    }

    const holdingData = {
      symbol: formData.symbol,
      shares: parseFloat(formData.shares),
      avg_cost: parseFloat(formData.avg_cost),
      current_price: parseFloat(formData.current_price),
      currency: formData.currency,
    };

    try {
      if (editingHolding) {
        await updateHolding(editingHolding.id, holdingData);
      } else {
        await addHolding(selectedAccount, holdingData);
      }
      setFormOpen(false);
      loadHoldings(selectedAccount);
    } catch (error) {
      console.error('Failed to save holding:', error);
    }
  };

  const handleDelete = async (holdingId) => {
    if (window.confirm('Are you sure you want to delete this holding?')) {
      try {
        await deleteHolding(holdingId);
        loadHoldings(selectedAccount);
      } catch (error) {
        console.error('Failed to delete holding:', error);
      }
    }
  };

  const calculateTotalValue = () => {
    return holdings.reduce((sum, h) => sum + h.shares * h.current_price, 0);
  };

  const calculateTotalCost = () => {
    return holdings.reduce((sum, h) => sum + h.shares * h.avg_cost, 0);
  };

  const calculateGainLoss = () => {
    return calculateTotalValue() - calculateTotalCost();
  };

  const selectedAccountData = accounts.find(
    (acc) => acc.id.toString() === selectedAccount
  );

  if (accounts.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom>
          Stock Holdings
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <Typography color="text.secondary">
            Please create a broker account first to track stock holdings.
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
        <Typography variant="h4">Stock Holdings</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          disabled={!selectedAccount}
        >
          Add Holding
        </Button>
      </Box>

      <FormControl sx={{ mb: 3, minWidth: 300 }}>
        <InputLabel>Select Broker Account</InputLabel>
        <Select
          value={selectedAccount}
          label="Select Broker Account"
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          {accounts.map((account) => (
            <MenuItem key={account.id} value={account.id.toString()}>
              {account.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary">
            Total Cost
          </Typography>
          <Typography variant="h6">
            {formatCurrency(calculateTotalCost(), selectedAccountData?.currency || 'CNY')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary">
            Current Value
          </Typography>
          <Typography variant="h6">
            {formatCurrency(calculateTotalValue(), selectedAccountData?.currency || 'CNY')}
          </Typography>
        </Paper>
        <Paper sx={{ p: 2, flex: 1, minWidth: 200 }}>
          <Typography variant="body2" color="text.secondary">
            Unrealized Gain/Loss
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: calculateGainLoss() >= 0 ? 'success.main' : 'error.main',
            }}
          >
            {formatCurrency(calculateGainLoss(), selectedAccountData?.currency || 'CNY')}
          </Typography>
        </Paper>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Symbol</TableCell>
                <TableCell align="right">Shares</TableCell>
                <TableCell align="right">Avg Cost</TableCell>
                <TableCell align="right">Current Price</TableCell>
                <TableCell align="right">Total Value</TableCell>
                <TableCell align="right">Gain/Loss</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {holdings.map((holding) => {
                const totalValue = holding.shares * holding.current_price;
                const totalCost = holding.shares * holding.avg_cost;
                const gainLoss = totalValue - totalCost;
                const gainLossPercent = ((gainLoss / totalCost) * 100).toFixed(2);

                return (
                  <TableRow key={holding.id}>
                    <TableCell>
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {holding.symbol}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{holding.shares}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(holding.avg_cost, holding.currency)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(holding.current_price, holding.currency)}
                    </TableCell>
                    <TableCell align="right">
                      <Typography sx={{ fontWeight: 'bold' }}>
                        {formatCurrency(totalValue, holding.currency)}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: gainLoss >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {formatCurrency(gainLoss, holding.currency)} ({gainLossPercent}%)
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleOpenForm(holding)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(holding.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
              {holdings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography color="text.secondary" sx={{ py: 3 }}>
                      No holdings yet. Click "Add Holding" to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={formOpen} onClose={() => setFormOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingHolding ? 'Edit Holding' : 'Add Stock Holding'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              fullWidth
              required
              placeholder="e.g., AAPL, TSLA"
            />
            <TextField
              label="Shares"
              type="number"
              value={formData.shares}
              onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              label="Average Cost"
              type="number"
              value={formData.avg_cost}
              onChange={(e) => setFormData({ ...formData, avg_cost: e.target.value })}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              label="Current Price"
              type="number"
              value={formData.current_price}
              onChange={(e) => setFormData({ ...formData, current_price: e.target.value })}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFormOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingHolding ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default StockHoldings;
