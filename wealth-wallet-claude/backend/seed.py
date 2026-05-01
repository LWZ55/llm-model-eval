"""Seed mock data into the wealth wallet DB.

Usage:
    cd backend && source .venv/bin/activate
    python seed.py            # add mock data (idempotent: skips if accounts already seeded)
    python seed.py --reset    # wipe ALL data first, then seed
"""
from __future__ import annotations

import argparse
import random
from datetime import date, datetime, timedelta
from decimal import Decimal

from app.database import Base, SessionLocal, engine
from app import models

random.seed(42)

ACCOUNTS = [
    # (name, type, currency, opening_deposit, monthly_in, monthly_out)
    ("ICBC Savings",        "bank",         "CNY", Decimal("85000"),  Decimal("12000"), Decimal("4500")),
    ("CMB Credit Card",     "bank",         "CNY", Decimal("0"),      Decimal("0"),     Decimal("0")),  # liability-only
    ("HSBC US",             "bank",         "USD", Decimal("12000"),  Decimal("1500"),  Decimal("900")),
    ("BOCHK Wallet",        "bank",         "HKD", Decimal("18000"),  Decimal("0"),     Decimal("600")),
    ("Futu Brokerage",      "brokerage",    "USD", Decimal("8000"),   Decimal("0"),     Decimal("0")),
    ("Tiger HK Brokerage",  "brokerage",    "HKD", Decimal("25000"),  Decimal("0"),     Decimal("0")),
    ("Shanghai Metro Card", "transit_card", "CNY", Decimal("200"),    Decimal("0"),     Decimal("80")),
]

CC_LIABILITIES = [
    # account name -> list of (days_ago, amount, note)
    ("CMB Credit Card", [
        (45, Decimal("3200"), "Hotel booking"),
        (30, Decimal("780"),  "Groceries"),
        (12, Decimal("1500"), "Electronics"),
        (4,  Decimal("260"),  "Dining"),
    ]),
]
CC_REPAYS = [
    ("CMB Credit Card", [
        (40, Decimal("3200"), "Auto-pay"),
        (10, Decimal("780"),  "Auto-pay"),
    ]),
]

HOLDINGS = {
    "Futu Brokerage": [
        # symbol, shares, cost_basis, current_price, currency
        ("AAPL",  20, Decimal("160.00"), Decimal("212.50"), "USD"),
        ("MSFT",  10, Decimal("310.00"), Decimal("420.30"), "USD"),
        ("NVDA",   5, Decimal("420.00"), Decimal("950.10"), "USD"),
    ],
    "Tiger HK Brokerage": [
        ("0700.HK",  100, Decimal("330.00"), Decimal("405.20"), "HKD"),  # Tencent
        ("9988.HK",  200, Decimal("90.00"),  Decimal("105.40"), "HKD"),  # Alibaba HK
    ],
}

RATES = [
    ("USD", "CNY", Decimal("7.18")),
    ("HKD", "CNY", Decimal("0.92")),
]


def reset(db) -> None:
    db.query(models.BalanceSnapshot).delete()
    db.query(models.Transaction).delete()
    db.query(models.Holding).delete()
    db.query(models.Account).delete()
    db.query(models.ExchangeRate).delete()
    db.commit()


def seed_rates(db) -> None:
    for base_ccy, quote_ccy, rate in RATES:
        existing = (
            db.query(models.ExchangeRate)
            .filter(models.ExchangeRate.base_ccy == base_ccy,
                    models.ExchangeRate.quote_ccy == quote_ccy)
            .first()
        )
        if existing:
            existing.rate = rate
            existing.updated_at = datetime.utcnow()
        else:
            db.add(models.ExchangeRate(
                base_ccy=base_ccy, quote_ccy=quote_ccy,
                rate=rate, updated_at=datetime.utcnow(),
            ))
    db.commit()


def seed_accounts(db) -> dict[str, models.Account]:
    by_name: dict[str, models.Account] = {}
    today = date.today()
    open_date = today - timedelta(days=180)

    for name, typ, ccy, opening, monthly_in, monthly_out in ACCOUNTS:
        acc = models.Account(
            name=name, type=typ, currency=ccy,
            created_at=datetime.combine(open_date, datetime.min.time()),
        )
        db.add(acc)
        db.flush()
        by_name[name] = acc

        # opening deposit
        if opening > 0:
            db.add(models.Transaction(
                account_id=acc.id, kind="deposit",
                amount=opening, note="Opening balance", date=open_date,
            ))

        # 6 months of monthly inflows / outflows on random days
        for i in range(6):
            month_start = open_date + timedelta(days=i * 30)
            if monthly_in > 0:
                d = month_start + timedelta(days=random.randint(0, 5))
                if d <= today:
                    inflow = monthly_in + Decimal(random.randint(-300, 800))
                    db.add(models.Transaction(
                        account_id=acc.id, kind="deposit",
                        amount=inflow, note="Salary / inflow", date=d,
                    ))
            if monthly_out > 0:
                # 3 random spends per month
                for _ in range(3):
                    d = month_start + timedelta(days=random.randint(6, 28))
                    if d <= today:
                        out = (monthly_out / 3) + Decimal(random.randint(-200, 400))
                        if out > 0:
                            db.add(models.Transaction(
                                account_id=acc.id, kind="withdraw",
                                amount=out.quantize(Decimal("0.01")),
                                note=random.choice(["Groceries", "Dining", "Transit", "Shopping", "Utilities"]),
                                date=d,
                            ))
    db.commit()
    return by_name


def seed_credit_card(db, by_name) -> None:
    today = date.today()
    for acc_name, items in CC_LIABILITIES:
        acc = by_name[acc_name]
        for days_ago, amt, note in items:
            db.add(models.Transaction(
                account_id=acc.id, kind="liability",
                amount=amt, note=note, date=today - timedelta(days=days_ago),
            ))
    for acc_name, items in CC_REPAYS:
        acc = by_name[acc_name]
        for days_ago, amt, note in items:
            db.add(models.Transaction(
                account_id=acc.id, kind="repay",
                amount=amt, note=note, date=today - timedelta(days=days_ago),
            ))
    db.commit()


def seed_holdings(db, by_name) -> None:
    for acc_name, items in HOLDINGS.items():
        acc = by_name[acc_name]
        for symbol, shares, cost, price, ccy in items:
            db.add(models.Holding(
                account_id=acc.id, symbol=symbol,
                shares=Decimal(shares), cost_basis=cost,
                current_price=price, currency=ccy,
            ))
    db.commit()


def _balance_on(db, account: models.Account, on: date) -> Decimal:
    """Compute balance as of `on` (inclusive). Holdings use current price (approximation)."""
    cash = Decimal("0")
    for tx in account.transactions:
        if tx.date > on:
            continue
        amt = Decimal(tx.amount)
        if tx.kind == "deposit":
            cash += amt
        elif tx.kind == "withdraw":
            cash -= amt
        elif tx.kind == "liability":
            cash -= amt
        elif tx.kind == "repay":
            cash += amt
    if account.type == "brokerage":
        # holdings: assume held the whole window at current price (simplification)
        for h in account.holdings:
            cash += Decimal(h.shares) * Decimal(h.current_price)
    return cash.quantize(Decimal("0.01"))


def write_history_snapshots(db, by_name) -> None:
    today = date.today()
    start = today - timedelta(days=180)
    for acc in by_name.values():
        cur = start
        while cur <= today:
            bal = _balance_on(db, acc, cur)
            existing = (
                db.query(models.BalanceSnapshot)
                .filter(models.BalanceSnapshot.account_id == acc.id,
                        models.BalanceSnapshot.date == cur)
                .first()
            )
            if existing:
                existing.balance = bal
            else:
                db.add(models.BalanceSnapshot(
                    account_id=acc.id, date=cur, balance=bal,
                ))
            cur += timedelta(days=1)
    db.commit()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--reset", action="store_true", help="wipe all data first")
    args = parser.parse_args()

    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if args.reset:
            print("Resetting all data...")
            reset(db)

        existing_count = db.query(models.Account).count()
        if existing_count > 0 and not args.reset:
            print(f"DB already has {existing_count} accounts. Use --reset to re-seed.")
            return

        print("Seeding rates...")
        seed_rates(db)
        print("Seeding accounts + transactions...")
        by_name = seed_accounts(db)
        print("Seeding credit-card liabilities/repayments...")
        seed_credit_card(db, by_name)
        print("Seeding brokerage holdings...")
        seed_holdings(db, by_name)
        print("Writing 180 days of balance snapshots...")
        write_history_snapshots(db, by_name)

        accs = db.query(models.Account).count()
        txs = db.query(models.Transaction).count()
        hds = db.query(models.Holding).count()
        snaps = db.query(models.BalanceSnapshot).count()
        print(f"Done. Accounts={accs}, Transactions={txs}, Holdings={hds}, Snapshots={snaps}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
