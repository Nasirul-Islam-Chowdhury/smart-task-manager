#!/bin/bash

echo "=== Smart Task Manager - Starting Servers ==="
echo ""

# Kill any existing processes on ports 3000 and 5000
echo "Cleaning up existing processes..."
lsof -ti:5000 | xargs kill -9 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
sleep 2

# Check if MongoDB is running
if pgrep -x "mongod" > /dev/null; then
    echo "✓ MongoDB is running"
else
    echo "✗ MongoDB is NOT running"
    echo "Please start MongoDB first:"
    echo "  macOS: brew services start mongodb-community"
    echo "  Linux: sudo systemctl start mongod"
    exit 1
fi

echo ""
echo "Starting Backend Server..."
cd backend
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!
echo "Backend started with PID: $BACKEND_PID"

sleep 5

echo ""
echo "Starting Frontend Server..."
cd ../frontend
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started with PID: $FRONTEND_PID"

sleep 5

echo ""
echo "=== Servers Started Successfully! ==="
echo ""
echo "Backend:  http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Backend PID: $BACKEND_PID (log: backend.log)"
echo "Frontend PID: $FRONTEND_PID (log: frontend.log)"
echo ""
echo "To view logs:"
echo "  tail -f backend.log"
echo "  tail -f frontend.log"
echo ""
echo "To stop servers:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo "  or run: ./STOP_SERVERS.sh"
echo ""
echo "Open your browser to: http://localhost:3000"
