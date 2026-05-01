from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from datetime import datetime

from ..database import get_db
from ..models import Account, Deposit, Liability, StockHolding, BalanceSnapshot
from ..schemas import (
    AccountCreate, AccountUpdate, AccountOut, AccountBalanceOut,
    DepositCreate, DepositUpdate, DepositOut,
    LiabilityCreate, LiabilityUpdate, LiabilityOut,
    StockHoldingCreate, StockHoldingUpdate, StockHoldingOut,
    BalanceSnapshotOut, EXCHANGE_RATES,
)

router = APIRouter(prefix="/accounts", tags=["accounts"])


# ---- Account CRUD ----
@router.get("", response_model=list[AccountOut])
async def list_accounts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Account).order_by(Account.created_at.desc()))
    return result.scalars().all()


@router.post("", response_model=AccountOut)
async def create_account(data: AccountCreate, db: AsyncSession = Depends(get_db)):
    if data.account_type not in ("bank", "brokerage", "transit"):
        raise HTTPException(400, "account_type must be bank, brokerage, or transit")
    if data.currency not in ("CNY", "USD", "HKD"):
        raise HTTPException(400, "currency must be CNY, USD, or HKD")
    account = Account(**data.model_dump())
    db.add(account)
    await db.commit()
    await db.refresh(account)
    return account


@router.get("/{account_id}", response_model=AccountOut)
async def get_account(account_id: int, db: AsyncSession = Depends(get_db)):
    account = await db.get(Account, account_id)
    if not account:
        raise HTTPException(404, "Account not found")
    return account


@router.put("/{account_id}", response_model=AccountOut)
async def update_account(account_id: int, data: AccountUpdate, db: AsyncSession = Depends(get_db)):
    account = await db.get(Account, account_id)
    if not account:
        raise HTTPException(404, "Account not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(account, k, v)
    account.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(account)
    return account


@router.delete("/{account_id}")
async def delete_account(account_id: int, db: AsyncSession = Depends(get_db)):
    account = await db.get(Account, account_id)
    if not account:
        raise HTTPException(404, "Account not found")
    await db.delete(account)
    await db.commit()
    return {"ok": True}


# ---- Account Balance ----
@router.get("/{account_id}/balance", response_model=AccountBalanceOut)
async def get_account_balance(account_id: int, db: AsyncSession = Depends(get_db)):
    account = await db.get(Account, account_id)
    if not account:
        raise HTTPException(404, "Account not found")

    # Calculate deposits
    result = await db.execute(
        select(Deposit).where(Deposit.account_id == account_id)
    )
    deposits = result.scalars().all()
    total_deposits = sum(d.amount for d in deposits)

    # Calculate liabilities
    result = await db.execute(
        select(Liability).where(Liability.account_id == account_id)
    )
    liabilities = result.scalars().all()
    total_liabilities = sum(l.amount for l in liabilities)

    # Calculate stock market value (brokerage accounts)
    result = await db.execute(
        select(StockHolding).where(StockHolding.account_id == account_id)
    )
    holdings = result.scalars().all()
    stock_market_value = sum(h.quantity * h.current_price for h in holdings)

    balance = total_deposits - total_liabilities + stock_market_value

    return AccountBalanceOut(
        id=account.id,
        name=account.name,
        account_type=account.account_type,
        currency=account.currency,
        description=account.description,
        total_deposits=total_deposits,
        total_liabilities=total_liabilities,
        stock_market_value=stock_market_value,
        balance=balance,
    )


# ---- Deposits ----
@router.get("/{account_id}/deposits", response_model=list[DepositOut])
async def list_deposits(account_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Deposit).where(Deposit.account_id == account_id).order_by(Deposit.date.desc())
    )
    return result.scalars().all()


@router.post("/{account_id}/deposits", response_model=DepositOut)
async def create_deposit(account_id: int, data: DepositCreate, db: AsyncSession = Depends(get_db)):
    account = await db.get(Account, account_id)
    if not account:
        raise HTTPException(404, "Account not found")
    deposit = Deposit(account_id=account_id, amount=data.amount, description=data.description, date=data.date or datetime.utcnow())
    db.add(deposit)
    await db.commit()
    await db.refresh(deposit)
    # Auto-create balance snapshot
    await _create_snapshot(account_id, db)
    return deposit


@router.put("/deposits/{deposit_id}", response_model=DepositOut)
async def update_deposit(deposit_id: int, data: DepositUpdate, db: AsyncSession = Depends(get_db)):
    deposit = await db.get(Deposit, deposit_id)
    if not deposit:
        raise HTTPException(404, "Deposit not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(deposit, k, v)
    await db.commit()
    await db.refresh(deposit)
    await _create_snapshot(deposit.account_id, db)
    return deposit


@router.delete("/deposits/{deposit_id}")
async def delete_deposit(deposit_id: int, db: AsyncSession = Depends(get_db)):
    deposit = await db.get(Deposit, deposit_id)
    if not deposit:
        raise HTTPException(404, "Deposit not found")
    account_id = deposit.account_id
    await db.delete(deposit)
    await db.commit()
    await _create_snapshot(account_id, db)
    return {"ok": True}


# ---- Liabilities ----
@router.get("/{account_id}/liabilities", response_model=list[LiabilityOut])
async def list_liabilities(account_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Liability).where(Liability.account_id == account_id).order_by(Liability.date.desc())
    )
    return result.scalars().all()


@router.post("/{account_id}/liabilities", response_model=LiabilityOut)
async def create_liability(account_id: int, data: LiabilityCreate, db: AsyncSession = Depends(get_db)):
    account = await db.get(Account, account_id)
    if not account:
        raise HTTPException(404, "Account not found")
    liability = Liability(account_id=account_id, amount=data.amount, description=data.description, date=data.date or datetime.utcnow())
    db.add(liability)
    await db.commit()
    await db.refresh(liability)
    await _create_snapshot(account_id, db)
    return liability


@router.put("/liabilities/{liability_id}", response_model=LiabilityOut)
async def update_liability(liability_id: int, data: LiabilityUpdate, db: AsyncSession = Depends(get_db)):
    liability = await db.get(Liability, liability_id)
    if not liability:
        raise HTTPException(404, "Liability not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(liability, k, v)
    await db.commit()
    await db.refresh(liability)
    await _create_snapshot(liability.account_id, db)
    return liability


@router.delete("/liabilities/{liability_id}")
async def delete_liability(liability_id: int, db: AsyncSession = Depends(get_db)):
    liability = await db.get(Liability, liability_id)
    if not liability:
        raise HTTPException(404, "Liability not found")
    account_id = liability.account_id
    await db.delete(liability)
    await db.commit()
    await _create_snapshot(account_id, db)
    return {"ok": True}


# ---- Stock Holdings ----
@router.get("/{account_id}/holdings", response_model=list[StockHoldingOut])
async def list_holdings(account_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(StockHolding).where(StockHolding.account_id == account_id).order_by(StockHolding.stock_code)
    )
    holdings = result.scalars().all()
    out = []
    for h in holdings:
        mv = h.quantity * h.current_price
        cv = h.quantity * h.cost_price
        out.append(StockHoldingOut(
            id=h.id, account_id=h.account_id,
            stock_code=h.stock_code, stock_name=h.stock_name,
            quantity=h.quantity, cost_price=h.cost_price,
            current_price=h.current_price, currency=h.currency,
            market_value=mv, cost_value=cv, profit_loss=mv - cv,
            created_at=h.created_at, updated_at=h.updated_at,
        ))
    return out


@router.post("/{account_id}/holdings", response_model=StockHoldingOut)
async def create_holding(account_id: int, data: StockHoldingCreate, db: AsyncSession = Depends(get_db)):
    account = await db.get(Account, account_id)
    if not account:
        raise HTTPException(404, "Account not found")
    if account.account_type != "brokerage":
        raise HTTPException(400, "Stock holdings can only be added to brokerage accounts")
    holding = StockHolding(
        account_id=account_id,
        stock_code=data.stock_code, stock_name=data.stock_name,
        quantity=data.quantity, cost_price=data.cost_price,
        current_price=data.current_price, currency=data.currency,
    )
    db.add(holding)
    await db.commit()
    await db.refresh(holding)
    await _create_snapshot(account_id, db)
    mv = holding.quantity * holding.current_price
    cv = holding.quantity * holding.cost_price
    return StockHoldingOut(
        id=holding.id, account_id=holding.account_id,
        stock_code=holding.stock_code, stock_name=holding.stock_name,
        quantity=holding.quantity, cost_price=holding.cost_price,
        current_price=holding.current_price, currency=holding.currency,
        market_value=mv, cost_value=cv, profit_loss=mv - cv,
        created_at=holding.created_at, updated_at=holding.updated_at,
    )


@router.put("/holdings/{holding_id}", response_model=StockHoldingOut)
async def update_holding(holding_id: int, data: StockHoldingUpdate, db: AsyncSession = Depends(get_db)):
    holding = await db.get(StockHolding, holding_id)
    if not holding:
        raise HTTPException(404, "Stock holding not found")
    for k, v in data.model_dump(exclude_unset=True).items():
        setattr(holding, k, v)
    holding.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(holding)
    await _create_snapshot(holding.account_id, db)
    mv = holding.quantity * holding.current_price
    cv = holding.quantity * holding.cost_price
    return StockHoldingOut(
        id=holding.id, account_id=holding.account_id,
        stock_code=holding.stock_code, stock_name=holding.stock_name,
        quantity=holding.quantity, cost_price=holding.cost_price,
        current_price=holding.current_price, currency=holding.currency,
        market_value=mv, cost_value=cv, profit_loss=mv - cv,
        created_at=holding.created_at, updated_at=holding.updated_at,
    )


@router.delete("/holdings/{holding_id}")
async def delete_holding(holding_id: int, db: AsyncSession = Depends(get_db)):
    holding = await db.get(StockHolding, holding_id)
    if not holding:
        raise HTTPException(404, "Stock holding not found")
    account_id = holding.account_id
    await db.delete(holding)
    await db.commit()
    await _create_snapshot(account_id, db)
    return {"ok": True}


# ---- Balance Snapshots ----
@router.get("/{account_id}/snapshots", response_model=list[BalanceSnapshotOut])
async def list_snapshots(account_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(BalanceSnapshot)
        .where(BalanceSnapshot.account_id == account_id)
        .order_by(BalanceSnapshot.snapshot_date)
    )
    return result.scalars().all()


# ---- Helper: create balance snapshot ----
async def _create_snapshot(account_id: int, db: AsyncSession):
    """Create a balance snapshot for an account at the current time."""
    # Calculate current balance
    result = await db.execute(select(Deposit).where(Deposit.account_id == account_id))
    deposits = result.scalars().all()
    total_deposits = sum(d.amount for d in deposits)

    result = await db.execute(select(Liability).where(Liability.account_id == account_id))
    liabilities = result.scalars().all()
    total_liabilities = sum(l.amount for l in liabilities)

    result = await db.execute(select(StockHolding).where(StockHolding.account_id == account_id))
    holdings = result.scalars().all()
    stock_market_value = sum(h.quantity * h.current_price for h in holdings)

    balance = total_deposits - total_liabilities + stock_market_value

    snapshot = BalanceSnapshot(
        account_id=account_id,
        balance=balance,
        snapshot_date=datetime.utcnow(),
    )
    db.add(snapshot)
    await db.commit()
