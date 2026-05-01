from datetime import date, datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, Field

AccountType = Literal["bank", "brokerage", "transit_card"]
Currency = Literal["CNY", "USD", "HKD"]
TxKind = Literal["deposit", "withdraw", "liability", "repay"]


# ---------- Account ----------
class AccountBase(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    type: AccountType
    currency: Currency = "CNY"


class AccountCreate(AccountBase):
    pass


class AccountUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=100)
    currency: Optional[Currency] = None


class AccountOut(AccountBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime


class AccountWithBalance(AccountOut):
    balance: Decimal
    balance_in_base: Decimal  # converted to CNY


# ---------- Transaction ----------
class TransactionBase(BaseModel):
    kind: TxKind
    amount: Decimal = Field(gt=0)
    note: Optional[str] = Field(default=None, max_length=255)
    date: Optional[date] = None


class TransactionCreate(TransactionBase):
    pass


class TransactionOut(TransactionBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    account_id: int
    date: date


# ---------- Holding ----------
class HoldingBase(BaseModel):
    symbol: str = Field(min_length=1, max_length=32)
    shares: Decimal = Field(ge=0)
    cost_basis: Decimal = Field(ge=0)
    current_price: Decimal = Field(ge=0)
    currency: Currency = "CNY"


class HoldingCreate(HoldingBase):
    pass


class HoldingUpdate(BaseModel):
    symbol: Optional[str] = Field(default=None, min_length=1, max_length=32)
    shares: Optional[Decimal] = Field(default=None, ge=0)
    cost_basis: Optional[Decimal] = Field(default=None, ge=0)
    current_price: Optional[Decimal] = Field(default=None, ge=0)
    currency: Optional[Currency] = None


class HoldingOut(HoldingBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    account_id: int
    market_value: Decimal


# ---------- Snapshot / History ----------
class HistoryPoint(BaseModel):
    date: date
    balance: Decimal


# ---------- Summary ----------
class CurrencyBreakdown(BaseModel):
    currency: Currency
    balance: Decimal
    balance_in_base: Decimal


class Summary(BaseModel):
    base_currency: Currency = "CNY"
    total: Decimal
    by_currency: list[CurrencyBreakdown]
    accounts: list[AccountWithBalance]


# ---------- Exchange rates ----------
class RateOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    base_ccy: Currency
    quote_ccy: Currency
    rate: Decimal
    updated_at: datetime


class RateUpdate(BaseModel):
    base_ccy: Currency
    quote_ccy: Currency
    rate: Decimal = Field(gt=0)


# ---------- Balance ----------
class BalanceOut(BaseModel):
    account_id: int
    currency: Currency
    balance: Decimal
    balance_in_base: Decimal
