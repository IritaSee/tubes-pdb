from flask import Flask
from flask_cors import CORS
from backend.config import get_config

def create_app():
    """Flask application factory"""
    app = Flask(__name__)
    
    # Load configuration
    config = get_config()
    app.config.from_object(config)
    
    # Validate configuration (warn but don't crash)
    try:
        config.validate()
        print("✅ All environment variables configured")
    except ValueError as e:
        print(f"⚠️  Configuration warning: {e}")
        print("⚠️  The app will start but API calls may fail until you configure your .env file")

    
    # Configure CORS
    CORS(app, origins=[
        config.FRONTEND_URL,
        "http://localhost:5173",  # Vite default
        "http://localhost:3000",  # Alternative frontend port
    ], supports_credentials=True)
    
    # Register blueprints
    from backend.routes import auth, datasets, assignments, chat, submissions, grading, debug

    app.register_blueprint(auth.bp, url_prefix='/api/auth')
    app.register_blueprint(datasets.bp, url_prefix='/api/datasets')
    app.register_blueprint(assignments.bp, url_prefix='/api/assignments')
    app.register_blueprint(chat.bp, url_prefix='/api/chat')
    app.register_blueprint(submissions.bp, url_prefix='/api/submissions')
    app.register_blueprint(grading.bp, url_prefix='/api/grading')
    app.register_blueprint(debug.bp, url_prefix='/api/debug')
    
    # Health check endpoint
    @app.route('/api/health')
    def health():
        return {'status': 'ok', 'message': 'Backend is running'}
    
    # Root endpoint
    @app.route('/')
    def root():
        return {'message': 'Biomedical Analyst Roleplay Platform API', 'version': '1.0.0'}
    
    return app

# For local development
if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5001, debug=True)
