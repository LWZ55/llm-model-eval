from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, timedelta
from typing import List

from database import engine, get_db, Base
from models import Account, Transaction, StockHolding, BalanceHistory
from schemas import (
    AccountCreate, AccountUpdate, AccountResponse,
    TransactionCreate, TransactionUpdate, TransactionResponse,
    StockHoldingCreate, StockHoldingUpdate, StockHoldingResponse,
    BalanceResponse, BalanceHistoryResponse, SummaryResponse,
)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wealth Wallet API", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- Helper Functions ---

def calculate_balance(db: Session, account_id: int) -> float:
    """Calculate net balance = deposits - liabilities + stock_market_value"""
    deposit_result = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)) \
        .filter(Transaction.account_id == account_id, Transaction.type == "deposit").scalar()
    liability_result = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)) \
        .filter(Transaction.account_id == account_id, Transaction.type == "liability").scalar()
    return round(deposit_result - liability_result, 2)


def calculate_stock_value(db: Session, account_id: int) -> float:
    """Calculate total current market value of all stock holdings"""
    result = db.query(
        func.coalesce(func.sum(StockHolding.quantity * StockHolding.current_price), 0.0)
    ).filter(StockHolding.account_id == account_id).scalar()
    return round(result, 2)


def get_currency_symbol(currency: str) -> str:
    symbols = {"CNY": "¥", "USD": "$", "HKD": "HK$"}
    return symbols.get(currency, "¥")


# --- Summary ---

@app.get("/api/summary", response_model=SummaryResponse)
def get_summary(db: Session = Depends(get_db)):
    accounts = db.query(Account).all()
    total_balance = 0.0
    total_deposits = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)) \
        .filter(Transaction.type == "deposit").scalar()
    total_liabilities = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)) \
        .filter(Transaction.type == "liability").scalar()
    # Calculate total balance across all accounts
    for acc in accounts:
        total_balance += calculate_balance(db, acc.id)
    return SummaryResponse(
        total_balance=round(total_balance, 2),
        total_deposits=round(total_deposits, 2),
        total_liabilities=round(total_liabilities, 2),
        accounts_count=len(accounts),
    )


# --- Account CRUD ---

@app.get("/api/accounts", response_model=List[AccountResponse])
def list_accounts(db: Session = Depends(get_db)):
    accounts = db.query(Account).all()
    result = []
    for acc in accounts:
        balance = calculate_balance(db, acc.id)
        result.append(AccountResponse(
            id=acc.id,
            name=acc.name,
            type=acc.type,
            currency=acc.currency,
            balance=balance,
            created_at=acc.created_at,
        ))
    return result


@app.get("/api/accounts/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    balance = calculate_balance(db, acc.id)
    return AccountResponse(
        id=acc.id,
        name=acc.name,
        type=acc.type,
        currency=acc.currency,
        balance=balance,
        created_at=acc.created_at,
    )


@app.post("/api/accounts", response_model=AccountResponse)
def create_account(data: AccountCreate, db: Session = Depends(get_db)):
    acc = Account(name=data.name, type=data.type, currency=data.currency)
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return AccountResponse(
        id=acc.id, name=acc.name, type=acc.type,
        currency=acc.currency, balance=0.0, created_at=acc.created_at,
    )


@app.put("/api/accounts/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, data: AccountUpdate, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    if data.name is not None:
        acc.name = data.name
    if data.type is not None:
        acc.type = data.type
    if data.currency is not None:
        acc.currency = data.currency
    db.commit()
    db.refresh(acc)
    balance = calculate_balance(db, acc.id)
    return AccountResponse(
        id=acc.id, name=acc.name, type=acc.type,
        currency=acc.currency, balance=balance, created_at=acc.created_at,
    )


@app.delete("/api/accounts/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    db.delete(acc)
    db.commit()
    return {"message": "Account deleted successfully"}


# --- Transaction CRUD ---

@app.get("/api/accounts/{account_id}/transactions", response_model=List[TransactionResponse])
def list_transactions(account_id: int, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    transactions = db.query(Transaction) \
        .filter(Transaction.account_id == account_id) \
        .order_by(Transaction.date.desc(), Transaction.created_at.desc()).all()
    return transactions


@app.post("/api/accounts/{account_id}/transactions", response_model=TransactionResponse)
def create_transaction(account_id: int, data: TransactionCreate, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    txn = Transaction(
        account_id=account_id, type=data.type, amount=data.amount,
        description=data.description, date=data.date,
    )
    db.add(txn)
    db.commit()
    db.refresh(txn)
    return txn


@app.put("/api/transactions/{txn_id}", response_model=TransactionResponse)
def update_transaction(txn_id: int, data: TransactionUpdate, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    if data.type is not None:
        txn.type = data.type
    if data.amount is not None:
        txn.amount = data.amount
    if data.description is not None:
        txn.description = data.description
    if data.date is not None:
        txn.date = data.date
    db.commit()
    db.refresh(txn)
    return txn


@app.delete("/api/transactions/{txn_id}")
def delete_transaction(txn_id: int, db: Session = Depends(get_db)):
    txn = db.query(Transaction).filter(Transaction.id == txn_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found")
    db.delete(txn)
    db.commit()
    return {"message": "Transaction deleted successfully"}


# --- Stock Holding CRUD ---

@app.get("/api/accounts/{account_id}/stock-holdings", response_model=List[StockHoldingResponse])
def list_stock_holdings(account_id: int, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    holdings = db.query(StockHolding).filter(StockHolding.account_id == account_id).all()
    result = []
    for h in holdings:
        result.append(StockHoldingResponse(
            id=h.id, account_id=h.account_id, stock_code=h.stock_code,
            stock_name=h.stock_name, quantity=h.quantity, cost_price=h.cost_price,
            current_price=h.current_price,
            market_value=round(h.quantity * h.current_price, 2),
            created_at=h.created_at, updated_at=h.updated_at,
        ))
    return result


@app.post("/api/accounts/{account_id}/stock-holdings", response_model=StockHoldingResponse)
def create_stock_holding(account_id: int, data: StockHoldingCreate, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    if acc.type != "brokerage":
        raise HTTPException(status_code=400, detail="Stock holdings only allowed for brokerage accounts")
    holding = StockHolding(
        account_id=account_id, stock_code=data.stock_code, stock_name=data.stock_name,
        quantity=data.quantity, cost_price=data.cost_price, current_price=data.current_price,
    )
    db.add(holding)
    db.commit()
    db.refresh(holding)
    return StockHoldingResponse(
        id=holding.id, account_id=holding.account_id, stock_code=holding.stock_code,
        stock_name=holding.stock_name, quantity=holding.quantity, cost_price=holding.cost_price,
        current_price=holding.current_price,
        market_value=round(holding.quantity * holding.current_price, 2),
        created_at=holding.created_at, updated_at=holding.updated_at,
    )


@app.put("/api/stock-holdings/{holding_id}", response_model=StockHoldingResponse)
def update_stock_holding(holding_id: int, data: StockHoldingUpdate, db: Session = Depends(get_db)):
    holding = db.query(StockHolding).filter(StockHolding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Stock holding not found")
    if data.stock_code is not None:
        holding.stock_code = data.stock_code
    if data.stock_name is not None:
        holding.stock_name = data.stock_name
    if data.quantity is not None:
        holding.quantity = data.quantity
    if data.cost_price is not None:
        holding.cost_price = data.cost_price
    if data.current_price is not None:
        holding.current_price = data.current_price
    db.commit()
    db.refresh(holding)
    return StockHoldingResponse(
        id=holding.id, account_id=holding.account_id, stock_code=holding.stock_code,
        stock_name=holding.stock_name, quantity=holding.quantity, cost_price=holding.cost_price,
        current_price=holding.current_price,
        market_value=round(holding.quantity * holding.current_price, 2),
        created_at=holding.created_at, updated_at=holding.updated_at,
    )


@app.delete("/api/stock-holdings/{holding_id}")
def delete_stock_holding(holding_id: int, db: Session = Depends(get_db)):
    holding = db.query(StockHolding).filter(StockHolding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Stock holding not found")
    db.delete(holding)
    db.commit()
    return {"message": "Stock holding deleted successfully"}


# --- Balance & History ---

@app.get("/api/accounts/{account_id}/balance", response_model=BalanceResponse)
def get_account_balance(account_id: int, db: Session = Depends(get_db)):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")
    balance = calculate_balance(db, acc.id)
    return BalanceResponse(account_id=acc.id, balance=balance, currency=acc.currency)


@app.get("/api/accounts/{account_id}/balance-history", response_model=List[BalanceHistoryResponse])
def get_balance_history(
    account_id: int,
    days: int = Query(default=30, description="Number of days of history to return"),
    db: Session = Depends(get_db),
):
    acc = db.query(Account).filter(Account.id == account_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    end_date = date.today()
    start_date = end_date - timedelta(days=days)

    history = []
    current = start_date
    while current <= end_date:
        # Calculate balance up to current date
        deposit_sum = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)) \
            .filter(
                Transaction.account_id == account_id,
                Transaction.type == "deposit",
                Transaction.date <= current,
            ).scalar()
        liability_sum = db.query(func.coalesce(func.sum(Transaction.amount), 0.0)) \
            .filter(
                Transaction.account_id == account_id,
                Transaction.type == "liability",
                Transaction.date <= current,
            ).scalar()
        net = round(deposit_sum - liability_sum, 2)
        history.append(BalanceHistoryResponse(
            id=0, account_id=account_id, balance=net, date=current,
        ))
        current += timedelta(days=1)

    return history


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
