# Mock Data Documentation

## Overview

The application includes a comprehensive mock data script that populates the database with realistic financial data for testing and demonstration purposes.

## Mock Data Summary

### Accounts (6 Total)

1. **ICBC Savings Account** (Bank - CNY)
   - Chinese bank account with regular salary deposits
   - Balance: ¥124,700.00

2. **Chase Checking** (Bank - USD)
   - US bank account with freelance income
   - Balance: $17,050.00

3. **HSBC Hong Kong Account** (Bank - HKD)
   - Hong Kong bank account with investment income
   - Balance: HK$122,000.00

4. **Futu Securities** (Broker - HKD)
   - Hong Kong stock brokerage account
   - Holdings Value: HK$275,515.00
   - Contains 5 stock positions

5. **Beijing Transit Card** (Wallet - CNY)
   - Public transportation wallet
   - Balance: ¥395.00

6. **China Merchants Bank Credit Card** (Bank - CNY)
   - Credit card account (liability)
   - Balance: -¥11,500.00

### Transactions (38 Total)

#### ICBC Savings Account (10 transactions)
- **Deposits:**
  - 3 monthly salary payments (¥50,000 each)
  - 1 year-end bonus (¥5,000)
- **Liabilities:**
  - 3 rent payments (¥8,000 each)
  - 3 grocery/utility payments (¥1,800-¥2,500)

#### Chase Checking (9 transactions)
- **Deposits:**
  - 3 freelance payments ($8,000 each)
- **Liabilities:**
  - 3 apartment rent payments ($1,500 each)
  - 3 living expenses ($700-$950)

#### HSBC Hong Kong Account (4 transactions)
- **Deposits:**
  - Initial deposit (HK$100,000)
  - Investment income (HK$30,000)
- **Liabilities:**
  - Account fees (HK$5,000)
  - Transfer fees (HK$3,000)

#### Beijing Transit Card (11 transactions)
- **Deposits:**
  - 3 top-ups (¥500 each)
- **Liabilities:**
  - 8 subway/bus ride charges (¥120-¥160)

#### Credit Card (4 transactions)
- **Liabilities:**
  - Shopping - Electronics (¥5,000)
  - Restaurant and dining (¥2,000)
  - Online shopping (¥3,000)
  - Utilities and bills (¥1,500)

### Stock Holdings (5 positions in Futu Securities)

| Symbol | Company | Shares | Avg Cost | Current Price | Total Value | Gain/Loss |
|--------|---------|--------|----------|---------------|-------------|-----------|
| 0700.HK | Tencent | 200 | HK$320.50 | HK$385.60 | HK$77,120 | +HK$13,020 (+20.3%) |
| 9988.HK | Alibaba | 500 | HK$95.20 | HK$82.45 | HK$41,225 | -HK$6,375 (-13.4%) |
| 0941.HK | China Mobile | 1,000 | HK$68.50 | HK$75.30 | HK$75,300 | +HK$6,800 (+10.0%) |
| 1810.HK | Xiaomi | 2,000 | HK$12.80 | HK$15.60 | HK$31,200 | +HK$5,600 (+21.9%) |
| 9618.HK | JD.com | 300 | HK$145.00 | HK$168.90 | HK$50,670 | +HK$7,170 (+16.5%) |

**Total Portfolio Value:** HK$275,515.00
**Total Unrealized Gain:** +HK$26,215 (+10.5%)

## How to Use Mock Data

### Load Mock Data

Run the script from the backend directory:

```bash
cd backend
python3 mock_data.py
```

This will:
1. Create 6 accounts across different types and currencies
2. Add 38 transactions spanning the last 90 days
3. Create 5 stock holdings in the broker account
4. Display a summary of created data

### Reset Data

To start fresh or reload mock data:

1. Stop the backend server (Ctrl+C)
2. Delete the database file:
   ```bash
   rm wealth_wallet.db
   ```
3. Restart the backend server (it will create a new database):
   ```bash
   python3 main.py
   ```
4. Load mock data:
   ```bash
   python3 mock_data.py
   ```

### Verify Data

Check that data was loaded successfully:

```bash
# View dashboard summary
curl http://localhost:8000/api/dashboard/summary

# List all accounts
curl http://localhost:8000/api/accounts/

# View stock holdings
curl http://localhost:8000/api/accounts/4/holdings

# View transactions for an account
curl http://localhost:8000/api/accounts/1/transactions/
```

## Data Distribution

### By Currency
- **CNY (Chinese Yuan):** ¥113,595.00
  - ICBC Savings: ¥124,700
  - Transit Card: ¥395
  - Credit Card: -¥11,500

- **USD (US Dollar):** $17,050.00
  - Chase Checking: $17,050

- **HKD (Hong Kong Dollar):** HK$397,515.00
  - HSBC HK: HK$122,000
  - Futu Securities: HK$275,515

### By Account Type
- **Bank Accounts:** 4 accounts
- **Broker Accounts:** 1 account
- **Wallets:** 1 account

### Time Range
- Transactions span the last 90 days
- Regular recurring transactions (monthly salary, rent, etc.)
- Realistic spending patterns

## Features Demonstrated

With this mock data, you can test:

✅ Multi-currency balance tracking
✅ Different account types (bank, broker, wallet)
✅ Deposit and liability transactions
✅ Stock portfolio management
✅ Balance calculations (deposits - liabilities + holdings)
✅ Dashboard summary with currency breakdown
✅ Balance history charts (90 days of data)
✅ Positive and negative balances
✅ Gain/loss calculations for stocks
✅ Account filtering and selection

## Customization

You can modify the mock data script to:
- Add more accounts
- Create different transaction patterns
- Add more stock holdings
- Change currencies
- Adjust time ranges
- Create specific test scenarios

Simply edit `backend/mock_data.py` and re-run the script after resetting the database.
