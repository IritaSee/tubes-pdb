"""
Debug endpoint to test Vercel deployment
"""
from flask import Blueprint, jsonify
import sys
import os

bp = Blueprint('debug', __name__)

@bp.route('/test', methods=['GET'])
def test():
    """Test endpoint to verify imports and environment"""
    try:
        # Test imports
        from backend.utils.db import get_supabase_admin
        from backend.config import get_config
        
        config = get_config()
        
        return jsonify({
            'status': 'ok',
            'python_version': sys.version,
            'python_path': sys.path[:3],
            'env_vars_set': {
                'SUPABASE_URL': bool(config.SUPABASE_URL),
                'SUPABASE_KEY': bool(config.SUPABASE_KEY),
                'GEMINI_API_KEY': bool(config.GEMINI_API_KEY),
                'JWT_SECRET': bool(config.JWT_SECRET),
            }
        }), 200
    except Exception as e:
        import traceback
        return jsonify({
            'status': 'error',
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500

@bp.route('/test-db', methods=['GET'])
def test_db():
    """Test database connection"""
    try:
        from backend.utils.db import get_supabase_admin
        supabase = get_supabase_admin()
        
        # Try a simple query
        result = supabase.table('students').select('nim').limit(1).execute()
        
        return jsonify({
            'status': 'ok',
            'message': 'Database connection successful',
            'has_data': len(result.data) > 0
        }), 200
    except Exception as e:
        import traceback
        return jsonify({
            'status': 'error',
            'error': str(e),
            'traceback': traceback.format_exc()
        }), 500
