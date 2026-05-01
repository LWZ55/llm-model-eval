from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional


class AccountBase(BaseModel):
    name: str
    account_type: str
    currency: str = "CNY"


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = None
    currency: Optional[str] = None


class AccountResponse(AccountBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionBase(BaseModel):
    transaction_type: str
    amount: float
    description: str = ""
    date: datetime


class TransactionCreate(TransactionBase):
    account_id: int


class TransactionResponse(TransactionBase):
    id: int
    account_id: int

    class Config:
        from_attributes = True


class StockHoldingBase(BaseModel):
    stock_code: str
    stock_name: str
    quantity: int
    avg_price: float
    current_price: float


class StockHoldingCreate(StockHoldingBase):
    account_id: int


class StockHoldingUpdate(BaseModel):
    quantity: Optional[int] = None
    avg_price: Optional[float] = None
    current_price: Optional[float] = None


class StockHoldingResponse(StockHoldingBase):
    id: int
    account_id: int
    updated_at: datetime

    class Config:
        from_attributes = True


class AccountBalance(BaseModel):
    account_id: int
    account_name: str
    account_type: str
    currency: str
    total_deposit: float
    total_liability: float
    net_balance: float
    stock_value: float
    total_assets: float


class TotalBalance(BaseModel):
    total_deposit: float
    total_liability: float
    net_balance: float
    total_stock_value: float
    total_assets: float
    accounts: List[AccountBalance]


class BalanceHistoryPoint(BaseModel):
    date: str
    balance: float


class AccountDetail(AccountResponse):
    transactions: List[TransactionResponse]
    holdings: List[StockHoldingResponse]
    balance: AccountBalance
