from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models import Account, StockHolding, AccountType
from schemas import StockHoldingCreate, StockHoldingUpdate, StockHoldingResponse

router = APIRouter(tags=["stocks"])

@router.get("/api/accounts/{account_id}/holdings", response_model=List[StockHoldingResponse])
def list_holdings(account_id: int, db: Session = Depends(get_db)):
    """List all stock holdings for a broker account"""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if account.type != AccountType.BROKER:
        raise HTTPException(status_code=400, detail="Only broker accounts can have stock holdings")
    
    holdings = db.query(StockHolding).filter(
        StockHolding.account_id == account_id
    ).all()
    
    return holdings

@router.post("/api/accounts/{account_id}/holdings", response_model=StockHoldingResponse)
def create_holding(account_id: int, holding: StockHoldingCreate, db: Session = Depends(get_db)):
    """Add a new stock holding"""
    account = db.query(Account).filter(Account.id == account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if account.type != AccountType.BROKER:
        raise HTTPException(status_code=400, detail="Only broker accounts can have stock holdings")
    
    db_holding = StockHolding(
        account_id=account_id,
        symbol=holding.symbol,
        shares=holding.shares,
        avg_cost=holding.avg_cost,
        current_price=holding.current_price,
        currency=holding.currency
    )
    db.add(db_holding)
    db.commit()
    db.refresh(db_holding)
    return db_holding

@router.put("/api/holdings/{holding_id}", response_model=StockHoldingResponse)
def update_holding(holding_id: int, holding_update: StockHoldingUpdate, db: Session = Depends(get_db)):
    """Update stock holding"""
    holding = db.query(StockHolding).filter(StockHolding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    if holding_update.shares is not None:
        holding.shares = holding_update.shares
    if holding_update.avg_cost is not None:
        holding.avg_cost = holding_update.avg_cost
    if holding_update.current_price is not None:
        holding.current_price = holding_update.current_price
    
    db.commit()
    db.refresh(holding)
    return holding

@router.delete("/api/holdings/{holding_id}")
def delete_holding(holding_id: int, db: Session = Depends(get_db)):
    """Delete stock holding"""
    holding = db.query(StockHolding).filter(StockHolding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    
    db.delete(holding)
    db.commit()
    return {"message": "Holding deleted successfully"}
