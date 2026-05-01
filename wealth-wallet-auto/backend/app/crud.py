from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime

from app import models, schemas


# Account CRUD
def get_account(db: Session, account_id: int) -> Optional[models.Account]:
    return db.query(models.Account).filter(models.Account.id == account_id).first()


def get_accounts(db: Session, skip: int = 0, limit: int = 100) -> List[models.Account]:
    return db.query(models.Account).offset(skip).limit(limit).all()


def create_account(db: Session, account: schemas.AccountCreate) -> models.Account:
    db_account = models.Account(
        name=account.name,
        type=account.type,
        currency=account.currency or models.Currency.CNY
    )
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account


def update_account(db: Session, account_id: int, account_update: schemas.AccountUpdate) -> Optional[models.Account]:
    db_account = get_account(db, account_id)
    if not db_account:
        return None
    update_data = account_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_account, key, value)
    db.commit()
    db.refresh(db_account)
    return db_account


def delete_account(db: Session, account_id: int) -> bool:
    db_account = get_account(db, account_id)
    if not db_account:
        return False
    db.delete(db_account)
    db.commit()
    return True


# Transaction CRUD
def get_transaction(db: Session, transaction_id: int) -> Optional[models.Transaction]:
    return db.query(models.Transaction).filter(models.Transaction.id == transaction_id).first()


def get_transactions_by_account(db: Session, account_id: int) -> List[models.Transaction]:
    return db.query(models.Transaction).filter(models.Transaction.account_id == account_id).all()


def create_transaction(db: Session, account_id: int, transaction: schemas.TransactionCreate) -> models.Transaction:
    db_transaction = models.Transaction(
        account_id=account_id,
        type=transaction.type,
        amount=transaction.amount,
        description=transaction.description or "",
        date=transaction.date or datetime.utcnow()
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def delete_transaction(db: Session, transaction_id: int) -> bool:
    db_transaction = get_transaction(db, transaction_id)
    if not db_transaction:
        return False
    db.delete(db_transaction)
    db.commit()
    return True


# StockHolding CRUD
def get_stock_holding(db: Session, holding_id: int) -> Optional[models.StockHolding]:
    return db.query(models.StockHolding).filter(models.StockHolding.id == holding_id).first()


def get_stock_holdings_by_account(db: Session, account_id: int) -> List[models.StockHolding]:
    return db.query(models.StockHolding).filter(models.StockHolding.account_id == account_id).all()


def create_stock_holding(db: Session, account_id: int, holding: schemas.StockHoldingCreate) -> models.StockHolding:
    db_holding = models.StockHolding(
        account_id=account_id,
        symbol=holding.symbol,
        shares=holding.shares,
        avg_cost=holding.avg_cost,
        current_price=holding.current_price,
        currency=holding.currency or models.Currency.CNY
    )
    db.add(db_holding)
    db.commit()
    db.refresh(db_holding)
    return db_holding


def update_stock_holding(db: Session, holding_id: int, holding_update: schemas.StockHoldingCreate) -> Optional[models.StockHolding]:
    db_holding = get_stock_holding(db, holding_id)
    if not db_holding:
        return None
    db_holding.symbol = holding_update.symbol
    db_holding.shares = holding_update.shares
    db_holding.avg_cost = holding_update.avg_cost
    db_holding.current_price = holding_update.current_price
    db_holding.currency = holding_update.currency or db_holding.currency
    db.commit()
    db.refresh(db_holding)
    return db_holding


def delete_stock_holding(db: Session, holding_id: int) -> bool:
    db_holding = get_stock_holding(db, holding_id)
    if not db_holding:
        return False
    db.delete(db_holding)
    db.commit()
    return True


# Balance history for chart
def get_account_balance_history(db: Session, account_id: int) -> schemas.AccountBalanceHistory:
    account = get_account(db, account_id)
    if not account:
        return None

    transactions = db.query(models.Transaction).filter(
        models.Transaction.account_id == account_id
    ).order_by(models.Transaction.date).all()

    history = []
    running_balance = 0.0
    current_date = None

    for t in transactions:
        date_str = t.date.strftime("%Y-%m-%d")
        if t.type == models.TransactionType.deposit:
            running_balance += t.amount
        else:
            running_balance -= t.amount
        history.append(schemas.BalanceHistoryPoint(date=date_str, balance=round(running_balance, 2)))

    # If no transactions, return empty history with current date
    if not history:
        history.append(schemas.BalanceHistoryPoint(
            date=datetime.utcnow().strftime("%Y-%m-%d"),
            balance=0.0
        ))

    return schemas.AccountBalanceHistory(
        account_id=account_id,
        account_name=account.name,
        history=history
    )
