from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional
from app.models import AccountType, Currency, TransactionType


# Transaction schemas
class TransactionBase(BaseModel):
    type: TransactionType
    amount: float
    description: Optional[str] = ""
    date: Optional[datetime] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: int
    account_id: int
    date: datetime

    class Config:
        from_attributes = True


# StockHolding schemas
class StockHoldingBase(BaseModel):
    symbol: str
    shares: float
    avg_cost: float
    current_price: float
    currency: Optional[Currency] = Currency.CNY


class StockHoldingCreate(StockHoldingBase):
    pass


class StockHoldingResponse(StockHoldingBase):
    id: int
    account_id: int
    current_value: float

    class Config:
        from_attributes = True


# Account schemas
class AccountBase(BaseModel):
    name: str
    type: AccountType
    currency: Optional[Currency] = Currency.CNY


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[Currency] = None


class AccountResponse(AccountBase):
    id: int
    created_at: datetime
    balance: float
    stock_value: float
    transactions: List[TransactionResponse] = []
    stock_holdings: List[StockHoldingResponse] = []

    class Config:
        from_attributes = True


class AccountListResponse(AccountBase):
    id: int
    created_at: datetime
    balance: float
    stock_value: float

    class Config:
        from_attributes = True


# Balance history for chart
class BalanceHistoryPoint(BaseModel):
    date: str
    balance: float


class AccountBalanceHistory(BaseModel):
    account_id: int
    account_name: str
    history: List[BalanceHistoryPoint]
