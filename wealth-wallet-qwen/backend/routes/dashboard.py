from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from utils.calculations import calculate_total_balance, get_account_history

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

@router.get("/summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    """Get total balance across all accounts"""
    summary = calculate_total_balance(db)
    return summary

@router.get("/account-history/{account_id}")
def get_account_history_route(account_id: int, db: Session = Depends(get_db)):
    """Get historical balance data for line chart"""
    history = get_account_history(db, account_id)
    return history

@router.get("/currency-breakdown")
def get_currency_breakdown(db: Session = Depends(get_db)):
    """Get balance grouped by currency"""
    summary = calculate_total_balance(db)
    return {"currency_breakdown": summary["currency_breakdown"]}
