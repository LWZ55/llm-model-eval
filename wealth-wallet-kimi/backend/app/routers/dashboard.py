from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/balance", response_model=schemas.TotalBalance)
def get_total_balance(db: Session = Depends(get_db)):
    accounts = db.query(models.Account).all()

    total_deposit = 0.0
    total_liability = 0.0
    total_stock_value = 0.0
    account_balances = []

    for account in accounts:
        acc_deposit = sum(t.amount for t in account.transactions if t.transaction_type == "deposit")
        acc_liability = sum(t.amount for t in account.transactions if t.transaction_type == "liability")
        acc_net = acc_deposit - acc_liability
        acc_stock = sum(h.quantity * h.current_price for h in account.holdings)
        acc_total = acc_net + acc_stock

        total_deposit += acc_deposit
        total_liability += acc_liability
        total_stock_value += acc_stock

        account_balances.append(schemas.AccountBalance(
            account_id=account.id,
            account_name=account.name,
            account_type=account.account_type,
            currency=account.currency,
            total_deposit=acc_deposit,
            total_liability=acc_liability,
            net_balance=acc_net,
            stock_value=acc_stock,
            total_assets=acc_total,
        ))

    return schemas.TotalBalance(
        total_deposit=total_deposit,
        total_liability=total_liability,
        net_balance=total_deposit - total_liability,
        total_stock_value=total_stock_value,
        total_assets=total_deposit - total_liability + total_stock_value,
        accounts=account_balances,
    )
