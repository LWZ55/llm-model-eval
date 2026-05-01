from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from ..database import get_db
from ..models import Account, Deposit, Liability, StockHolding
from ..schemas import AccountBalanceOut, TotalBalanceOut, EXCHANGE_RATES

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=TotalBalanceOut)
async def get_dashboard_summary(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account))
    accounts = result.scalars().all()

    total_cny = 0.0
    total_usd = 0.0
    total_hkd = 0.0

    for account in accounts:
        # Deposits
        dep_result = await db.execute(
            select(Deposit).where(Deposit.account_id == account.id)
        )
        deposits = dep_result.scalars().all()
        total_deposits = sum(d.amount for d in deposits)

        # Liabilities
        lia_result = await db.execute(
            select(Liability).where(Liability.account_id == account.id)
        )
        liabilities = lia_result.scalars().all()
        total_liabilities = sum(l.amount for l in liabilities)

        # Stock holdings
        hold_result = await db.execute(
            select(StockHolding).where(StockHolding.account_id == account.id)
        )
        holdings = hold_result.scalars().all()
        stock_market_value = sum(h.quantity * h.current_price for h in holdings)

        balance = total_deposits - total_liabilities + stock_market_value

        if account.currency == "CNY":
            total_cny += balance
        elif account.currency == "USD":
            total_usd += balance
        elif account.currency == "HKD":
            total_hkd += balance

    # Convert everything to CNY equivalent
    total_cny_equivalent = (
        total_cny * EXCHANGE_RATES["CNY"]
        + total_usd * EXCHANGE_RATES["USD"]
        + total_hkd * EXCHANGE_RATES["HKD"]
    )

    return TotalBalanceOut(
        total_cny=total_cny,
        total_usd=total_usd,
        total_hkd=total_hkd,
        total_cny_equivalent=round(total_cny_equivalent, 2),
    )


@router.get("/accounts-balance", response_model=list[AccountBalanceOut])
async def get_all_accounts_balance(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account).order_by(Account.created_at.desc()))
    accounts = result.scalars().all()

    out = []
    for account in accounts:
        dep_result = await db.execute(
            select(Deposit).where(Deposit.account_id == account.id)
        )
        deposits = dep_result.scalars().all()
        total_deposits = sum(d.amount for d in deposits)

        lia_result = await db.execute(
            select(Liability).where(Liability.account_id == account.id)
        )
        liabilities = lia_result.scalars().all()
        total_liabilities = sum(l.amount for l in liabilities)

        hold_result = await db.execute(
            select(StockHolding).where(StockHolding.account_id == account.id)
        )
        holdings = hold_result.scalars().all()
        stock_market_value = sum(h.quantity * h.current_price for h in holdings)

        balance = total_deposits - total_liabilities + stock_market_value

        out.append(AccountBalanceOut(
            id=account.id,
            name=account.name,
            account_type=account.account_type,
            currency=account.currency,
            description=account.description,
            total_deposits=total_deposits,
            total_liabilities=total_liabilities,
            stock_market_value=stock_market_value,
            balance=balance,
        ))

    return out
