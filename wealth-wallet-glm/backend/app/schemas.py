from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


# Account Schemas
class AccountBase(BaseModel):
    name: str
    account_type: str  # bank, brokerage, transit
    currency: str = "CNY"
    description: str = ""


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    account_type: Optional[str] = None
    currency: Optional[str] = None
    description: Optional[str] = None


class AccountOut(AccountBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AccountBalanceOut(AccountBase):
    id: int
    total_deposits: float
    total_liabilities: float
    stock_market_value: float
    balance: float  # deposits - liabilities + stock market value
    currency: str

    class Config:
        from_attributes = True


# Deposit Schemas
class DepositBase(BaseModel):
    amount: float
    description: str = ""
    date: Optional[datetime] = None


class DepositCreate(DepositBase):
    account_id: Optional[int] = None


class DepositUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[datetime] = None


class DepositOut(DepositBase):
    id: int
    account_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Liability Schemas
class LiabilityBase(BaseModel):
    amount: float
    description: str = ""
    date: Optional[datetime] = None


class LiabilityCreate(LiabilityBase):
    account_id: Optional[int] = None


class LiabilityUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[datetime] = None


class LiabilityOut(LiabilityBase):
    id: int
    account_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# StockHolding Schemas
class StockHoldingBase(BaseModel):
    stock_code: str
    stock_name: str
    quantity: float
    cost_price: float
    current_price: float = 0
    currency: str = "CNY"


class StockHoldingCreate(StockHoldingBase):
    account_id: Optional[int] = None


class StockHoldingUpdate(BaseModel):
    stock_code: Optional[str] = None
    stock_name: Optional[str] = None
    quantity: Optional[float] = None
    cost_price: Optional[float] = None
    current_price: Optional[float] = None
    currency: Optional[str] = None


class StockHoldingOut(StockHoldingBase):
    id: int
    account_id: int
    market_value: float  # quantity * current_price
    cost_value: float  # quantity * cost_price
    profit_loss: float  # market_value - cost_value
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Balance Snapshot Schema
class BalanceSnapshotOut(BaseModel):
    id: int
    account_id: int
    balance: float
    snapshot_date: datetime

    class Config:
        from_attributes = True


# Dashboard Schema
class DashboardOut(BaseModel):
    total_balance_cny: float
    total_balance_usd: float
    total_balance_hkd: float
    accounts: List[AccountBalanceOut]


# Exchange rates (simplified, hardcoded)
EXCHANGE_RATES = {
    "CNY": 1.0,
    "USD": 7.24,
    "HKD": 0.93,
}


class TotalBalanceOut(BaseModel):
    total_cny: float
    total_usd: float
    total_hkd: float
    total_cny_equivalent: float
