import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
} from '@mui/material';

function TransactionForm({ open, onClose, onSubmit }) {
  const [type, setType] = useState('deposit');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date());

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) return;

    onSubmit({
      type,
      amount: parseFloat(amount),
      description,
      date: date.toISOString(),
    });
    
    setType('deposit');
    setAmount('');
    setDescription('');
    setDate(new Date());
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Add Transaction</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth required>
              <InputLabel>Transaction Type</InputLabel>
              <Select
                value={type}
                label="Transaction Type"
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value="deposit">Deposit</MenuItem>
                <MenuItem value="liability">Liability</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            <TextField
              label="Date"
              type="date"
              value={date.toISOString().split('T')[0]}
              onChange={(e) => setDate(new Date(e.target.value))}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            Add Transaction
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default TransactionForm;
