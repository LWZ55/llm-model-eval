from pydantic import BaseModel
from datetime import date, datetime
from typing import Optional


# --- Account ---
class AccountCreate(BaseModel):
    name: str
    type: str  # bank, brokerage, transit
    currency: str = "CNY"


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    currency: Optional[str] = None


class AccountResponse(BaseModel):
    id: int
    name: str
    type: str
    currency: str
    balance: float = 0.0
    created_at: datetime

    class Config:
        from_attributes = True


# --- Transaction ---
class TransactionCreate(BaseModel):
    type: str  # deposit or liability
    amount: float
    description: str = ""
    date: date


class TransactionUpdate(BaseModel):
    type: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[date] = None


class TransactionResponse(BaseModel):
    id: int
    account_id: int
    type: str
    amount: float
    description: str
    date: date
    created_at: datetime

    class Config:
        from_attributes = True


# --- Stock Holding ---
class StockHoldingCreate(BaseModel):
    stock_code: str
    stock_name: str
    quantity: float
    cost_price: float
    current_price: float


class StockHoldingUpdate(BaseModel):
    stock_code: Optional[str] = None
    stock_name: Optional[str] = None
    quantity: Optional[float] = None
    cost_price: Optional[float] = None
    current_price: Optional[float] = None


class StockHoldingResponse(BaseModel):
    id: int
    account_id: int
    stock_code: str
    stock_name: str
    quantity: float
    cost_price: float
    current_price: float
    market_value: float = 0.0
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


# --- Balance ---
class BalanceResponse(BaseModel):
    account_id: int
    balance: float
    currency: str


class BalanceHistoryResponse(BaseModel):
    id: int
    account_id: int
    balance: float
    date: date


# --- Summary ---
class SummaryResponse(BaseModel):
    total_balance: float
    total_deposits: float
    total_liabilities: float
    accounts_count: int
