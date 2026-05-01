import requests
import json
from datetime import datetime, timedelta
import random

BASE = "http://localhost:8000/api"

def post(path, data):
    r = requests.post(f"{BASE}{path}", json=data)
    if r.status_code >= 300:
        print(f"ERROR {r.status_code}: {path} -> {r.text}")
    return r.json()

# ============================================================
# 1. Create Accounts
# ============================================================
print("=== Creating Accounts ===")

accounts = [
    {"name": "工商银行储蓄卡", "account_type": "bank", "currency": "CNY", "description": "日常储蓄"},
    {"name": "汇丰银行账户", "account_type": "bank", "currency": "HKD", "description": "香港工资卡"},
    {"name": "Chase Checking", "account_type": "bank", "currency": "USD", "description": "美国银行账户"},
    {"name": "华泰证券", "account_type": "brokerage", "currency": "CNY", "description": "A股投资账户"},
    {"name": "富途证券", "account_type": "brokerage", "currency": "HKD", "description": "港股投资"},
    {"name": "盈透证券", "account_type": "brokerage", "currency": "USD", "description": "美股投资"},
    {"name": "上海交通卡", "account_type": "transit", "currency": "CNY", "description": "上海公交地铁"},
    {"name": "八达通", "account_type": "transit", "currency": "HKD", "description": "香港八达通卡"},
]

created_accounts = []
for a in accounts:
    result = post("/accounts", a)
    created_accounts.append(result)
    print(f"  Created: {a['name']} (id={result.get('id')})")

# Map account names to ids
acc_ids = {a["name"]: a["id"] for a in created_accounts}

# ============================================================
# 2. Add Deposits & Liabilities
# ============================================================
print("\n=== Adding Deposits & Liabilities ===")

# Helper to generate dates over the past year
def random_date(days_ago=365):
    d = datetime.now() - timedelta(days=random.randint(0, days_ago))
    return d.strftime("%Y-%m-%dT%H:%M:%S")

# --- 工商银行储蓄卡 (CNY) ---
icbc = acc_ids["工商银行储蓄卡"]
deposits_icbc = [
    {"amount": 25000, "description": "1月工资", "date": "2026-01-25T09:00:00"},
    {"amount": 25000, "description": "2月工资", "date": "2026-02-25T09:00:00"},
    {"amount": 25000, "description": "3月工资", "date": "2026-03-25T09:00:00"},
    {"amount": 25000, "description": "4月工资", "date": "2026-04-25T09:00:00"},
    {"amount": 8000, "description": "年终奖金", "date": "2026-01-15T10:00:00"},
    {"amount": 5000, "description": "理财收益", "date": "2026-03-10T10:00:00"},
]
for d in deposits_icbc:
    post(f"/accounts/{icbc}/deposits", d)
    print(f"  Deposit -> 工商银行储蓄卡: {d['description']} ¥{d['amount']}")

liabilities_icbc = [
    {"amount": 3500, "description": "房贷月供", "date": "2026-01-20T08:00:00"},
    {"amount": 3500, "description": "房贷月供", "date": "2026-02-20T08:00:00"},
    {"amount": 3500, "description": "房贷月供", "date": "2026-03-20T08:00:00"},
    {"amount": 3500, "description": "房贷月供", "date": "2026-04-20T08:00:00"},
    {"amount": 2000, "description": "信用卡还款", "date": "2026-02-10T08:00:00"},
    {"amount": 1500, "description": "信用卡还款", "date": "2026-03-10T08:00:00"},
]
for l in liabilities_icbc:
    post(f"/accounts/{icbc}/liabilities", l)
    print(f"  Liability -> 工商银行储蓄卡: {l['description']} ¥{l['amount']}")

# --- 汇丰银行账户 (HKD) ---
hsbc = acc_ids["汇丰银行账户"]
deposits_hsbc = [
    {"amount": 40000, "description": "1月工資", "date": "2026-01-28T09:00:00"},
    {"amount": 40000, "description": "2月工資", "date": "2026-02-28T09:00:00"},
    {"amount": 40000, "description": "3月工資", "date": "2026-03-28T09:00:00"},
    {"amount": 40000, "description": "4月工資", "date": "2026-04-28T09:00:00"},
    {"amount": 15000, "description": "花紅", "date": "2026-02-05T10:00:00"},
]
for d in deposits_hsbc:
    post(f"/accounts/{hsbc}/deposits", d)
    print(f"  Deposit -> 汇丰银行: {d['description']} HK${d['amount']}")

liabilities_hsbc = [
    {"amount": 12000, "description": "租金", "date": "2026-01-01T08:00:00"},
    {"amount": 12000, "description": "租金", "date": "2026-02-01T08:00:00"},
    {"amount": 12000, "description": "租金", "date": "2026-03-01T08:00:00"},
    {"amount": 12000, "description": "租金", "date": "2026-04-01T08:00:00"},
]
for l in liabilities_hsbc:
    post(f"/accounts/{hsbc}/liabilities", l)
    print(f"  Liability -> 汇丰银行: {l['description']} HK${l['amount']}")

# --- Chase Checking (USD) ---
chase = acc_ids["Chase Checking"]
deposits_chase = [
    {"amount": 6000, "description": "January Salary", "date": "2026-01-31T09:00:00"},
    {"amount": 6000, "description": "February Salary", "date": "2026-02-28T09:00:00"},
    {"amount": 6000, "description": "March Salary", "date": "2026-03-31T09:00:00"},
    {"amount": 6000, "description": "April Salary", "date": "2026-04-30T09:00:00"},
    {"amount": 2000, "description": "Tax Refund", "date": "2026-03-15T10:00:00"},
]
for d in deposits_chase:
    post(f"/accounts/{chase}/deposits", d)
    print(f"  Deposit -> Chase: {d['description']} ${d['amount']}")

liabilities_chase = [
    {"amount": 1800, "description": "Rent", "date": "2026-01-01T08:00:00"},
    {"amount": 1800, "description": "Rent", "date": "2026-02-01T08:00:00"},
    {"amount": 1800, "description": "Rent", "date": "2026-03-01T08:00:00"},
    {"amount": 1800, "description": "Rent", "date": "2026-04-01T08:00:00"},
    {"amount": 500, "description": "Car Insurance", "date": "2026-01-15T08:00:00"},
    {"amount": 500, "description": "Car Insurance", "date": "2026-04-15T08:00:00"},
]
for l in liabilities_chase:
    post(f"/accounts/{chase}/liabilities", l)
    print(f"  Liability -> Chase: {l['description']} ${l['amount']}")

# --- 上海交通卡 (CNY) ---
transit_sh = acc_ids["上海交通卡"]
deposits_transit_sh = [
    {"amount": 200, "description": "充值", "date": "2026-01-05T08:00:00"},
    {"amount": 200, "description": "充值", "date": "2026-02-05T08:00:00"},
    {"amount": 200, "description": "充值", "date": "2026-03-05T08:00:00"},
    {"amount": 200, "description": "充值", "date": "2026-04-05T08:00:00"},
]
for d in deposits_transit_sh:
    post(f"/accounts/{transit_sh}/deposits", d)

liabilities_transit_sh = [
    {"amount": 150, "description": "乘车消费", "date": "2026-01-31T08:00:00"},
    {"amount": 160, "description": "乘车消费", "date": "2026-02-28T08:00:00"},
    {"amount": 145, "description": "乘车消费", "date": "2026-03-31T08:00:00"},
    {"amount": 130, "description": "乘车消费", "date": "2026-04-30T08:00:00"},
]
for l in liabilities_transit_sh:
    post(f"/accounts/{transit_sh}/liabilities", l)
print(f"  Deposits & Liabilities -> 上海交通卡: done")

# --- 八达通 (HKD) ---
octopus = acc_ids["八达通"]
deposits_octopus = [
    {"amount": 500, "description": "增值", "date": "2026-01-10T08:00:00"},
    {"amount": 500, "description": "增值", "date": "2026-02-10T08:00:00"},
    {"amount": 500, "description": "增值", "date": "2026-03-10T08:00:00"},
    {"amount": 500, "description": "增值", "date": "2026-04-10T08:00:00"},
]
for d in deposits_octopus:
    post(f"/accounts/{octopus}/deposits", d)

liabilities_octopus = [
    {"amount": 380, "description": "交通消費", "date": "2026-01-31T08:00:00"},
    {"amount": 350, "description": "交通消費", "date": "2026-02-28T08:00:00"},
    {"amount": 400, "description": "交通消費", "date": "2026-03-31T08:00:00"},
    {"amount": 360, "description": "交通消費", "date": "2026-04-30T08:00:00"},
]
for l in liabilities_octopus:
    post(f"/accounts/{octopus}/liabilities", l)
print(f"  Deposits & Liabilities -> 八达通: done")

# ============================================================
# 3. Add Stock Holdings for Brokerage Accounts
# ============================================================
print("\n=== Adding Stock Holdings ===")

# --- 华泰证券 (CNY A-shares) ---
huatai = acc_ids["华泰证券"]
deposits_huatai = [
    {"amount": 500000, "description": "转入资金", "date": "2025-06-01T10:00:00"},
    {"amount": 200000, "description": "追加资金", "date": "2025-12-01T10:00:00"},
]
for d in deposits_huatai:
    post(f"/accounts/{huatai}/deposits", d)

holdings_huatai = [
    {"stock_code": "600519", "stock_name": "贵州茅台", "quantity": 5, "cost_price": 1750, "current_price": 1820, "currency": "CNY"},
    {"stock_code": "000858", "stock_name": "五粮液", "quantity": 200, "cost_price": 145, "current_price": 158, "currency": "CNY"},
    {"stock_code": "601318", "stock_name": "中国平安", "quantity": 500, "cost_price": 42, "current_price": 48, "currency": "CNY"},
    {"stock_code": "000333", "stock_name": "美的集团", "quantity": 300, "cost_price": 58, "current_price": 65, "currency": "CNY"},
    {"stock_code": "600036", "stock_name": "招商银行", "quantity": 400, "cost_price": 32, "current_price": 35, "currency": "CNY"},
    {"stock_code": "002594", "stock_name": "比亚迪", "quantity": 50, "cost_price": 260, "current_price": 310, "currency": "CNY"},
]
for h in holdings_huatai:
    post(f"/accounts/{huatai}/holdings", h)
    mv = h["quantity"] * h["current_price"]
    print(f"  Holding -> 华泰证券: {h['stock_name']}({h['stock_code']}) x{h['quantity']} 市值¥{mv:,.0f}")

# --- 富途证券 (HKD Hong Kong stocks) ---
futu = acc_ids["富途证券"]
deposits_futu = [
    {"amount": 300000, "description": "轉入資金", "date": "2025-07-15T10:00:00"},
    {"amount": 100000, "description": "追加資金", "date": "2026-01-10T10:00:00"},
]
for d in deposits_futu:
    post(f"/accounts/{futu}/deposits", d)

holdings_futu = [
    {"stock_code": "00700", "stock_name": "騰訊控股", "quantity": 100, "cost_price": 320, "current_price": 385, "currency": "HKD"},
    {"stock_code": "09988", "stock_name": "阿里巴巴", "quantity": 200, "cost_price": 82, "current_price": 95, "currency": "HKD"},
    {"stock_code": "03690", "stock_name": "美團", "quantity": 150, "cost_price": 128, "current_price": 145, "currency": "HKD"},
    {"stock_code": "01810", "stock_name": "小米集團", "quantity": 500, "cost_price": 22, "current_price": 28, "currency": "HKD"},
    {"stock_code": "02318", "stock_name": "中國平安H", "quantity": 300, "cost_price": 38, "current_price": 42, "currency": "HKD"},
]
for h in holdings_futu:
    post(f"/accounts/{futu}/holdings", h)
    mv = h["quantity"] * h["current_price"]
    print(f"  Holding -> 富途证券: {h['stock_name']}({h['stock_code']}) x{h['quantity']} 市值HK${mv:,.0f}")

# --- 盈透证券 (USD US stocks) ---
ib = acc_ids["盈透证券"]
deposits_ib = [
    {"amount": 50000, "description": "Wire Transfer", "date": "2025-08-01T10:00:00"},
    {"amount": 20000, "description": "Additional Deposit", "date": "2026-02-15T10:00:00"},
]
for d in deposits_ib:
    post(f"/accounts/{ib}/deposits", d)

holdings_ib = [
    {"stock_code": "AAPL", "stock_name": "Apple Inc.", "quantity": 50, "cost_price": 175, "current_price": 198, "currency": "USD"},
    {"stock_code": "MSFT", "stock_name": "Microsoft Corp.", "quantity": 30, "cost_price": 380, "current_price": 420, "currency": "USD"},
    {"stock_code": "GOOGL", "stock_name": "Alphabet Inc.", "quantity": 20, "cost_price": 140, "current_price": 165, "currency": "USD"},
    {"stock_code": "NVDA", "stock_name": "NVIDIA Corp.", "quantity": 40, "cost_price": 480, "current_price": 880, "currency": "USD"},
    {"stock_code": "AMZN", "stock_name": "Amazon.com", "quantity": 15, "cost_price": 175, "current_price": 190, "currency": "USD"},
    {"stock_code": "TSLA", "stock_name": "Tesla Inc.", "quantity": 25, "cost_price": 250, "current_price": 180, "currency": "USD"},
]
for h in holdings_ib:
    post(f"/accounts/{ib}/holdings", h)
    mv = h["quantity"] * h["current_price"]
    pl = h["quantity"] * (h["current_price"] - h["cost_price"])
    print(f"  Holding -> 盈透证券: {h['stock_name']}({h['stock_code']}) x{h['quantity']} MV=${mv:,.0f} P/L=${pl:+,.0f}")

# ============================================================
# 4. Print Summary
# ============================================================
print("\n=== Summary ===")
summary = requests.get(f"{BASE}/dashboard/summary").json()
print(f"  CNY Total:  ¥{summary['total_cny']:>12,.2f}")
print(f"  USD Total:  ${summary['total_usd']:>12,.2f}")
print(f"  HKD Total:  HK${summary['total_hkd']:>10,.2f}")
print(f"  CNY Equiv:  ¥{summary['total_cny_equivalent']:>12,.2f}")

accounts_bal = requests.get(f"{BASE}/dashboard/accounts-balance").json()
print(f"\n  {'Account':<20} {'Type':<12} {'Currency':<8} {'Balance':>15}")
print(f"  {'-'*60}")
for a in accounts_bal:
    cur_map = {"CNY": "¥", "USD": "$", "HKD": "HK$"}
    prefix = cur_map.get(a["currency"], "")
    print(f"  {a['name']:<20} {a['account_type']:<12} {a['currency']:<8} {prefix}{a['balance']:>12,.2f}")

print("\nDone! Mock data seeded successfully.")
