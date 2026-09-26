#!/bin/bash
# SIH26122 Nirikshan - Development Setup Script

set -e

echo "Setting up Nirikshan SIH26122 development environment..."

# Check for required tools
command -v python3 >/dev/null 2>&1 || { echo "Python 3 is required but not installed. Aborting."; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed. Aborting."; exit 1; }

# Backend setup
echo "Setting up backend..."
cd backend
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

# Initialize database
python -c "
from database.database import init_db
init_db()
print('Database initialized')
"

# Load sample schedule
python -m data.load_schedule

# Generate embeddings
python -m data.generate_embeddings

deactivate
cd ..

# Frontend setup
echo "Setting up frontend..."
cd frontend
npm install
cd ..

# Create .env if not exists
if [ ! -f .env ]; then
    cp .env.example .env
    echo "Created .env from .env.example - please update with your settings"
fi

echo ""
echo "Setup complete!"
echo ""
echo "To start development servers:"
echo "  Backend:  cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "  Frontend: cd frontend && npm run dev"
echo ""
echo "Make sure Ollama is running with the 8B model:"
echo "  ollama pull llama3:8b-instruct-q4_K_M"
echo "  ollama serve"
echo ""
echo "Then visit:"
echo "  Frontend: http://localhost:5173"
echo "  Backend API: http://localhost:8000/docs"