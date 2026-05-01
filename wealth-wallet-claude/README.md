# Wealth Wallet

A personal wealth tracker. Track deposits, liabilities, and stock holdings across bank, brokerage, and transit-card accounts in CNY / USD / HKD. Auto-aggregates total net worth into CNY using user-managed exchange rates and renders per-account balance history as a line chart.

- **Backend**: Python · FastAPI · SQLAlchemy · SQLite
- **Frontend**: React 18 · TypeScript · Vite · recharts · react-router

## Quick Start

### 1. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs · DB file: `backend/data/wallet.db`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. Vite proxies `/api/*` to the backend at port 8000.

## Features

- Multiple accounts per type: **Bank**, **Brokerage**, **Transit Card**.
- Multi-currency: **CNY** (default), **USD**, **HKD**, with editable exchange rates in Settings.
- Track per-account transactions: **deposit**, **withdraw**, **liability**, **repay**.
- Brokerage accounts also track **stock holdings** (symbol, shares, cost basis, current price) — market value rolls into the account balance.
- Dashboard shows **total net worth in CNY** + per-currency breakdown + per-account cards.
- Account detail page shows live balance, balance **line chart** (30 / 90 / 180 / 365 days), transactions, and (for brokerage) holdings.
- Daily balance snapshots auto-saved on every mutation; the chart forward-fills inactive days.

## Project Layout

```
wealth-wallet-claude/
  backend/   FastAPI app (see backend/README.md)
  frontend/  Vite + React + TS app
```
