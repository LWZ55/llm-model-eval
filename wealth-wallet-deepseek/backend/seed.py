"""
Seed script to populate the Wealth Wallet database with realistic mock data.
Run: cd backend && python3 seed.py
"""
from datetime import date, timedelta
import random
from database import engine, SessionLocal, Base
from models import Account, Transaction, StockHolding

# Recreate tables
Base.metadata.create_all(bind=engine)
db = SessionLocal()

# Clear existing data
db.query(StockHolding).delete()
db.query(Transaction).delete()
db.query(Account).delete()
db.commit()

print("Seeding database...")

# --- Accounts ---
accounts = [
    Account(name="ICBC Savings", type="bank", currency="CNY"),
    Account(name="招商银行 CMB", type="bank", currency="CNY"),
    Account(name="Futu Brokerage", type="brokerage", currency="HKD"),
    Account(name="Charles Schwab", type="brokerage", currency="USD"),
    Account(name="Octopus Card", type="transit", currency="HKD"),
    Account(name="Beijing Yikatong", type="transit", currency="CNY"),
    Account(name="Ant Group Yu'e Bao", type="bank", currency="CNY"),
]
db.add_all(accounts)
db.commit()

# Refresh to get IDs
for a in accounts:
    db.refresh(a)

# --- Helper to generate dates ---
def random_dates(start_days_ago, count):
    base = date.today()
    return sorted([base - timedelta(days=random.randint(1, start_days_ago)) for _ in range(count)])

# --- Transactions per account ---
txn_data = [
    # ICBC Savings (bank, CNY)
    {
        "account": accounts[0],
        "txns": [
            ("deposit", 50000, "Monthly salary", 90),
            ("deposit", 20000, "Year-end bonus", 60),
            ("liability", 8000, "Rent payment", 75),
            ("liability", 2500, "Utilities", 70),
            ("liability", 3000, "Grocery shopping", 65),
            ("deposit", 10000, "Freelance income", 45),
            ("liability", 5000, "Insurance premium", 30),
            ("liability", 1500, "Mobile bill", 15),
            ("deposit", 8000, "Stock dividend transfer", 10),
        ],
    },
    # CMB (bank, CNY)
    {
        "account": accounts[1],
        "txns": [
            ("deposit", 30000, "Salary", 88),
            ("liability", 12000, "Mortgage", 80),
            ("liability", 4000, "Car loan", 72),
            ("deposit", 15000, "Investment return", 55),
            ("liability", 2000, "Dining out", 50),
            ("liability", 6000, "Home renovation", 35),
            ("deposit", 5000, "Side project", 20),
        ],
    },
    # Futu Brokerage (HKD)
    {
        "account": accounts[2],
        "txns": [
            ("deposit", 200000, "Initial capital transfer", 100),
            ("liability", 50000, "Withdrawal to bank", 70),
            ("deposit", 80000, "Top-up funds", 50),
            ("liability", 30000, "Margin repayment", 25),
            ("deposit", 50000, "Additional investment", 15),
        ],
    },
    # Charles Schwab (USD)
    {
        "account": accounts[3],
        "txns": [
            ("deposit", 50000, "Wire transfer from HK", 95),
            ("deposit", 20000, "Bonus deposit", 60),
            ("liability", 8000, "Wire transfer fee", 55),
            ("liability", 15000, "Withdrawal", 40),
            ("deposit", 10000, "USD deposit", 20),
        ],
    },
    # Octopus Card (HKD)
    {
        "account": accounts[4],
        "txns": [
            ("deposit", 1000, "Top-up at 7-Eleven", 30),
            ("liability", 48, "MTR fare", 28),
            ("liability", 25, "Bus fare", 25),
            ("deposit", 500, "Auto-add value", 20),
            ("liability", 12, "Tram fare", 18),
            ("liability", 35, "Convenience store", 12),
            ("deposit", 300, "Manual top-up", 8),
        ],
    },
    # Beijing Yikatong (CNY)
    {
        "account": accounts[5],
        "txns": [
            ("deposit", 500, "Top-up at station", 25),
            ("liability", 6, "Subway Line 1", 22),
            ("liability", 4, "Bus 300", 20),
            ("liability", 8, "Subway Line 10", 15),
            ("deposit", 200, "Online recharge", 10),
            ("liability", 3, "Bus 52", 5),
        ],
    },
    # Yu'e Bao (bank, CNY)
    {
        "account": accounts[6],
        "txns": [
            ("deposit", 100000, "Initial deposit from CMB", 85),
            ("liability", 20000, "Transfer to ICBC", 70),
            ("deposit", 30000, "Monthly auto-save", 55),
            ("liability", 10000, "Alipay spending", 40),
            ("deposit", 5000, "Interest income", 25),
            ("liability", 15000, "Taobao purchase", 15),
            ("deposit", 20000, "WeChat transfer in", 8),
        ],
    },
]

for entry in txn_data:
    acc = entry["account"]
    for txn_type, amount, desc, days_ago in entry["txns"]:
        txn_date = date.today() - timedelta(days=days_ago)
        db.add(Transaction(
            account_id=acc.id,
            type=txn_type,
            amount=amount,
            description=desc,
            date=txn_date,
        ))

db.commit()

# --- Stock Holdings (brokerage accounts only) ---
stock_data = [
    # Futu Brokerage - Hong Kong stocks
    {
        "account": accounts[2],
        "holdings": [
            ("0700", "Tencent Holdings", 500, 320.0, 385.0),
            ("9988", "Alibaba Group", 1000, 78.5, 82.3),
            ("3690", "Meituan", 300, 105.0, 118.5),
            ("1810", "Xiaomi Corp", 2000, 14.2, 18.6),
            ("2318", "Ping An Insurance", 400, 48.0, 43.5),
        ],
    },
    # Charles Schwab - US stocks
    {
        "account": accounts[3],
        "holdings": [
            ("AAPL", "Apple Inc.", 150, 165.0, 195.0),
            ("MSFT", "Microsoft Corp.", 80, 370.0, 425.0),
            ("TSLA", "Tesla Inc.", 200, 215.0, 248.0),
            ("NVDA", "NVIDIA Corp.", 100, 680.0, 880.0),
            ("GOOGL", "Alphabet Inc.", 60, 138.0, 152.0),
            ("AMZN", "Amazon.com", 40, 175.0, 186.0),
        ],
    },
]

for entry in stock_data:
    acc = entry["account"]
    for code, name, qty, cost, current in entry["holdings"]:
        db.add(StockHolding(
            account_id=acc.id,
            stock_code=code,
            stock_name=name,
            quantity=qty,
            cost_price=cost,
            current_price=current,
        ))

db.commit()
db.close()

print("Seed complete! Summary:")
print("  7 accounts (3 bank, 2 brokerage, 2 transit)")
print("  49 transactions across all accounts")
print("  11 stock holdings across 2 brokerage accounts")
print("  Currencies: CNY, USD, HKD")
