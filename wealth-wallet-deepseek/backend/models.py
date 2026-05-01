from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from database import Base


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)  # bank, brokerage, transit
    currency = Column(String, nullable=False, default="CNY")  # CNY, USD, HKD
    created_at = Column(DateTime, server_default=func.now())

    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")
    stock_holdings = relationship("StockHolding", back_populates="account", cascade="all, delete-orphan")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    type = Column(String, nullable=False)  # deposit or liability
    amount = Column(Float, nullable=False)
    description = Column(String, default="")
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())

    account = relationship("Account", back_populates="transactions")


class StockHolding(Base):
    __tablename__ = "stock_holdings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    stock_code = Column(String, nullable=False)
    stock_name = Column(String, nullable=False)
    quantity = Column(Float, nullable=False)
    cost_price = Column(Float, nullable=False)
    current_price = Column(Float, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    account = relationship("Account", back_populates="stock_holdings")


class BalanceHistory(Base):
    __tablename__ = "balance_history"

    id = Column(Integer, primary_key=True, autoincrement=True)
    account_id = Column(Integer, ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False)
    balance = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
