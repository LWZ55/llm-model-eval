from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from app import models, schemas, crud
from app.database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wealth Wallet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Account endpoints
@app.get("/api/accounts", response_model=List[schemas.AccountListResponse])
def list_accounts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    accounts = crud.get_accounts(db, skip=skip, limit=limit)
    return accounts


@app.post("/api/accounts", response_model=schemas.AccountResponse)
def create_account(account: schemas.AccountCreate, db: Session = Depends(get_db)):
    return crud.create_account(db, account)


@app.get("/api/accounts/{account_id}", response_model=schemas.AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    db_account = crud.get_account(db, account_id)
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    return db_account


@app.put("/api/accounts/{account_id}", response_model=schemas.AccountResponse)
def update_account(account_id: int, account: schemas.AccountUpdate, db: Session = Depends(get_db)):
    db_account = crud.update_account(db, account_id, account)
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    return db_account


@app.delete("/api/accounts/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    success = crud.delete_account(db, account_id)
    if not success:
        raise HTTPException(status_code=404, detail="Account not found")
    return {"message": "Account deleted successfully"}


# Transaction endpoints
@app.get("/api/accounts/{account_id}/transactions", response_model=List[schemas.TransactionResponse])
def list_transactions(account_id: int, db: Session = Depends(get_db)):
    db_account = crud.get_account(db, account_id)
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    return crud.get_transactions_by_account(db, account_id)


@app.post("/api/accounts/{account_id}/transactions", response_model=schemas.TransactionResponse)
def create_transaction(account_id: int, transaction: schemas.TransactionCreate, db: Session = Depends(get_db)):
    db_account = crud.get_account(db, account_id)
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    return crud.create_transaction(db, account_id, transaction)


@app.delete("/api/transactions/{transaction_id}")
def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    success = crud.delete_transaction(db, transaction_id)
    if not success:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return {"message": "Transaction deleted successfully"}


# StockHolding endpoints
@app.get("/api/accounts/{account_id}/stocks", response_model=List[schemas.StockHoldingResponse])
def list_stock_holdings(account_id: int, db: Session = Depends(get_db)):
    db_account = crud.get_account(db, account_id)
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    return crud.get_stock_holdings_by_account(db, account_id)


@app.post("/api/accounts/{account_id}/stocks", response_model=schemas.StockHoldingResponse)
def create_stock_holding(account_id: int, holding: schemas.StockHoldingCreate, db: Session = Depends(get_db)):
    db_account = crud.get_account(db, account_id)
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    if db_account.type != models.AccountType.broker:
        raise HTTPException(status_code=400, detail="Stock holdings can only be added to broker accounts")
    return crud.create_stock_holding(db, account_id, holding)


@app.put("/api/stocks/{holding_id}", response_model=schemas.StockHoldingResponse)
def update_stock_holding(holding_id: int, holding: schemas.StockHoldingCreate, db: Session = Depends(get_db)):
    db_holding = crud.update_stock_holding(db, holding_id, holding)
    if not db_holding:
        raise HTTPException(status_code=404, detail="Stock holding not found")
    return db_holding


@app.delete("/api/stocks/{holding_id}")
def delete_stock_holding(holding_id: int, db: Session = Depends(get_db)):
    success = crud.delete_stock_holding(db, holding_id)
    if not success:
        raise HTTPException(status_code=404, detail="Stock holding not found")
    return {"message": "Stock holding deleted successfully"}


# Balance history endpoint
@app.get("/api/accounts/{account_id}/balance-history", response_model=schemas.AccountBalanceHistory)
def get_balance_history(account_id: int, db: Session = Depends(get_db)):
    history = crud.get_account_balance_history(db, account_id)
    if not history:
        raise HTTPException(status_code=404, detail="Account not found")
    return history


# Total balance endpoint
@app.get("/api/total-balance")
def get_total_balance(db: Session = Depends(get_db)):
    accounts = crud.get_accounts(db)
    total = sum(a.balance for a in accounts)
    total_stock = sum(a.stock_value for a in accounts)
    return {
        "total_balance": round(total, 2),
        "total_stock_value": round(total_stock, 2),
        "grand_total": round(total + total_stock, 2),
        "account_count": len(accounts)
    }
