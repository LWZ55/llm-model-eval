from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..services import balance as balance_svc

router = APIRouter(prefix="/api", tags=["holdings"])


def _to_out(h: models.Holding) -> schemas.HoldingOut:
    mv = (Decimal(h.shares) * Decimal(h.current_price)).quantize(Decimal("0.01"))
    return schemas.HoldingOut(
        id=h.id,
        account_id=h.account_id,
        symbol=h.symbol,
        shares=h.shares,
        cost_basis=h.cost_basis,
        current_price=h.current_price,
        currency=h.currency,
        market_value=mv,
    )


@router.get("/accounts/{account_id}/holdings", response_model=list[schemas.HoldingOut])
def list_holdings(account_id: int, db: Session = Depends(get_db)):
    acc = db.get(models.Account, account_id)
    if acc is None:
        raise HTTPException(404, "Account not found")
    holdings = (
        db.query(models.Holding)
        .filter(models.Holding.account_id == account_id)
        .order_by(models.Holding.symbol.asc())
        .all()
    )
    return [_to_out(h) for h in holdings]


@router.post(
    "/accounts/{account_id}/holdings",
    response_model=schemas.HoldingOut,
    status_code=status.HTTP_201_CREATED,
)
def create_holding(account_id: int, payload: schemas.HoldingCreate, db: Session = Depends(get_db)):
    acc = db.get(models.Account, account_id)
    if acc is None:
        raise HTTPException(404, "Account not found")
    if acc.type != "brokerage":
        raise HTTPException(400, "Holdings can only be added to brokerage accounts")
    h = models.Holding(
        account_id=account_id,
        symbol=payload.symbol.upper(),
        shares=payload.shares,
        cost_basis=payload.cost_basis,
        current_price=payload.current_price,
        currency=payload.currency,
    )
    db.add(h)
    db.commit()
    db.refresh(h)
    balance_svc.write_snapshot(db, acc)
    return _to_out(h)


@router.patch("/holdings/{holding_id}", response_model=schemas.HoldingOut)
def update_holding(holding_id: int, payload: schemas.HoldingUpdate, db: Session = Depends(get_db)):
    h = db.get(models.Holding, holding_id)
    if h is None:
        raise HTTPException(404, "Holding not found")
    data = payload.model_dump(exclude_unset=True)
    if "symbol" in data and data["symbol"] is not None:
        data["symbol"] = data["symbol"].upper()
    for k, v in data.items():
        setattr(h, k, v)
    db.commit()
    db.refresh(h)
    balance_svc.write_snapshot(db, h.account)
    return _to_out(h)


@router.delete("/holdings/{holding_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_holding(holding_id: int, db: Session = Depends(get_db)):
    h = db.get(models.Holding, holding_id)
    if h is None:
        raise HTTPException(404, "Holding not found")
    acc = h.account
    db.delete(h)
    db.commit()
    balance_svc.write_snapshot(db, acc)
    return None
