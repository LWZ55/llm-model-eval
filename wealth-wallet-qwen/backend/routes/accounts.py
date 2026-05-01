from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Account
from schemas import AccountCreate, AccountUpdate, AccountResponse
from utils.calculations import calculate_account_balance

router = APIRouter(prefix="/api/accounts", tags=["accounts"])

@router.get("/", response_model=List[AccountResponse])
def list_accounts(db: Session = Depends(get_db)):
    """List all accounts"""
    accounts = db.query(Account).all()
    return accounts

@router.post("/", response_model=AccountResponse)
def create_account(account: AccountCreate, db: Session = Depends(get_db)):
    """Create a new account"""
    db_account = Account(
        name=account.name,
        type=account.type,
        currency=account.currency
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.get("/{account_id}", response_model=AccountResponse)
def get_account(account_id: int, db: Session = Depends(get_db)):
    """Get account by ID"""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    return account

@router.put("/{account_id}", response_model=AccountResponse)
def update_account(account_id: int, account_update: AccountUpdate, db: Session = Depends(get_db)):
    """Update account"""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if account_update.name is not None:
        account.name = account_update.name
    if account_update.currency is not None:
        account.currency = account_update.currency
    
    db.commit()
    db.refresh(account)
    return account

@router.delete("/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    """Delete account"""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    db.delete(account)
    db.commit()
    return {"message": "Account deleted successfully"}

@router.get("/{account_id}/balance")
def get_account_balance(account_id: int, db: Session = Depends(get_db)):
    """Get account balance"""
    balance = calculate_account_balance(db, account_id)
    if not balance:
        raise HTTPException(status_code=404, detail="Account not found")
    return balance
