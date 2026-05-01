"""
Script to add mocked data to the Wealth Wallet database
"""
from datetime import date, timedelta
from sqlalchemy.orm import Session
from database import SessionLocal
from models import Account, Transaction, StockHolding

def add_mocked_data():
    db = SessionLocal()
    
    # Check if data already exists
    if db.query(Account).first():
        print("Data already exists, skipping...")
        db.close()
        return
    
    print("Adding mocked data...")
    
    # Create Bank Account (CNY)
    bank_account = Account(name="China Merchants Bank", type="bank", currency="CNY", balance=50000)
    db.add(bank_account)
    db.flush()
    
    # Create Securities Account (USD)
    securities_account = Account(name="Interactive Brokers", type="securities", currency="USD", balance=25000)
    db.add(securities_account)
    db.flush()
    
    # Create Transit Card (CNY)
    transit_account = Account(name="Shanghai Metro Card", type="transit", currency="CNY", balance=150)
    db.add(transit_account)
    db.flush()
    
    # Bank account transactions
    transactions = [
        Transaction(account_id=bank_account.id, type="deposit", amount=30000, description="Initial deposit", date=date.today() - timedelta(days=60)),
        Transaction(account_id=bank_account.id, type="deposit", amount=15000, description="Salary", date=date.today() - timedelta(days=45)),
        Transaction(account_id=bank_account.id, type="debt", amount=5000, description="Shopping", date=date.today() - timedelta(days=30)),
        Transaction(account_id=bank_account.id, type="deposit", amount=10000, description="Bonus", date=date.today() - timedelta(days=15)),
        Transaction(account_id=bank_account.id, type="debt", amount=3000, description="Utilities", date=date.today() - timedelta(days=7)),
        
        # Securities account transactions
        Transaction(account_id=securities_account.id, type="deposit", amount=30000, description="Transfer from bank", date=date.today() - timedelta(days=90)),
        Transaction(account_id=securities_account.id, type="debt", amount=5000, description="Stock purchase AAPL", date=date.today() - timedelta(days=60)),
        
        # Transit card transactions
        Transaction(account_id=transit_account.id, type="deposit", amount=200, description="Top up", date=date.today() - timedelta(days=20)),
        Transaction(account_id=transit_account.id, type="debt", amount=50, description="Metro rides", date=date.today() - timedelta(days=10)),
    ]
    
    for tx in transactions:
        db.add(tx)
    
    # Stock holdings for securities account
    holdings = [
        StockHolding(account_id=securities_account.id, symbol="AAPL", name="Apple Inc.", quantity=50, cost_price=175.50, current_price=185.25),
        StockHolding(account_id=securities_account.id, symbol="MSFT", name="Microsoft Corp.", quantity=30, cost_price=380.00, current_price=395.50),
        StockHolding(account_id=securities_account.id, symbol="GOOGL", name="Alphabet Inc.", quantity=20, cost_price=140.25, current_price=175.80),
        StockHolding(account_id=securities_account.id, symbol="TSLA", name="Tesla Inc.", quantity=25, cost_price=250.00, current_price=235.50),
    ]
    
    for holding in holdings:
        db.add(holding)
    
    db.commit()
    print(f"Added {len(transactions)} transactions and {len(holdings)} stock holdings!")
    db.close()


if __name__ == "__main__":
    add_mocked_data()