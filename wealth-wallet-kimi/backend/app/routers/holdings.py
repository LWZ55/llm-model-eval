from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime

from app.database import get_db
from app import models, schemas

router = APIRouter(prefix="/holdings", tags=["holdings"])


@router.post("/", response_model=schemas.StockHoldingResponse)
def create_holding(holding: schemas.StockHoldingCreate, db: Session = Depends(get_db)):
    account = db.query(models.Account).filter(models.Account.id == holding.account_id).first()
    if not account:
        raise HTTPException(status_code=404, detail="Account not found")
    if account.account_type != "broker":
        raise HTTPException(status_code=400, detail="Stock holdings can only be added to broker accounts")

    db_holding = models.StockHolding(**holding.model_dump())
    db.add(db_holding)
    db.commit()
    db.refresh(db_holding)
    return db_holding


@router.get("/", response_model=List[schemas.StockHoldingResponse])
def list_holdings(account_id: int = None, db: Session = Depends(get_db)):
    query = db.query(models.StockHolding)
    if account_id:
        query = query.filter(models.StockHolding.account_id == account_id)
    return query.all()


@router.get("/{holding_id}", response_model=schemas.StockHoldingResponse)
def get_holding(holding_id: int, db: Session = Depends(get_db)):
    holding = db.query(models.StockHolding).filter(models.StockHolding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")
    return holding


@router.put("/{holding_id}", response_model=schemas.StockHoldingResponse)
def update_holding(holding_id: int, holding_update: schemas.StockHoldingUpdate, db: Session = Depends(get_db)):
    holding = db.query(models.StockHolding).filter(models.StockHolding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")

    for key, value in holding_update.model_dump(exclude_unset=True).items():
        setattr(holding, key, value)

    holding.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(holding)
    return holding


@router.delete("/{holding_id}")
def delete_holding(holding_id: int, db: Session = Depends(get_db)):
    holding = db.query(models.StockHolding).filter(models.StockHolding.id == holding_id).first()
    if not holding:
        raise HTTPException(status_code=404, detail="Holding not found")

    db.delete(holding)
    db.commit()
    return {"message": "Holding deleted"}
