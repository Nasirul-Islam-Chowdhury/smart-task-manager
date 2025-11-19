#!/bin/bash

echo "=== Stopping Smart Task Manager Servers ==="
echo ""

# Kill processes on ports 3000 and 5000
echo "Killing processes on port 5000 (backend)..."
lsof -ti:5000 | xargs kill -9 2>/dev/null

echo "Killing processes on port 3000 (frontend)..."
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Kill any remaining nodemon/ts-node/next processes
echo "Cleaning up remaining Node processes..."
pkill -9 -f "nodemon|ts-node|next-server" 2>/dev/null

echo ""
echo "✓ All servers stopped"
