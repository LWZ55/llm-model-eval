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

function AccountForm({ open, onClose, onSubmit, initialData }) {
  const [name, setName] = useState(initialData?.name || '');
  const [type, setType] = useState(initialData?.type || 'bank');
  const [currency, setCurrency] = useState(initialData?.currency || 'CNY');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    onSubmit({ name, type, currency });
    setName('');
    setType('bank');
    setCurrency('CNY');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {initialData ? 'Edit Account' : 'Add New Account'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Account Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={type}
                label="Account Type"
                onChange={(e) => setType(e.target.value)}
              >
                <MenuItem value="bank">Bank Account</MenuItem>
                <MenuItem value="broker">Broker Account</MenuItem>
                <MenuItem value="wallet">Wallet</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth required>
              <InputLabel>Currency</InputLabel>
              <Select
                value={currency}
                label="Currency"
                onChange={(e) => setCurrency(e.target.value)}
              >
                <MenuItem value="CNY">CNY (¥) - Chinese Yuan</MenuItem>
                <MenuItem value="USD">USD ($) - US Dollar</MenuItem>
                <MenuItem value="HKD">HKD (HK$) - Hong Kong Dollar</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {initialData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default AccountForm;
