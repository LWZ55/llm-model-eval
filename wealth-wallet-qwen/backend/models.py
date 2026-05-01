from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime
import enum

class AccountType(str, enum.Enum):
    BANK = "bank"
    BROKER = "broker"
    WALLET = "wallet"

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
    type = Column(Enum(AccountType), nullable=False)
    currency = Column(Enum(Currency), default=Currency.CNY, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")
    holdings = relationship("StockHolding", back_populates="account", cascade="all, delete-orphan")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, nullable=True)
    date = Column(DateTime, nullable=False, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="transactions")

class StockHolding(Base):
    __tablename__ = "stock_holdings"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    symbol = Column(String, nullable=False)
    shares = Column(Float, nullable=False)
    avg_cost = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    currency = Column(Enum(Currency), default=Currency.CNY, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account = relationship("Account", back_populates="holdings")
