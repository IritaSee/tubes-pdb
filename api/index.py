import sys
from pathlib import Path

# Add project root to Python path for Vercel serverless
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from backend.app import create_app

# Create Flask app instance for Vercel
app = create_app()

# Vercel will use this 'app' variable
