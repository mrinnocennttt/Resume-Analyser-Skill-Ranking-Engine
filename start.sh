#!/bin/bash
# =========================================================
# MatchRank AI - Start Backend & Frontend Servers
# =========================================================

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "========================================================="
echo "  🚀 Starting MatchRank AI Project"
echo "========================================================="

# 1. Check Python virtual environment
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    ./venv/bin/pip install -r backend/requirements.txt
fi

# 2. Start FastAPI Backend Server
echo "Starting FastAPI backend on http://localhost:8000..."
./venv/bin/python backend/run.py &
BACKEND_PID=$!

# 3. Start React Frontend Server
echo "Starting Vite React frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!

cd "$PROJECT_DIR"

echo ""
echo "✅ Both servers are now running!"
echo "   👉 Frontend Dashboard: http://localhost:5174 (or http://localhost:5173)"
echo "   👉 Backend API:        http://localhost:8000"
echo "   👉 Swagger Docs:       http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop all servers."

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0" SIGINT SIGTERM
wait
