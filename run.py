#!/usr/bin/env python3
"""
Run the Flask backend server.
This script ensures the project root is in the Python path.
"""
import sys
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

# Now we can import from backend
from backend.app import create_app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5001, debug=True)
