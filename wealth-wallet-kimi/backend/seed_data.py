#!/usr/bin/env python3
"""Seed script to populate the Wealth Wallet database with mock data."""

import requests
from datetime import datetime, timedelta

BASE_URL = "http://localhost:8000"


def create_account(name, account_type, currency="CNY"):
    r = requests.post(f"{BASE_URL}/accounts/", json={
        "name": name,
        "account_type": account_type,
        "currency": currency,
    })
    r.raise_for_status()
    return r.json()


def create_transaction(account_id, tx_type, amount, description, date_str):
    r = requests.post(f"{BASE_URL}/transactions/", json={
        "account_id": account_id,
        "transaction_type": tx_type,
        "amount": amount,
        "description": description,
        "date": f"{date_str}T00:00:00",
    })
    r.raise_for_status()
    return r.json()


def create_holding(account_id, stock_code, stock_name, quantity, avg_price, current_price):
    r = requests.post(f"{BASE_URL}/holdings/", json={
        "account_id": account_id,
        "stock_code": stock_code,
        "stock_name": stock_name,
        "quantity": quantity,
        "avg_price": avg_price,
        "current_price": current_price,
    })
    r.raise_for_status()
    return r.json()


def main():
    print("Seeding mock data...")

    # Accounts
    icbc = create_account("ICBC Savings", "bank", "CNY")
    hsbc = create_account("HSBC Premier", "bank", "USD")
    tiger = create_account("Tiger Brokers", "broker", "HKD")
    octopus = create_account("Octopus Card", "transport", "HKD")

    print(f"Created accounts: {icbc['id']}, {hsbc['id']}, {tiger['id']}, {octopus['id']}")

    today = datetime.now()

    # ICBC transactions (monthly salary deposits, rent liability, shopping)
    create_transaction(icbc["id"], "deposit", 15000.00, "Salary Jan", (today - timedelta(days=120)).strftime("%Y-%m-%d"))
    create_transaction(icbc["id"], "liability", 4500.00, "Rent Jan", (today - timedelta(days=118)).strftime("%Y-%m-%d"))
    create_transaction(icbc["id"], "deposit", 15000.00, "Salary Feb", (today - timedelta(days=90)).strftime("%Y-%m-%d"))
    create_transaction(icbc["id"], "liability", 4500.00, "Rent Feb", (today - timedelta(days=88)).strftime("%Y-%m-%d"))
    create_transaction(icbc["id"], "liability", 2000.00, "Shopping", (today - timedelta(days=85)).strftime("%Y-%m-%d"))
    create_transaction(icbc["id"], "deposit", 15000.00, "Salary Mar", (today - timedelta(days=60)).strftime("%Y-%m-%d"))
    create_transaction(icbc["id"], "liability", 4500.00, "Rent Mar", (today - timedelta(days=58)).strftime("%Y-%m-%d"))
    create_transaction(icbc["id"], "deposit", 15000.00, "Salary Apr", (today - timedelta(days=30)).strftime("%Y-%m-%d"))
    create_transaction(icbc["id"], "liability", 4500.00, "Rent Apr", (today - timedelta(days=28)).strftime("%Y-%m-%d"))
    create_transaction(icbc["id"], "liability", 3500.00, "Credit card bill", (today - timedelta(days=25)).strftime("%Y-%m-%d"))
    create_transaction(icbc["id"], "deposit", 15000.00, "Salary May", today.strftime("%Y-%m-%d"))
    create_transaction(icbc["id"], "liability", 4500.00, "Rent May", (today - timedelta(days=2)).strftime("%Y-%m-%d"))

    # HSBC transactions (USD savings, occasional spending)
    create_transaction(hsbc["id"], "deposit", 5000.00, "USD exchange", (today - timedelta(days=100)).strftime("%Y-%m-%d"))
    create_transaction(hsbc["id"], "liability", 800.00, "Amazon purchase", (today - timedelta(days=80)).strftime("%Y-%m-%d"))
    create_transaction(hsbc["id"], "deposit", 3000.00, "Freelance payment", (today - timedelta(days=45)).strftime("%Y-%m-%d"))
    create_transaction(hsbc["id"], "liability", 1200.00, "Apple Store", (today - timedelta(days=20)).strftime("%Y-%m-%d"))
    create_transaction(hsbc["id"], "deposit", 2500.00, "Stock dividend", (today - timedelta(days=5)).strftime("%Y-%m-%d"))

    # Octopus transactions (daily transport, top-ups)
    create_transaction(octopus["id"], "deposit", 500.00, "Top-up", (today - timedelta(days=90)).strftime("%Y-%m-%d"))
    create_transaction(octopus["id"], "liability", 45.00, "MTR commute", (today - timedelta(days=89)).strftime("%Y-%m-%d"))
    create_transaction(octopus["id"], "liability", 38.00, "Bus fare", (today - timedelta(days=88)).strftime("%Y-%m-%d"))
    create_transaction(octopus["id"], "deposit", 500.00, "Top-up", (today - timedelta(days=60)).strftime("%Y-%m-%d"))
    create_transaction(octopus["id"], "liability", 50.00, "MTR commute", (today - timedelta(days=59)).strftime("%Y-%m-%d"))
    create_transaction(octopus["id"], "deposit", 300.00, "Top-up", (today - timedelta(days=30)).strftime("%Y-%m-%d"))
    create_transaction(octopus["id"], "liability", 42.00, "MTR commute", (today - timedelta(days=29)).strftime("%Y-%m-%d"))
    create_transaction(octopus["id"], "liability", 120.00, "Ferry", (today - timedelta(days=15)).strftime("%Y-%m-%d"))
    create_transaction(octopus["id"], "deposit", 500.00, "Top-up", today.strftime("%Y-%m-%d"))

    # Tiger Broker holdings (HK stocks)
    create_holding(tiger["id"], "0700", "Tencent", 100, 380.00, 420.50)
    create_holding(tiger["id"], "3690", "Meituan", 200, 120.00, 135.80)
    create_holding(tiger["id"], "9988", "Alibaba", 150, 85.00, 78.60)
    create_holding(tiger["id"], "2318", "Ping An", 500, 45.00, 52.30)

    # Tiger Broker transactions (cash in account)
    create_transaction(tiger["id"], "deposit", 100000.00, "Initial funding", (today - timedelta(days=180)).strftime("%Y-%m-%d"))
    create_transaction(tiger["id"], "deposit", 50000.00, "Additional funding", (today - timedelta(days=90)).strftime("%Y-%m-%d"))
    create_transaction(tiger["id"], "liability", 38000.00, "Buy Tencent", (today - timedelta(days=170)).strftime("%Y-%m-%d"))
    create_transaction(tiger["id"], "liability", 24000.00, "Buy Meituan", (today - timedelta(days=160)).strftime("%Y-%m-%d"))
    create_transaction(tiger["id"], "liability", 12750.00, "Buy Alibaba", (today - timedelta(days=150)).strftime("%Y-%m-%d"))
    create_transaction(tiger["id"], "liability", 22500.00, "Buy Ping An", (today - timedelta(days=140)).strftime("%Y-%m-%d"))

    print("Mock data seeded successfully!")


if __name__ == "__main__":
    main()
