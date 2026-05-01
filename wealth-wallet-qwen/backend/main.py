from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routes import accounts, transactions, stocks, dashboard

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Wealth Wallet API", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(accounts.router)
app.include_router(transactions.router)
app.include_router(stocks.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "Wealth Wallet API", "version": "1.0.0"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
