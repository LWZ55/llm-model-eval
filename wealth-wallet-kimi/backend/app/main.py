from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import engine, Base
from app.routers import accounts, transactions, holdings, dashboard

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wealth Wallet API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(holdings.router)
app.include_router(dashboard.router)


@app.get("/")
def root():
    return {"message": "Wealth Wallet API is running"}
