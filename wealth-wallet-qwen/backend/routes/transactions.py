from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Account, Transaction, TransactionType
from schemas import TransactionCreate, TransactionResponse

router = APIRouter(prefix="/api/accounts/{account_id}/transactions", tags=["transactions"])

@router.get("/", response_model=List[TransactionResponse])
def list_transactions(account_id: int, db: Session = Depends(get_db)):
    """List all transactions for an account"""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    transactions = db.query(Transaction).filter(
        Transaction.account_id == account_id
    ).order_by(Transaction.date.desc()).all()
    
    return transactions

@router.post("/", response_model=TransactionResponse)
def create_transaction(account_id: int, transaction: TransactionCreate, db: Session = Depends(get_db)):
    """Add a new transaction"""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db_transaction = Transaction(
        account_id=account_id,
        type=transaction.type,
        amount=transaction.amount,
        description=transaction.description,
        date=transaction.date or transaction.date
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction
