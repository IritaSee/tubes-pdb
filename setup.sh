#!/bin/bash

# Biomedical Analyst Platform - Quick Setup Script

echo "🏥 Biomedical Analyst Platform Setup"
echo "===================================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "⚠️  IMPORTANT: You need to fill in the following values in .env:"
    echo "   - SUPABASE_URL (from your Supabase project)"
    echo "   - SUPABASE_KEY (anon key from Supabase)"
    echo "   - SUPABASE_SERVICE_KEY (service role key from Supabase)"
    echo "   - GEMINI_API_KEY (from Google AI Studio)"
    echo "   - JWT_SECRET (generate with: openssl rand -hex 32)"
    echo ""
    echo "After filling in .env, run this script again."
    exit 1
fi

# Check if Python dependencies are installed
echo "📦 Checking Python dependencies..."
if ! python3 -c "import flask" 2>/dev/null; then
    echo "Installing Python dependencies..."
    pip3 install -r requirements.txt
    echo "✅ Python dependencies installed"
else
    echo "✅ Python dependencies already installed"
fi

echo ""
echo "🚀 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Fill in your .env file with API keys"
echo "2. Set up your Supabase database (run docs/db_schema.sql)"
echo "3. Start the backend: python backend/app.py"
echo "4. Start the frontend: cd frontend && npm run dev"
echo ""
echo "📚 Documentation:"
echo "   - Backend: README.md"
echo "   - Frontend: frontend/README.md"
echo "   - Deployment: docs/vercel_deployment.md"
echo ""
