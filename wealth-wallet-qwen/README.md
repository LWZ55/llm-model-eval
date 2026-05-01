# Wealth Wallet Application

A comprehensive wealth management application that tracks deposits, liabilities, and stock holdings across multiple account types with multi-currency support.

## Features

- **Multi-Account Support**: Track bank accounts, broker accounts, and wallets
- **Multi-Currency**: Support for CNY (¥), USD ($), and HKD (HK$)
- **Transaction Management**: Record deposits and liabilities for each account
- **Stock Portfolio Tracking**: Monitor stock holdings in broker accounts
- **Automatic Balance Calculation**: Calculates total balance (deposits - liabilities + holdings value)
- **Visual Charts**: Line chart visualization for account balance history
- **Dashboard**: Overview of total wealth with currency breakdown

## Tech Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: SQLite
- **ORM**: SQLAlchemy
- **Validation**: Pydantic

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI)
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router
- **Date Handling**: date-fns

## Project Structure

```
wealth-wallet-qwen/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── models.py               # SQLAlchemy database models
│   ├── schemas.py              # Pydantic validation schemas
│   ├── database.py             # Database configuration
│   ├── requirements.txt        # Python dependencies
│   ├── routes/
│   │   ├── accounts.py         # Account CRUD endpoints
│   │   ├── transactions.py     # Transaction endpoints
│   │   ├── stocks.py           # Stock holding endpoints
│   │   └── dashboard.py        # Dashboard & analytics endpoints
│   └── utils/
│       └── calculations.py     # Balance calculation utilities
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── Layout.jsx          # App shell with navigation
    │   │   ├── BalanceCard.jsx     # Balance display card
    │   │   ├── AccountForm.jsx     # Account create/edit form
    │   │   ├── TransactionForm.jsx # Transaction form
    │   │   └── BalanceChart.jsx    # Recharts line chart
    │   ├── pages/
    │   │   ├── Dashboard.jsx       # Main dashboard page
    │   │   ├── Accounts.jsx        # Accounts management page
    │   │   ├── Transactions.jsx    # Transactions page
    │   │   └── StockHoldings.jsx   # Stock holdings page
    │   ├── services/
    │   │   └── api.js              # API service layer
    │   ├── utils/
    │   │   └── currency.js         # Currency formatting utilities
    │   ├── App.jsx                 # Main app component
    │   └── main.jsx                # React entry point
    ├── package.json
    └── vite.config.js
```

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

API Documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173` (or `http://localhost:5174` if 5173 is occupied)

## API Endpoints

### Accounts
- `GET /api/accounts/` - List all accounts
- `POST /api/accounts/` - Create a new account
- `GET /api/accounts/{id}` - Get account details
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account
- `GET /api/accounts/{id}/balance` - Get account balance

### Transactions
- `GET /api/accounts/{id}/transactions/` - List transactions for an account
- `POST /api/accounts/{id}/transactions/` - Add a transaction

### Stock Holdings
- `GET /api/accounts/{id}/holdings` - List stock holdings (broker accounts only)
- `POST /api/accounts/{id}/holdings` - Add a stock holding
- `PUT /api/holdings/{id}` - Update a holding
- `DELETE /api/holdings/{id}` - Delete a holding

### Dashboard
- `GET /api/dashboard/summary` - Get total balance summary
- `GET /api/dashboard/account-history/{id}` - Get account balance history
- `GET /api/dashboard/currency-breakdown` - Get balance by currency

## Usage Guide

### 1. Create an Account
- Navigate to the "Accounts" page
- Click "Add Account"
- Enter account name, select type (Bank/Broker/Wallet), and choose currency
- Click "Create"

### 2. Add Transactions
- Navigate to the "Transactions" page
- Select an account from the dropdown
- Click "Add Transaction"
- Choose transaction type (Deposit/Liability), enter amount, date, and description
- Click "Add Transaction"

### 3. Track Stock Holdings (Broker Accounts Only)
- Navigate to the "Stock Holdings" page
- Select a broker account
- Click "Add Holding"
- Enter stock symbol, shares, average cost, and current price
- Click "Add"

### 4. View Dashboard
- Navigate to the "Dashboard" page
- View total balance across all accounts
- See currency breakdown
- Select an account to view its balance history chart

## Balance Calculation

The application automatically calculates balances using the following formula:

**Account Balance = Total Deposits - Total Liabilities + Stock Holdings Value**

- For bank accounts and wallets: Balance = Deposits - Liabilities
- For broker accounts: Balance = Deposits - Liabilities + (Shares × Current Price for all holdings)

## Development

### Backend Development

The backend uses FastAPI with automatic reload:
```bash
cd backend
uvicorn main:app --reload
```

### Frontend Development

The frontend uses Vite with hot module replacement (HMR):
```bash
cd frontend
npm run dev
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

## License

MIT

## Support

For issues or questions, please open an issue in the repository.
