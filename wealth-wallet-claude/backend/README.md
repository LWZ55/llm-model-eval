# Wealth Wallet — Backend

FastAPI + SQLAlchemy + SQLite.

## Setup

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs at http://localhost:8000/docs

The SQLite database file is created at `backend/data/wallet.db` on first run.

## Endpoints

- `GET  /api/health`
- `GET  /api/summary` — total net worth in CNY + per-currency breakdown
- `GET/POST /api/accounts`, `GET/PATCH/DELETE /api/accounts/{id}`
- `GET  /api/accounts/{id}/balance`
- `GET  /api/accounts/{id}/history?days=90`
- `GET/POST /api/accounts/{id}/transactions`
- `DELETE /api/transactions/{id}`
- `GET/POST /api/accounts/{id}/holdings` (brokerage only)
- `PATCH/DELETE /api/holdings/{id}`
- `GET/PUT /api/rates`
