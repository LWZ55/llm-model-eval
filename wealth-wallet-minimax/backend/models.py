from sqlalchemy import Column, Integer, String, Float, DateTime, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from database import Base


class AccountType(str, enum.Enum):
    BANK = "bank"
    SECURITIES = "securities"
    TRANSIT = "transit"


class Currency(str, enum.Enum):
    CNY = "CNY"
    USD = "USD"
    HKD = "HKD"


class TransactionType(str, enum.Enum):
    DEPOSIT = "deposit"
    DEBT = "debt"


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(20), nullable=False)  # bank, securities, transit
    currency = Column(String(10), default="CNY")
    balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")
    stock_holdings = relationship("StockHolding", back_populates="account", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    type = Column(String(20), nullable=False)  # deposit, debt
    amount = Column(Float, nullable=False)
    description = Column(String(200), default="")
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="transactions")


class StockHolding(Base):
    __tablename__ = "stock_holdings"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    symbol = Column(String(20), nullable=False)
    name = Column(String(100), default="")
    quantity = Column(Float, default=0)
    cost_price = Column(Float, default=0)
    current_price = Column(Float, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="stock_holdings")