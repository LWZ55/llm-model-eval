from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from enum import Enum

class AccountType(str, Enum):
    BANK = "bank"
    BROKER = "broker"
    WALLET = "wallet"

class Currency(str, Enum):
    CNY = "CNY"
    USD = "USD"
    HKD = "HKD"

class TransactionType(str, Enum):
    DEPOSIT = "deposit"
    LIABILITY = "liability"

# Account Schemas
class AccountCreate(BaseModel):
    name: str
    type: AccountType
    currency: Currency = Currency.CNY

class AccountUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[Currency] = None

class AccountResponse(BaseModel):
    id: int
    name: str
    type: AccountType
    currency: Currency
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Transaction Schemas
class TransactionCreate(BaseModel):
    type: TransactionType
    amount: float
    description: Optional[str] = None
    date: Optional[datetime] = None

class TransactionResponse(BaseModel):
    id: int
    account_id: int
    type: TransactionType
    amount: float
    description: Optional[str]
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True

# Stock Holding Schemas
class StockHoldingCreate(BaseModel):
    symbol: str
    shares: float
    avg_cost: float
    current_price: float
    currency: Currency = Currency.CNY

class StockHoldingUpdate(BaseModel):
    shares: Optional[float] = None
    avg_cost: Optional[float] = None
    current_price: Optional[float] = None

class StockHoldingResponse(BaseModel):
    id: int
    account_id: int
    symbol: str
    shares: float
    avg_cost: float
    current_price: float
    currency: Currency
    updated_at: datetime

    class Config:
        from_attributes = True

# Balance Schemas
class BalanceResponse(BaseModel):
    account_id: int
    account_name: str
    currency: Currency
    deposit_total: float
    liability_total: float
    holdings_value: float
    balance: float

class DashboardSummary(BaseModel):
    total_balance: float
    currency_breakdown: dict
    accounts: List[BalanceResponse]

class HistoryPoint(BaseModel):
    date: str
    balance: float
