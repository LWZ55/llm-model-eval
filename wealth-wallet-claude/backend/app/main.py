from collections import defaultdict
from datetime import datetime
from decimal import Decimal

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import models, schemas
from .database import Base, SessionLocal, engine, get_db
from .routers import accounts, holdings, rates, transactions
from .services import balance as balance_svc

app = FastAPI(title="Wealth Wallet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _seed_default_rates() -> None:
    db = SessionLocal()
    try:
        defaults = [
            ("USD", "CNY", Decimal("7.10")),
            ("HKD", "CNY", Decimal("0.91")),
        ]
        for base_ccy, quote_ccy, rate in defaults:
            exists = (
                db.query(models.ExchangeRate)
                .filter(
                    models.ExchangeRate.base_ccy == base_ccy,
                    models.ExchangeRate.quote_ccy == quote_ccy,
                )
                .first()
            )
            if exists is None:
                db.add(
                    models.ExchangeRate(
                        base_ccy=base_ccy,
                        quote_ccy=quote_ccy,
                        rate=rate,
                        updated_at=datetime.utcnow(),
                    )
                )
        db.commit()
    finally:
        db.close()


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    _seed_default_rates()


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.get("/api/summary", response_model=schemas.Summary)
def summary(db: Session = Depends(get_db)):
    accs = db.query(models.Account).order_by(models.Account.id.asc()).all()
    accounts_with_bal: list[schemas.AccountWithBalance] = []
    by_ccy: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    by_ccy_base: dict[str, Decimal] = defaultdict(lambda: Decimal("0"))
    total = Decimal("0")
    for a in accs:
        bal = balance_svc.compute_balance(db, a)
        bal_base = balance_svc.convert(db, bal, a.currency, balance_svc.BASE_CURRENCY).quantize(
            Decimal("0.01")
        )
        accounts_with_bal.append(
            schemas.AccountWithBalance(
                id=a.id,
                name=a.name,
                type=a.type,
                currency=a.currency,
                created_at=a.created_at,
                balance=bal,
                balance_in_base=bal_base,
            )
        )
        by_ccy[a.currency] += bal
        by_ccy_base[a.currency] += bal_base
        total += bal_base

    breakdown = [
        schemas.CurrencyBreakdown(
            currency=ccy,
            balance=by_ccy[ccy].quantize(Decimal("0.01")),
            balance_in_base=by_ccy_base[ccy].quantize(Decimal("0.01")),
        )
        for ccy in sorted(by_ccy.keys())
    ]
    return schemas.Summary(
        base_currency=balance_svc.BASE_CURRENCY,
        total=total.quantize(Decimal("0.01")),
        by_currency=breakdown,
        accounts=accounts_with_bal,
    )


app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(holdings.router)
app.include_router(rates.router)
