from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/rates", tags=["rates"])


@router.get("", response_model=list[schemas.RateOut])
def list_rates(db: Session = Depends(get_db)):
    return db.query(models.ExchangeRate).order_by(models.ExchangeRate.base_ccy.asc()).all()


@router.put("", response_model=schemas.RateOut)
def upsert_rate(payload: schemas.RateUpdate, db: Session = Depends(get_db)):
    rate = (
        db.query(models.ExchangeRate)
        .filter(
            models.ExchangeRate.base_ccy == payload.base_ccy,
            models.ExchangeRate.quote_ccy == payload.quote_ccy,
        )
        .first()
    )
    if rate is None:
        rate = models.ExchangeRate(
            base_ccy=payload.base_ccy,
            quote_ccy=payload.quote_ccy,
            rate=payload.rate,
            updated_at=datetime.utcnow(),
        )
        db.add(rate)
    else:
        rate.rate = payload.rate
        rate.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(rate)
    return rate
