from sqlalchemy import func
from sqlalchemy.orm import Session
from models import Account, Transaction, StockHolding, TransactionType
from datetime import datetime
from collections import defaultdict

def calculate_account_balance(db: Session, account_id: int):
    """Calculate account balance: deposits - liabilities + holdings value"""
    
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        return None
    
    # Calculate deposits
    deposits = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id == account_id,
        Transaction.type == TransactionType.DEPOSIT
    ).scalar() or 0.0
    
    # Calculate liabilities
    liabilities = db.query(func.sum(Transaction.amount)).filter(
        Transaction.account_id == account_id,
        Transaction.type == TransactionType.LIABILITY
    ).scalar() or 0.0
    
    # Calculate holdings value (only for broker accounts)
    holdings_value = 0.0
    if account.type.value == "broker":
        holdings = db.query(StockHolding).filter(
            StockHolding.account_id == account_id
        ).all()
        holdings_value = sum(h.shares * h.current_price for h in holdings)
    
    balance = deposits - liabilities + holdings_value
    
    return {
        "account_id": account.id,
        "account_name": account.name,
        "currency": account.currency,
        "deposit_total": deposits,
        "liability_total": liabilities,
        "holdings_value": holdings_value,
        "balance": balance
    }

def calculate_total_balance(db: Session):
    """Calculate total balance across all accounts"""
    
    accounts = db.query(Account).all()
    currency_breakdown = defaultdict(float)
    account_balances = []
    
    for account in accounts:
        balance_info = calculate_account_balance(db, account.id)
        if balance_info:
            currency_breakdown[balance_info["currency"].value] += balance_info["balance"]
            account_balances.append(balance_info)
    
    # Convert defaultdict to regular dict for JSON serialization
    currency_breakdown = dict(currency_breakdown)
    
    # Use CNY as base for total (simple sum, no conversion)
    total_balance = sum(currency_breakdown.values())
    
    return {
        "total_balance": total_balance,
        "currency_breakdown": currency_breakdown,
        "accounts": account_balances
    }

def get_account_history(db: Session, account_id: int):
    """Get historical balance data for line chart"""
    
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        return []
    
    # Get all transactions ordered by date
    transactions = db.query(Transaction).filter(
        Transaction.account_id == account_id
    ).order_by(Transaction.date).all()
    
    # Aggregate by date
    balance_by_date = defaultdict(float)
    running_balance = 0.0
    
    for txn in transactions:
        date_str = txn.date.strftime("%Y-%m-%d")
        if txn.type == TransactionType.DEPOSIT:
            running_balance += txn.amount
        else:
            running_balance -= txn.amount
        balance_by_date[date_str] = running_balance
    
    # Add holdings value for broker accounts (current value only at end)
    if account.type.value == "broker":
        holdings = db.query(StockHolding).filter(
            StockHolding.account_id == account_id
        ).all()
        holdings_value = sum(h.shares * h.current_price for h in holdings)
        
        # Add holdings value to the latest date
        if balance_by_date:
            latest_date = max(balance_by_date.keys())
            balance_by_date[latest_date] += holdings_value
    
    # Convert to list of dicts
    history = [
        {"date": date, "balance": balance}
        for date, balance in sorted(balance_by_date.items())
    ]
    
    return history
