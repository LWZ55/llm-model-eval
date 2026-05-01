from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..services import balance as balance_svc

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


def _to_with_balance(db: Session, acc: models.Account) -> schemas.AccountWithBalance:
    bal = balance_svc.compute_balance(db, acc)
    bal_base = balance_svc.convert(db, bal, acc.currency, balance_svc.BASE_CURRENCY)
    return schemas.AccountWithBalance(
        id=acc.id,
        name=acc.name,
        type=acc.type,
        currency=acc.currency,
        created_at=acc.created_at,
        balance=bal,
        balance_in_base=bal_base.quantize(Decimal("0.01")),
    )


@router.get("", response_model=list[schemas.AccountWithBalance])
def list_accounts(db: Session = Depends(get_db)):
    accs = db.query(models.Account).order_by(models.Account.id.asc()).all()
    return [_to_with_balance(db, a) for a in accs]


@router.post("", response_model=schemas.AccountOut, status_code=status.HTTP_201_CREATED)
def create_account(payload: schemas.AccountCreate, db: Session = Depends(get_db)):
    acc = models.Account(name=payload.name, type=payload.type, currency=payload.currency)
    db.add(acc)
    db.commit()
    db.refresh(acc)
    balance_svc.write_snapshot(db, acc)
    return acc


@router.get("/{account_id}", response_model=schemas.AccountWithBalance)
def get_account(account_id: int, db: Session = Depends(get_db)):
    acc = db.get(models.Account, account_id)
    if acc is None:
        raise HTTPException(404, "Account not found")
    return _to_with_balance(db, acc)


@router.patch("/{account_id}", response_model=schemas.AccountOut)
def update_account(account_id: int, payload: schemas.AccountUpdate, db: Session = Depends(get_db)):
    acc = db.get(models.Account, account_id)
    if acc is None:
        raise HTTPException(404, "Account not found")
    if payload.name is not None:
        acc.name = payload.name
    if payload.currency is not None:
        acc.currency = payload.currency
    db.commit()
    db.refresh(acc)
    return acc


@router.delete("/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(account_id: int, db: Session = Depends(get_db)):
    acc = db.get(models.Account, account_id)
    if acc is None:
        raise HTTPException(404, "Account not found")
    db.delete(acc)
    db.commit()
    return None


@router.get("/{account_id}/balance", response_model=schemas.BalanceOut)
def get_balance(account_id: int, db: Session = Depends(get_db)):
    acc = db.get(models.Account, account_id)
    if acc is None:
        raise HTTPException(404, "Account not found")
    bal = balance_svc.compute_balance(db, acc)
    bal_base = balance_svc.convert(db, bal, acc.currency, balance_svc.BASE_CURRENCY)
    return schemas.BalanceOut(
        account_id=acc.id,
        currency=acc.currency,
        balance=bal,
        balance_in_base=bal_base.quantize(Decimal("0.01")),
    )


@router.get("/{account_id}/history", response_model=list[schemas.HistoryPoint])
def get_history(account_id: int, days: int = 90, db: Session = Depends(get_db)):
    acc = db.get(models.Account, account_id)
    if acc is None:
        raise HTTPException(404, "Account not found")
    days = max(2, min(days, 730))
    return balance_svc.history(db, acc, days=days)
