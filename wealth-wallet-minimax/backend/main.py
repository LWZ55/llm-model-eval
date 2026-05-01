from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime, timedelta

from database import engine, get_db, Base
from models import Account, Transaction, StockHolding
from schemas import (
    AccountCreate, AccountUpdate, AccountResponse,
    TransactionCreate, TransactionResponse,
    StockHoldingCreate, StockHoldingUpdate, StockHoldingResponse,
    DashboardSummary, AccountSummary, CurrencyRates, BalanceHistoryResponse, BalanceHistoryItem
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wealth Wallet API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Currency conversion rates (static for demo)
EXCHANGE_RATES = {
    "CNY": {"CNY": 1.0, "USD": 7.24, "HKD": 0.92},
    "USD": {"CNY": 0.138, "USD": 1.0, "HKD": 0.127},
    "HKD": {"CNY": 1.087, "USD": 7.88, "HKD": 1.0},
}


def convert_to_cny(amount: float, currency: str) -> float:
    """Convert amount to CNY"""
    return amount * EXCHANGE_RATES.get(currency, {}).get("CNY", 1.0)


# Health check
@app.get("/api/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}


# ============ Account Endpoints ============

@app.get("/api/accounts", response_model=List[AccountResponse])
def get_accounts(db: Session = Depends(get_db)):
    accounts = db.query(Account).order_by(Account.created_at.desc()).all()
    return accounts


@app.post("/api/accounts", response_model=AccountResponse)
def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    db_account = Account(
        name=account.name,
        type=account.type,
        currency=account.currency
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


@app.get("/api/accounts/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account


@app.put("/api/accounts/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, account_update: AccountUpdate, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if account_update.name is not None:
        account.name = account_update.name
    if account_update.currency is not None:
        account.currency = account_update.currency
    
    account.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(account)
    return account


@app.delete("/api/accounts/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db.delete(account)
    db.commit()
    return {"message": "Account deleted successfully"}


# ============ Transaction Endpoints ============

@app.get("/api/accounts/{account_id}/transactions", response_model=List[TransactionResponse])
def get_transactions(account_id: int, db: Session = Depends(get_db)):
    transactions = db.query(Transaction).filter(
        Transaction.account_id == account_id
    ).order_by(Transaction.date.desc()).all()
    return transactions


@app.post("/api/accounts/{account_id}/transactions", response_model=TransactionResponse)
def create_transaction(account_id: int, transaction: TransactionCreate, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db_transaction = Transaction(
        account_id=account_id,
        type=transaction.type,
        amount=transaction.amount,
        description=transaction.description,
        date=transaction.date
    )
    
    # Update account balance
    if transaction.type == "deposit":
        account.balance += transaction.amount
    else:  # debt
        account.balance -= transaction.amount
    
    account.updated_at = datetime.utcnow()
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    # Update account balance
    account = db.query(Account).filter(Account.id == transaction.account_id).first()
    if account:
        if transaction.type == "deposit":
            account.balance -= transaction.amount
        else:
            account.balance += transaction.amount
        account.updated_at = datetime.utcnow()
    
    db.delete(transaction)
    db.commit()
    return {"message": "Transaction deleted successfully"}


# ============ Stock Holding Endpoints ============

@app.get("/api/accounts/{account_id}/holdings", response_model=List[StockHoldingResponse])
def get_holdings(account_id: int, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    holdings = db.query(StockHolding).filter(
        StockHolding.account_id == account_id
    ).all()
    return holdings


@app.post("/api/accounts/{account_id}/holdings", response_model=StockHoldingResponse)
def create_or_update_holding(account_id: int, holding: StockHoldingCreate, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if account.type != "securities":
        raise HTTPException(status_code=400, detail="Only securities accounts can have stock holdings")
    
    # Check if holding with this symbol already exists
    existing = db.query(StockHolding).filter(
        StockHolding.account_id == account_id,
        StockHolding.symbol == holding.symbol
    ).first()
    
    if existing:
        # Update existing holding - recalculate average cost
        total_cost = existing.quantity * existing.cost_price + holding.quantity * holding.cost_price
        total_quantity = existing.quantity + holding.quantity
        existing.quantity = total_quantity
        existing.cost_price = total_cost / total_quantity if total_quantity > 0 else 0
        existing.current_price = holding.current_price
        existing.name = holding.name
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    else:
        db_holding = StockHolding(
            account_id=account_id,
            symbol=holding.symbol,
            name=holding.name,
            quantity=holding.quantity,
            cost_price=holding.cost_price,
            current_price=holding.current_price
        )
        db.add(db_holding)
        db.commit()
        db.refresh(db_holding)
        return db_holding


@app.put("/api/holdings/{holding_id}", response_model=StockHoldingResponse)
def update_holding(holding_id: int, holding_update: StockHoldingUpdate, db: Session = Depends(get_db)):
    holding = db.query(StockHolding).filter(StockHolding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    holding.current_price = holding_update.current_price
    if holding_update.quantity is not None:
        holding.quantity = holding_update.quantity
    holding.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(holding)
    return holding


@app.delete("/api/holdings/{holding_id}")
def delete_holding(holding_id: int, db: Session = Depends(get_db)):
    holding = db.query(StockHolding).filter(StockHolding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    db.delete(holding)
    db.commit()
    return {"message": "Holding deleted successfully"}


# ============ Dashboard Endpoints ============

@app.get("/api/dashboard/summary", response_model=DashboardSummary)
def get_dashboard_summary(db: Session = Depends(get_db)):
    accounts = db.query(Account).all()
    
    account_summaries = []
    total_cny = 0.0
    
    for account in accounts:
        balance_cny = convert_to_cny(account.balance, account.currency)
        total_cny += balance_cny
        account_summaries.append(AccountSummary(
            id=account.id,
            name=account.name,
            type=account.type,
            currency=account.currency,
            balance=account.balance,
            balance_cny=balance_cny
        ))
    
    return DashboardSummary(
        total_balance_cny=total_cny,
        accounts=account_summaries,
        currency_rates=CurrencyRates()
    )


@app.get("/api/accounts/{account_id}/balance-history", response_model=BalanceHistoryResponse)
def get_balance_history(account_id: int, db: Session = Depends(get_db)):
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    transactions = db.query(Transaction).filter(
        Transaction.account_id == account_id
    ).order_by(Transaction.date.asc()).all()
    
    # Calculate balance history
    history = []
    running_balance = 0.0
    
    # Add starting point (30 days ago or earliest transaction)
    if transactions:
        start_date = transactions[0].date - timedelta(days=7)
        for i in range(7):
            day = start_date + timedelta(days=i)
            history.append(BalanceHistoryItem(
                date=day.strftime("%Y-%m-%d"),
                balance=running_balance
            ))
        
        # Process each transaction
        for tx in transactions:
            if tx.type == "deposit":
                running_balance += tx.amount
            else:
                running_balance -= tx.amount
            history.append(BalanceHistoryItem(
                date=tx.date.strftime("%Y-%m-%d"),
                balance=running_balance
            ))
    else:
        # No transactions, show current balance for last 7 days
        today = datetime.now().date()
        for i in range(7, 0, -1):
            day = today - timedelta(days=i)
            history.append(BalanceHistoryItem(
                date=day.strftime("%Y-%m-%d"),
                balance=account.balance
            ))
    
    return BalanceHistoryResponse(
        account_id=account_id,
        account_name=account.name,
        currency=account.currency,
        history=history
    )


@app.get("/api/dashboard/balance-history")
def get_total_balance_history(db: Session = Depends(get_db)):
    """Get total balance history across all accounts"""
    accounts = db.query(Account).all()
    
    # Get all transactions across all accounts
    all_transactions = db.query(Transaction).order_by(Transaction.date.asc()).all()
    
    # Build daily totals
    daily_balances = {}
    
    # Initialize with current balances going backwards
    today = datetime.now().date()
    running_totals = {acc.id: acc.balance for acc in accounts}
    
    # Go backwards from today
    for i in range(30):
        day = today - timedelta(days=i)
        daily_balances[day.strftime("%Y-%m-%d")] = sum(running_totals.values())
    
    # Go through transactions forward and rebuild history
    balance_by_day = {}
    running = {acc.id: 0.0 for acc in accounts}
    
    if all_transactions:
        start_date = all_transactions[0].date - timedelta(days=7)
        for tx in all_transactions:
            if tx.type == "deposit":
                running[tx.account_id] += tx.amount
            else:
                running[tx.account_id] -= tx.amount
            day_key = tx.date.strftime("%Y-%m-%d")
            balance_by_day[day_key] = sum(running.values())
    
    # Merge with running totals going forward
    result = []
    for i in range(30, -1, -1):
        day = today - timedelta(days=i)
        day_key = day.strftime("%Y-%m-%d")
        if day_key in balance_by_day:
            result.append({"date": day_key, "balance": balance_by_day[day_key]})
        else:
            # Calculate from transactions up to this day
            tx_before_day = [tx for tx in all_transactions if tx.date <= day]
            temp_running = {acc.id: 0.0 for acc in accounts}
            for tx in tx_before_day:
                if tx.type == "deposit":
                    temp_running[tx.account_id] += tx.amount
                else:
                    temp_running[tx.account_id] -= tx.amount
            result.append({"date": day_key, "balance": sum(temp_running.values())})
    
    return {"history": result}


@app.get("/api/currencies/rates")
def get_currency_rates():
    """Get current exchange rates"""
    return {
        "CNY_to_USD": 0.138,
        "CNY_to_HKD": 1.087,
        "USD_to_CNY": 7.24,
        "HKD_to_CNY": 0.92,
        "updated_at": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)