from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/accounts", tags=["accounts"])


@router.post("/", response_model=schemas.AccountResponse)
def create_account(account: schemas.AccountCreate, db: Session = Depends(get_db)):
    db_account = models.Account(**account.model_dump())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


@router.get("/", response_model=List[schemas.AccountResponse])
def list_accounts(db: Session = Depends(get_db)):
    return db.query(models.Account).all()


@router.get("/{account_id}", response_model=schemas.AccountDetail)
def get_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    total_deposit = sum(t.amount for t in account.transactions if t.transaction_type == "deposit")
    total_liability = sum(t.amount for t in account.transactions if t.transaction_type == "liability")
    net_balance = total_deposit - total_liability
    stock_value = sum(h.quantity * h.current_price for h in account.holdings)
    total_assets = net_balance + stock_value

    balance = schemas.AccountBalance(
        account_id=account.id,
        account_name=account.name,
        account_type=account.account_type,
        currency=account.currency,
        total_deposit=total_deposit,
        total_liability=total_liability,
        net_balance=net_balance,
        stock_value=stock_value,
        total_assets=total_assets,
    )

    return schemas.AccountDetail(
        id=account.id,
        name=account.name,
        account_type=account.account_type,
        currency=account.currency,
        created_at=account.created_at,
        transactions=account.transactions,
        holdings=account.holdings,
        balance=balance,
    )


@router.put("/{account_id}", response_model=schemas.AccountResponse)
def update_account(account_id: int, account_update: schemas.AccountUpdate, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    for key, value in account_update.model_dump(exclude_unset=True).items():
        setattr(account, key, value)

    db.commit()
    db.refresh(account)
    return account


@router.delete("/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")

    db.delete(account)
    db.commit()
    return {"message": "Account deleted"}
