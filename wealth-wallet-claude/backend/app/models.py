from datetime import date, datetime

from sqlalchemy import (
    Column,
    Date,
    DateTime,
    ForeignKey,
    Integer,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship

from .database import Base

# ---- enum-like string constants ----
ACCOUNT_TYPES = ("bank", "brokerage", "transit_card")
CURRENCIES = ("CNY", "USD", "HKD")
TX_KINDS = ("deposit", "withdraw", "liability", "repay")


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)
    currency = Column(String(3), nullable=False, default="CNY")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    transactions = relationship(
        "Transaction", back_populates="account", cascade="all, delete-orphan"
    )
    holdings = relationship(
        "Holding", back_populates="account", cascade="all, delete-orphan"
    )
    snapshots = relationship(
        "BalanceSnapshot", back_populates="account", cascade="all, delete-orphan"
    )


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    kind = Column(String(20), nullable=False)
    amount = Column(Numeric(18, 2), nullable=False)
    note = Column(String(255), nullable=True)
    date = Column(Date, nullable=False, default=date.today)

    account = relationship("Account", back_populates="transactions")


class Holding(Base):
    __tablename__ = "holdings"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    symbol = Column(String(32), nullable=False)
    shares = Column(Numeric(18, 4), nullable=False, default=0)
    cost_basis = Column(Numeric(18, 4), nullable=False, default=0)
    current_price = Column(Numeric(18, 4), nullable=False, default=0)
    currency = Column(String(3), nullable=False, default="CNY")

    account = relationship("Account", back_populates="holdings")


class BalanceSnapshot(Base):
    __tablename__ = "balance_snapshots"
    __table_args__ = (UniqueConstraint("account_id", "date", name="uix_account_date"),)

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False, default=date.today)
    balance = Column(Numeric(18, 2), nullable=False)

    account = relationship("Account", back_populates="snapshots")


class ExchangeRate(Base):
    __tablename__ = "exchange_rates"
    __table_args__ = (UniqueConstraint("base_ccy", "quote_ccy", name="uix_pair"),)

    id = Column(Integer, primary_key=True, index=True)
    base_ccy = Column(String(3), nullable=False)
    quote_ccy = Column(String(3), nullable=False)
    rate = Column(Numeric(18, 6), nullable=False)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow)
