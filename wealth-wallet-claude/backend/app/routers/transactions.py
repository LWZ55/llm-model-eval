from datetime import date as date_cls

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..services import balance as balance_svc

router = APIRouter(prefix="/api", tags=["transactions"])


@router.get("/accounts/{account_id}/transactions", response_model=list[schemas.TransactionOut])
def list_transactions(account_id: int, db: Session = Depends(get_db)):
    acc = db.get(models.Account, account_id)
    if acc is None:
        raise HTTPException(404, "Account not found")
    return (
        db.query(models.Transaction)
        .filter(models.Transaction.account_id == account_id)
        .order_by(models.Transaction.date.desc(), models.Transaction.id.desc())
        .all()
    )


@router.post(
    "/accounts/{account_id}/transactions",
    response_model=schemas.TransactionOut,
    status_code=status.HTTP_201_CREATED,
)
def create_transaction(
    account_id: int, payload: schemas.TransactionCreate, db: Session = Depends(get_db)
):
    acc = db.get(models.Account, account_id)
    if acc is None:
        raise HTTPException(404, "Account not found")
    tx = models.Transaction(
        account_id=account_id,
        kind=payload.kind,
        amount=payload.amount,
        note=payload.note,
        date=payload.date or date_cls.today(),
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    balance_svc.write_snapshot(db, acc)
    return tx


@router.delete("/transactions/{tx_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_transaction(tx_id: int, db: Session = Depends(get_db)):
    tx = db.get(models.Transaction, tx_id)
    if tx is None:
        raise HTTPException(404, "Transaction not found")
    acc = tx.account
    db.delete(tx)
    db.commit()
    balance_svc.write_snapshot(db, acc)
    return None
