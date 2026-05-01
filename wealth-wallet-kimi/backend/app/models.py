from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class AccountType(str, enum.Enum):
    BANK = "bank"
    BROKER = "broker"
    TRANSPORT = "transport"


class Currency(str, enum.Enum):
    CNY = "CNY"
    USD = "USD"
    HKD = "HKD"


class TransactionType(str, enum.Enum):
    DEPOSIT = "deposit"
    LIABILITY = "liability"


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    account_type = Column(String, nullable=False)
    currency = Column(String, default="CNY")
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")
    holdings = relationship("StockHolding", back_populates="account", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    transaction_type = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, default="")
    date = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="transactions")


class StockHolding(Base):
    __tablename__ = "stock_holdings"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    stock_code = Column(String, nullable=False)
    stock_name = Column(String, nullable=False)
    quantity = Column(Integer, nullable=False)
    avg_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="holdings")
