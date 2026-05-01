from datetime import date, timedelta
from decimal import Decimal
from typing import Iterable, Optional

from sqlalchemy.orm import Session

from .. import models

BASE_CURRENCY = "CNY"


def get_rate(db: Session, base_ccy: str, quote_ccy: str) -> Decimal:
    """Return rate to convert 1 unit of base_ccy into quote_ccy."""
    if base_ccy == quote_ccy:
        return Decimal("1")
    rate = (
        db.query(models.ExchangeRate)
        .filter(
            models.ExchangeRate.base_ccy == base_ccy,
            models.ExchangeRate.quote_ccy == quote_ccy,
        )
        .first()
    )
    if rate is not None:
        return Decimal(rate.rate)
    inverse = (
        db.query(models.ExchangeRate)
        .filter(
            models.ExchangeRate.base_ccy == quote_ccy,
            models.ExchangeRate.quote_ccy == base_ccy,
        )
        .first()
    )
    if inverse is not None and Decimal(inverse.rate) != 0:
        return Decimal("1") / Decimal(inverse.rate)
    return Decimal("1")  # fallback (treat as 1:1 if unconfigured)


def convert(db: Session, amount: Decimal, from_ccy: str, to_ccy: str = BASE_CURRENCY) -> Decimal:
    if from_ccy == to_ccy:
        return Decimal(amount)
    return Decimal(amount) * get_rate(db, from_ccy, to_ccy)


def _sum_transactions(transactions: Iterable[models.Transaction]) -> Decimal:
    total = Decimal("0")
    for tx in transactions:
        amt = Decimal(tx.amount)
        if tx.kind == "deposit":
            total += amt
        elif tx.kind == "withdraw":
            total -= amt
        elif tx.kind == "liability":
            total -= amt
        elif tx.kind == "repay":
            total += amt
    return total


def _sum_holdings(holdings: Iterable[models.Holding], account_ccy: str, db: Session) -> Decimal:
    total = Decimal("0")
    for h in holdings:
        market_value = Decimal(h.shares) * Decimal(h.current_price)
        if h.currency != account_ccy:
            market_value = convert(db, market_value, h.currency, account_ccy)
        total += market_value
    return total


def compute_balance(db: Session, account: models.Account) -> Decimal:
    """Balance in the account's own currency."""
    cash = _sum_transactions(account.transactions)
    if account.type == "brokerage":
        cash += _sum_holdings(account.holdings, account.currency, db)
    return cash.quantize(Decimal("0.01"))


def write_snapshot(db: Session, account: models.Account, on: Optional[date] = None) -> None:
    """Upsert today's snapshot for the account."""
    on = on or date.today()
    balance = compute_balance(db, account)
    snap = (
        db.query(models.BalanceSnapshot)
        .filter(
            models.BalanceSnapshot.account_id == account.id,
            models.BalanceSnapshot.date == on,
        )
        .first()
    )
    if snap is None:
        snap = models.BalanceSnapshot(account_id=account.id, date=on, balance=balance)
        db.add(snap)
    else:
        snap.balance = balance
    db.commit()


def history(db: Session, account: models.Account, days: int = 90) -> list[dict]:
    """Return [{date, balance}] for the last `days` days, forward-filling missing days."""
    today = date.today()
    start = today - timedelta(days=days - 1)
    snaps = (
        db.query(models.BalanceSnapshot)
        .filter(
            models.BalanceSnapshot.account_id == account.id,
            models.BalanceSnapshot.date >= start,
        )
        .order_by(models.BalanceSnapshot.date.asc())
        .all()
    )
    by_date = {s.date: Decimal(s.balance) for s in snaps}

    # find an earlier snapshot to seed the leading value
    earlier = (
        db.query(models.BalanceSnapshot)
        .filter(
            models.BalanceSnapshot.account_id == account.id,
            models.BalanceSnapshot.date < start,
        )
        .order_by(models.BalanceSnapshot.date.desc())
        .first()
    )
    last_value = Decimal(earlier.balance) if earlier is not None else Decimal("0")

    points = []
    cur = start
    while cur <= today:
        if cur in by_date:
            last_value = by_date[cur]
        points.append({"date": cur, "balance": last_value})
        cur += timedelta(days=1)

    # ensure today reflects current live balance
    points[-1]["balance"] = compute_balance(db, account)
    return points
