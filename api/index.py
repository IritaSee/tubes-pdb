from backend.app import create_app

# Create Flask app instance for Vercel
app = create_app()

# Vercel will use this 'app' variable
