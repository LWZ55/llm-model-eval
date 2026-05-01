#!/bin/bash

echo "Starting Wealth Wallet Application..."
echo ""

# Start backend in background
echo "Starting backend server..."
cd "$(dirname "$0")/backend"
python3 main.py &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

# Wait a moment for backend to start
sleep 2

# Start frontend in background
echo "Starting frontend server..."
cd "$(dirname "$0")/frontend"
npm run dev &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

echo ""
echo "========================================="
echo "  Servers are running!"
echo "========================================="
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo "========================================="

# Handle script termination
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT TERM EXIT

# Wait for background processes
wait
