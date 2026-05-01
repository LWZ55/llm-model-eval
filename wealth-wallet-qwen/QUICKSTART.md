# Quick Start Instructions

## The application is already running!

### Current Status
✅ Backend Server: Running on http://localhost:8000
✅ Frontend Server: Running on http://localhost:5174
✅ Database: SQLite (wealth_wallet.db created automatically)

### Access the Application

1. **Frontend Application**: Click the preview button in the tool panel to open the Wealth Wallet UI
2. **Backend API Documentation**: Visit http://localhost:8000/docs to explore the API

### How to Use

1. **Create Your First Account**:
   - Click on "Accounts" in the left navigation
   - Click the "Add Account" button
   - Enter account details (name, type, currency)
   - Click "Create"

2. **Add Transactions**:
   - Navigate to "Transactions"
   - Select an account
   - Click "Add Transaction"
   - Choose deposit or liability, enter amount and details

3. **Track Stocks** (for broker accounts):
   - Navigate to "Stock Holdings"
   - Select a broker account
   - Click "Add Holding"
   - Enter stock details

4. **View Dashboard**:
   - See your total wealth overview
   - View balance history charts
   - Check currency breakdown

### Stopping the Servers

Press `Ctrl+C` in each terminal window running the servers.

### Restarting the Servers

**Backend:**
```bash
cd /Users/alvin/ai-dev/wealth-wallet-qwen/backend
python3 main.py
```

**Frontend:**
```bash
cd /Users/alvin/ai-dev/wealth-wallet-qwen/frontend
npm run dev
```

### Testing the API

You can test the API directly from the terminal:

```bash
# Create an account
curl -X POST http://localhost:8000/api/accounts/ \
  -H "Content-Type: application/json" \
  -d '{"name":"My Bank Account","type":"bank","currency":"CNY"}'

# List all accounts
curl http://localhost:8000/api/accounts/

# Get dashboard summary
curl http://localhost:8000/api/dashboard/summary
```

### Need Help?

- Check the full README.md for detailed documentation
- View API documentation at http://localhost:8000/docs
- Check terminal output for any error messages
