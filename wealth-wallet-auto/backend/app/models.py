from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.database import Base


class AccountType(str, enum.Enum):
    bank = "bank"
    broker = "broker"
    transit = "transit"


class Currency(str, enum.Enum):
    CNY = "CNY"
    USD = "USD"
    HKD = "HKD"


class TransactionType(str, enum.Enum):
    deposit = "deposit"
    liability = "liability"


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(Enum(AccountType), nullable=False)
    currency = Column(Enum(Currency), default=Currency.CNY)
    created_at = Column(DateTime, default=datetime.utcnow)

    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")
    stock_holdings = relationship("StockHolding", back_populates="account", cascade="all, delete-orphan")

    @property
    def balance(self):
        total_deposit = sum(t.amount for t in self.transactions if t.type == TransactionType.deposit)
        total_liability = sum(t.amount for t in self.transactions if t.type == TransactionType.liability)
        return total_deposit - total_liability

    @property
    def stock_value(self):
        return sum(h.current_value for h in self.stock_holdings)


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    type = Column(Enum(TransactionType), nullable=False)
    amount = Column(Float, nullable=False)
    description = Column(String, default="")
    date = Column(DateTime, default=datetime.utcnow)

    account = relationship("Account", back_populates="transactions")


class StockHolding(Base):
    __tablename__ = "stock_holdings"

    id = Column(Integer, primary_key=True, index=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    symbol = Column(String, nullable=False)
    shares = Column(Float, nullable=False)
    avg_cost = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    currency = Column(Enum(Currency), default=Currency.CNY)

    account = relationship("Account", back_populates="stock_holdings")

    @property
    def current_value(self):
        return self.shares * self.current_price
