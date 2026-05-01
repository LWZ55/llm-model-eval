from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from .database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    account_type = Column(String(50), nullable=False)  # bank, brokerage, transit
    currency = Column(String(10), default="CNY")  # CNY, USD, HKD
    description = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    deposits = relationship("Deposit", back_populates="account", cascade="all, delete-orphan")
    liabilities = relationship("Liability", back_populates="account", cascade="all, delete-orphan")
    stock_holdings = relationship("StockHolding", back_populates="account", cascade="all, delete-orphan")
    balance_snapshots = relationship("BalanceSnapshot", back_populates="account", cascade="all, delete-orphan")


class Deposit(Base):
    __tablename__ = "deposits"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(200), default="")
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="deposits")


class Liability(Base):
    __tablename__ = "liabilities"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String(200), default="")
    date = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="liabilities")


class StockHolding(Base):
    __tablename__ = "stock_holdings"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    stock_code = Column(String(20), nullable=False)
    stock_name = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)  # cost per share
    current_price = Column(Float, default=0)  # current price per share
    currency = Column(String(10), default="CNY")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    account = relationship("Account", back_populates="stock_holdings")


class BalanceSnapshot(Base):
    __tablename__ = "balance_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    balance = Column(Float, nullable=False)
    snapshot_date = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="balance_snapshots")
