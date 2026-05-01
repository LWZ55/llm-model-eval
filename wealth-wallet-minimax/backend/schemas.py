from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime


# Account Schemas
class AccountBase(BaseModel):
    name: str
    type: str  # bank, securities, transit
    currency: str = "CNY"


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[str] = None


class AccountResponse(AccountBase):
    id: int
    balance: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Transaction Schemas
class TransactionBase(BaseModel):
    type: str  # deposit, debt
    amount: float
    description: str = ""
    date: date


class TransactionCreate(TransactionBase):
    pass


class TransactionResponse(TransactionBase):
    id: int
    account_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Stock Holding Schemas
class StockHoldingBase(BaseModel):
    symbol: str
    name: str = ""
    quantity: float
    cost_price: float
    current_price: float = 0


class StockHoldingCreate(StockHoldingBase):
    pass


class StockHoldingUpdate(BaseModel):
    current_price: float
    quantity: Optional[float] = None


class StockHoldingResponse(StockHoldingBase):
    id: int
    account_id: int
    updated_at: datetime

    class Config:
        from_attributes = True


# Dashboard Schemas
class CurrencyRates(BaseModel):
    CNY_to_USD: float = 0.138
    CNY_to_HKD: float = 1.087
    USD_to_CNY: float = 7.24
    HKD_to_CNY: float = 0.92


class AccountSummary(BaseModel):
    id: int
    name: str
    type: str
    currency: str
    balance: float
    balance_cny: float


class DashboardSummary(BaseModel):
    total_balance_cny: float
    accounts: List[AccountSummary]
    currency_rates: CurrencyRates


class BalanceHistoryItem(BaseModel):
    date: str
    balance: float


class BalanceHistoryResponse(BaseModel):
    account_id: int
    account_name: str
    currency: str
    history: List[BalanceHistoryItem]