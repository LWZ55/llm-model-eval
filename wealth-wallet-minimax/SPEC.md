# Wealth Wallet Application Specification

## 1. Project Overview
- **Project Name**: Wealth Wallet
- **Type**: Full-stack web application (React + FastAPI)
- **Core Functionality**: Track financial accounts including bank accounts, securities accounts, and transit cards with deposits, debts, stock holdings, and balance visualization
- **Target Users**: Personal finance management users

## 2. Technical Stack

### Backend
- **Framework**: Python FastAPI
- **Database**: SQLite with SQLAlchemy ORM
- **API Style**: RESTful JSON API

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Tailwind CSS
- **Charts**: Recharts
- **State Management**: React hooks (useState, useEffect)
- **HTTP Client**: Axios

## 3. Data Models

### Account
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| name | VARCHAR(100) | Account name |
| type | ENUM | 'bank', 'securities', 'transit' |
| currency | ENUM | 'CNY', 'USD', 'HKD' (default: CNY) |
| balance | DECIMAL | Current balance (deposits - debts) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### Transaction
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| account_id | INTEGER | Foreign key to Account |
| type | ENUM | 'deposit', 'debt' |
| amount | DECIMAL | Transaction amount |
| description | VARCHAR(200) | Transaction description |
| date | DATE | Transaction date |
| created_at | DATETIME | Creation timestamp |

### StockHolding
| Field | Type | Description |
|-------|------|-------------|
| id | INTEGER | Primary key |
| account_id | INTEGER | Foreign key to Account (securities type only) |
| symbol | VARCHAR(20) | Stock ticker symbol |
| name | VARCHAR(100) | Stock name |
| quantity | DECIMAL | Number of shares |
| cost_price | DECIMAL | Average cost per share |
| current_price | DECIMAL | Current market price |
| updated_at | DATETIME | Last price update |

## 4. API Endpoints

### Accounts
- `GET /api/accounts` - List all accounts
- `POST /api/accounts` - Create new account
- `GET /api/accounts/{id}` - Get account details
- `PUT /api/accounts/{id}` - Update account
- `DELETE /api/accounts/{id}` - Delete account

### Transactions
- `GET /api/accounts/{id}/transactions` - List transactions for account
- `POST /api/accounts/{id}/transactions` - Add transaction
- `DELETE /api/transactions/{id}` - Delete transaction

### Stock Holdings
- `GET /api/accounts/{id}/holdings` - List holdings for securities account
- `POST /api/accounts/{id}/holdings` - Add/update stock holding
- `DELETE /api/holdings/{id}` - Delete holding

### Dashboard
- `GET /api/dashboard/summary` - Get total balance in all currencies
- `GET /api/accounts/{id}/balance-history` - Get balance history for charts

### Currency Conversion
- `GET /api/currencies/rates` - Get current exchange rates (static for demo)

## 5. UI Components

### Dashboard (Home)
- Total balance summary card (all accounts combined, converted to CNY)
- Account cards with balance and type icon
- Quick add transaction button
- Balance trend chart (line chart showing total balance over time)

### Account Detail Page
- Account information header
- Balance display with currency
- Transaction history list
- For securities accounts: Stock holdings table
- Add transaction form
- Balance trend line chart

### Account Management
- Account list view
- Add/Edit account modal
- Delete confirmation

### Transaction Form
- Account selector (dropdown)
- Transaction type (deposit/debt)
- Amount input
- Description input
- Date picker

## 6. Currency Support
- **CNY** (Chinese Yuan) - Default
- **USD** (US Dollar)
- **HKD** (Hong Kong Dollar)

### Static Exchange Rates (for demo)
- 1 USD = 7.24 CNY
- 1 HKD = 0.92 CNY

## 7. Visual Design

### Color Scheme
- Primary: Blue (#3B82F6)
- Success/Deposit: Green (#10B981)
- Warning/Debt: Red (#EF4444)
- Background: Gray (#F3F4F6)
- Card Background: White (#FFFFFF)

### Layout
- Responsive design
- Sidebar navigation on desktop
- Bottom navigation on mobile
- Card-based content display

### Icons
- Bank: 🏦
- Securities: 📈
- Transit: 🚇
- Deposit: ↑ (green)
- Debt: ↓ (red)

## 8. Page Structure

1. **Dashboard** (`/`) - Overview of all accounts
2. **Account Detail** (`/accounts/:id`) - Single account details
3. **Add Account** (`/accounts/new`) - Create new account
4. **Add Transaction** (`/transactions/new`) - Add transaction modal

## 9. Features Checklist

- [x] Create bank account
- [x] Create securities account
- [x] Create transit card
- [x] Record deposits
- [x] Record debts
- [x] Add stock holdings (securities only)
- [x] View total balance (multi-currency converted to CNY)
- [x] Balance trend line chart
- [x] Account-specific balance chart
- [x] Delete accounts/transactions