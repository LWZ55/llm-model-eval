"""
Script to populate the database with mock data for testing
"""
from database import SessionLocal, engine, Base
from models import Account, Transaction, StockHolding, AccountType, Currency, TransactionType
from datetime import datetime, timedelta
import random

def create_mock_data():
    db = SessionLocal()
    
    try:
        print("Creating mock data...")
        
        # Create Accounts
        print("\n1. Creating accounts...")
        accounts = [
            Account(
                name="ICBC Savings Account",
                type=AccountType.BANK,
                currency=Currency.CNY
            ),
            Account(
                name="Chase Checking",
                type=AccountType.BANK,
                currency=Currency.USD
            ),
            Account(
                name="HSBC Hong Kong Account",
                type=AccountType.BANK,
                currency=Currency.HKD
            ),
            Account(
                name="Futu Securities",
                type=AccountType.BROKER,
                currency=Currency.HKD
            ),
            Account(
                name="Beijing Transit Card",
                type=AccountType.WALLET,
                currency=Currency.CNY
            ),
            Account(
                name="China Merchants Bank Credit Card",
                type=AccountType.BANK,
                currency=Currency.CNY
            ),
        ]
        
        for account in accounts:
            db.add(account)
        db.commit()
        
        print(f"✓ Created {len(accounts)} accounts")
        
        # Refresh to get IDs
        for account in accounts:
            db.refresh(account)
        
        # Create Transactions for ICBC Savings Account
        print("\n2. Creating transactions for ICBC Savings Account...")
        icbc_transactions = [
            {"type": TransactionType.DEPOSIT, "amount": 50000, "description": "Monthly salary", "days_ago": 90},
            {"type": TransactionType.DEPOSIT, "amount": 50000, "description": "Monthly salary", "days_ago": 60},
            {"type": TransactionType.DEPOSIT, "amount": 50000, "description": "Monthly salary", "days_ago": 30},
            {"type": TransactionType.DEPOSIT, "amount": 5000, "description": "Year-end bonus", "days_ago": 45},
            {"type": TransactionType.LIABILITY, "amount": 8000, "description": "Rent payment", "days_ago": 85},
            {"type": TransactionType.LIABILITY, "amount": 8000, "description": "Rent payment", "days_ago": 55},
            {"type": TransactionType.LIABILITY, "amount": 8000, "description": "Rent payment", "days_ago": 25},
            {"type": TransactionType.LIABILITY, "amount": 2000, "description": "Groceries and utilities", "days_ago": 80},
            {"type": TransactionType.LIABILITY, "amount": 2500, "description": "Groceries and utilities", "days_ago": 50},
            {"type": TransactionType.LIABILITY, "amount": 1800, "description": "Groceries and utilities", "days_ago": 20},
        ]
        
        for txn_data in icbc_transactions:
            txn = Transaction(
                account_id=accounts[0].id,
                type=txn_data["type"],
                amount=txn_data["amount"],
                description=txn_data["description"],
                date=datetime.utcnow() - timedelta(days=txn_data["days_ago"])
            )
            db.add(txn)
        
        print(f"✓ Created {len(icbc_transactions)} transactions for ICBC")
        
        # Create Transactions for Chase Checking
        print("\n3. Creating transactions for Chase Checking...")
        chase_transactions = [
            {"type": TransactionType.DEPOSIT, "amount": 8000, "description": "Freelance payment", "days_ago": 75},
            {"type": TransactionType.DEPOSIT, "amount": 8000, "description": "Freelance payment", "days_ago": 45},
            {"type": TransactionType.DEPOSIT, "amount": 8000, "description": "Freelance payment", "days_ago": 15},
            {"type": TransactionType.LIABILITY, "amount": 1500, "description": "Apartment rent", "days_ago": 70},
            {"type": TransactionType.LIABILITY, "amount": 1500, "description": "Apartment rent", "days_ago": 40},
            {"type": TransactionType.LIABILITY, "amount": 1500, "description": "Apartment rent", "days_ago": 10},
            {"type": TransactionType.LIABILITY, "amount": 800, "description": "Living expenses", "days_ago": 65},
            {"type": TransactionType.LIABILITY, "amount": 950, "description": "Living expenses", "days_ago": 35},
            {"type": TransactionType.LIABILITY, "amount": 700, "description": "Living expenses", "days_ago": 5},
        ]
        
        for txn_data in chase_transactions:
            txn = Transaction(
                account_id=accounts[1].id,
                type=txn_data["type"],
                amount=txn_data["amount"],
                description=txn_data["description"],
                date=datetime.utcnow() - timedelta(days=txn_data["days_ago"])
            )
            db.add(txn)
        
        print(f"✓ Created {len(chase_transactions)} transactions for Chase")
        
        # Create Transactions for HSBC HK
        print("\n4. Creating transactions for HSBC HK...")
        hsbc_transactions = [
            {"type": TransactionType.DEPOSIT, "amount": 100000, "description": "Initial deposit", "days_ago": 120},
            {"type": TransactionType.DEPOSIT, "amount": 30000, "description": "Investment income", "days_ago": 60},
            {"type": TransactionType.LIABILITY, "amount": 5000, "description": "Account fees", "days_ago": 90},
            {"type": TransactionType.LIABILITY, "amount": 3000, "description": "Transfer fees", "days_ago": 30},
        ]
        
        for txn_data in hsbc_transactions:
            txn = Transaction(
                account_id=accounts[2].id,
                type=txn_data["type"],
                amount=txn_data["amount"],
                description=txn_data["description"],
                date=datetime.utcnow() - timedelta(days=txn_data["days_ago"])
            )
            db.add(txn)
        
        print(f"✓ Created {len(hsbc_transactions)} transactions for HSBC")
        
        # Create Transactions for Beijing Transit Card
        print("\n5. Creating transactions for Beijing Transit Card...")
        transit_transactions = [
            {"type": TransactionType.DEPOSIT, "amount": 500, "description": "Top up", "days_ago": 90},
            {"type": TransactionType.DEPOSIT, "amount": 500, "description": "Top up", "days_ago": 60},
            {"type": TransactionType.DEPOSIT, "amount": 500, "description": "Top up", "days_ago": 30},
            {"type": TransactionType.LIABILITY, "amount": 120, "description": "Subway rides", "days_ago": 80},
            {"type": TransactionType.LIABILITY, "amount": 150, "description": "Subway and bus", "days_ago": 70},
            {"type": TransactionType.LIABILITY, "amount": 130, "description": "Daily commute", "days_ago": 60},
            {"type": TransactionType.LIABILITY, "amount": 140, "description": "Daily commute", "days_ago": 50},
            {"type": TransactionType.LIABILITY, "amount": 160, "description": "Subway and bus", "days_ago": 40},
            {"type": TransactionType.LIABILITY, "amount": 125, "description": "Daily commute", "days_ago": 30},
            {"type": TransactionType.LIABILITY, "amount": 135, "description": "Daily commute", "days_ago": 20},
            {"type": TransactionType.LIABILITY, "amount": 145, "description": "Daily commute", "days_ago": 10},
        ]
        
        for txn_data in transit_transactions:
            txn = Transaction(
                account_id=accounts[4].id,
                type=txn_data["type"],
                amount=txn_data["amount"],
                description=txn_data["description"],
                date=datetime.utcnow() - timedelta(days=txn_data["days_ago"])
            )
            db.add(txn)
        
        print(f"✓ Created {len(transit_transactions)} transactions for Transit Card")
        
        # Create Transactions for Credit Card (liabilities)
        print("\n6. Creating transactions for Credit Card...")
        credit_card_transactions = [
            {"type": TransactionType.LIABILITY, "amount": 5000, "description": "Shopping - Electronics", "days_ago": 55},
            {"type": TransactionType.LIABILITY, "amount": 2000, "description": "Restaurant and dining", "days_ago": 45},
            {"type": TransactionType.LIABILITY, "amount": 3000, "description": "Online shopping", "days_ago": 25},
            {"type": TransactionType.LIABILITY, "amount": 1500, "description": "Utilities and bills", "days_ago": 15},
        ]
        
        for txn_data in credit_card_transactions:
            txn = Transaction(
                account_id=accounts[5].id,
                type=txn_data["type"],
                amount=txn_data["amount"],
                description=txn_data["description"],
                date=datetime.utcnow() - timedelta(days=txn_data["days_ago"])
            )
            db.add(txn)
        
        print(f"✓ Created {len(credit_card_transactions)} transactions for Credit Card")
        
        # Create Stock Holdings for Futu Securities
        print("\n7. Creating stock holdings for Futu Securities...")
        holdings = [
            StockHolding(
                account_id=accounts[3].id,
                symbol="0700.HK",
                shares=200,
                avg_cost=320.50,
                current_price=385.60,
                currency=Currency.HKD
            ),
            StockHolding(
                account_id=accounts[3].id,
                symbol="9988.HK",
                shares=500,
                avg_cost=95.20,
                current_price=82.45,
                currency=Currency.HKD
            ),
            StockHolding(
                account_id=accounts[3].id,
                symbol="0941.HK",
                shares=1000,
                avg_cost=68.50,
                current_price=75.30,
                currency=Currency.HKD
            ),
            StockHolding(
                account_id=accounts[3].id,
                symbol="1810.HK",
                shares=2000,
                avg_cost=12.80,
                current_price=15.60,
                currency=Currency.HKD
            ),
            StockHolding(
                account_id=accounts[3].id,
                symbol="9618.HK",
                shares=300,
                avg_cost=145.00,
                current_price=168.90,
                currency=Currency.HKD
            ),
        ]
        
        for holding in holdings:
            db.add(holding)
        
        print(f"✓ Created {len(holdings)} stock holdings")
        
        # Commit all transactions
        db.commit()
        
        print("\n" + "="*50)
        print("✓ Mock data creation completed successfully!")
        print("="*50)
        print("\nSummary:")
        print(f"  - Accounts: {len(accounts)}")
        print(f"  - Total Transactions: {len(icbc_transactions) + len(chase_transactions) + len(hsbc_transactions) + len(transit_transactions) + len(credit_card_transactions)}")
        print(f"  - Stock Holdings: {len(holdings)}")
        print("\nYou can now view the data in the application!")
        
    except Exception as e:
        db.rollback()
        print(f"\n❌ Error creating mock data: {str(e)}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    create_mock_data()
