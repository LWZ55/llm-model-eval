import urllib.request
import urllib.error
import json

BASE = "http://localhost:8000/api"

def api(method, path, body=None):
    url = f"{BASE}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, method=method, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

# Clear existing
for acc in api("GET", "/accounts"):
    api("DELETE", f"/accounts/{acc['id']}")

# 1. HSBC Savings (CNY)
hsbc = api("POST", "/accounts", {"name": "HSBC Savings", "type": "bank", "currency": "CNY"})
api("POST", f"/accounts/{hsbc['id']}/transactions", {"type": "deposit", "amount": 50000, "description": "Initial deposit", "date": "2026-01-05T10:00:00"})
api("POST", f"/accounts/{hsbc['id']}/transactions", {"type": "deposit", "amount": 15000, "description": "Salary Jan", "date": "2026-01-31T10:00:00"})
api("POST", f"/accounts/{hsbc['id']}/transactions", {"type": "liability", "amount": 3200, "description": "Credit card bill", "date": "2026-02-05T10:00:00"})
api("POST", f"/accounts/{hsbc['id']}/transactions", {"type": "deposit", "amount": 15000, "description": "Salary Feb", "date": "2026-02-28T10:00:00"})
api("POST", f"/accounts/{hsbc['id']}/transactions", {"type": "liability", "amount": 2800, "description": "Rent", "date": "2026-03-01T10:00:00"})
api("POST", f"/accounts/{hsbc['id']}/transactions", {"type": "deposit", "amount": 15000, "description": "Salary Mar", "date": "2026-03-31T10:00:00"})
api("POST", f"/accounts/{hsbc['id']}/transactions", {"type": "liability", "amount": 4500, "description": "Car loan payment", "date": "2026-04-05T10:00:00"})

# 2. Citi USD Account
usd = api("POST", "/accounts", {"name": "Citi USD Account", "type": "bank", "currency": "USD"})
api("POST", f"/accounts/{usd['id']}/transactions", {"type": "deposit", "amount": 8000, "description": "Wire from employer", "date": "2026-01-10T10:00:00"})
api("POST", f"/accounts/{usd['id']}/transactions", {"type": "liability", "amount": 1200, "description": "US credit card", "date": "2026-02-10T10:00:00"})
api("POST", f"/accounts/{usd['id']}/transactions", {"type": "deposit", "amount": 8000, "description": "Feb salary", "date": "2026-02-28T10:00:00"})
api("POST", f"/accounts/{usd['id']}/transactions", {"type": "liability", "amount": 1500, "description": "Student loan", "date": "2026-03-15T10:00:00"})
api("POST", f"/accounts/{usd['id']}/transactions", {"type": "deposit", "amount": 8000, "description": "Mar salary", "date": "2026-03-31T10:00:00"})

# 3. Interactive Brokers (USD)
ib = api("POST", "/accounts", {"name": "Interactive Brokers", "type": "broker", "currency": "USD"})
api("POST", f"/accounts/{ib['id']}/transactions", {"type": "deposit", "amount": 30000, "description": "Fund account", "date": "2026-01-02T10:00:00"})
api("POST", f"/accounts/{ib['id']}/transactions", {"type": "deposit", "amount": 10000, "description": "Additional fund", "date": "2026-03-01T10:00:00"})
api("POST", f"/accounts/{ib['id']}/stocks", {"symbol": "AAPL", "shares": 50, "avg_cost": 185.0, "current_price": 210.5, "currency": "USD"})
api("POST", f"/accounts/{ib['id']}/stocks", {"symbol": "TSLA", "shares": 30, "avg_cost": 220.0, "current_price": 195.3, "currency": "USD"})
api("POST", f"/accounts/{ib['id']}/stocks", {"symbol": "NVDA", "shares": 20, "avg_cost": 480.0, "current_price": 525.0, "currency": "USD"})

# 4. 华泰证券 (CNY)
ht = api("POST", "/accounts", {"name": "华泰证券", "type": "broker", "currency": "CNY"})
api("POST", f"/accounts/{ht['id']}/transactions", {"type": "deposit", "amount": 100000, "description": "开户入金", "date": "2026-01-08T10:00:00"})
api("POST", f"/accounts/{ht['id']}/transactions", {"type": "deposit", "amount": 50000, "description": "追加资金", "date": "2026-02-20T10:00:00"})
api("POST", f"/accounts/{ht['id']}/stocks", {"symbol": "600519", "shares": 100, "avg_cost": 1600.0, "current_price": 1725.0, "currency": "CNY"})
api("POST", f"/accounts/{ht['id']}/stocks", {"symbol": "000858", "shares": 200, "avg_cost": 145.0, "current_price": 138.5, "currency": "CNY"})

# 5. 北京交通卡 (CNY)
bjt = api("POST", "/accounts", {"name": "北京交通卡", "type": "transit", "currency": "CNY"})
api("POST", f"/accounts/{bjt['id']}/transactions", {"type": "deposit", "amount": 500, "description": "充值", "date": "2026-01-01T10:00:00"})
api("POST", f"/accounts/{bjt['id']}/transactions", {"type": "liability", "amount": 120, "description": "地铁消费", "date": "2026-01-15T10:00:00"})
api("POST", f"/accounts/{bjt['id']}/transactions", {"type": "deposit", "amount": 300, "description": "充值", "date": "2026-02-01T10:00:00"})
api("POST", f"/accounts/{bjt['id']}/transactions", {"type": "liability", "amount": 95, "description": "地铁消费", "date": "2026-02-20T10:00:00"})
api("POST", f"/accounts/{bjt['id']}/transactions", {"type": "deposit", "amount": 500, "description": "充值", "date": "2026-03-01T10:00:00"})
api("POST", f"/accounts/{bjt['id']}/transactions", {"type": "liability", "amount": 110, "description": "地铁消费", "date": "2026-03-25T10:00:00"})
api("POST", f"/accounts/{bjt['id']}/transactions", {"type": "deposit", "amount": 200, "description": "充值", "date": "2026-04-10T10:00:00"})

print("Mock data seeded successfully!")
