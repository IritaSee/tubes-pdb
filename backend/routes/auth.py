from flask import Blueprint, request, jsonify
from functools import wraps
from backend.services.auth_service import (
    authenticate_lecturer, authenticate_student,
    create_lecturer, generate_jwt_token, decode_jwt_token
)
from backend.models.user import UserLogin, UserCreate
from backend.models.student import StudentLogin, StudentBulkCreate
from backend.utils.db import get_supabase_admin
from backend.utils.validators import EmailValidator, PasswordValidator, NIMValidator
from pydantic import ValidationError

bp = Blueprint('auth', __name__)

# Middleware for JWT authentication
def require_auth(user_type=None):
    """
    Decorator to require JWT authentication
    
    Args:
        user_type: Optional user type filter ('lecturer' or 'student')
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            auth_header = request.headers.get('Authorization')
            
            if not auth_header or not auth_header.startswith('Bearer '):
                return jsonify({'error': 'Missing or invalid authorization header'}), 401
            
            token = auth_header.split(' ')[1]
            
            try:
                payload = decode_jwt_token(token)
                
                # Check user type if specified
                if user_type and payload.get('user_type') != user_type:
                    return jsonify({'error': 'Unauthorized'}), 403
                
                # Add payload to request context
                request.user = payload
                
            except ValueError as e:
                return jsonify({'error': str(e)}), 401
            
            return f(*args, **kwargs)
        return decorated_function
    return decorator

@bp.route('/student/login', methods=['POST'])
def student_login():
    """Student login with NIM only"""
    try:
        data = request.get_json()
        
        # Validate input
        login_data = StudentLogin(**data)
        NIMValidator(nim=login_data.nim)
        
        # Authenticate student
        student = authenticate_student(login_data.nim)
        
        # Generate JWT token
        token = generate_jwt_token(student['nim'], 'student')
        
        return jsonify({
            'success': True,
            'student': {
                'nim': student['nim'],
                'name': student['name']
            },
            'token': token
        }), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/lecturer/login', methods=['POST'])
def lecturer_login():
    """Lecturer login with email and password"""
    try:
        data = request.get_json()
        
        # Validate input
        login_data = UserLogin(**data)
        EmailValidator(email=login_data.email)
        
        # Authenticate lecturer
        user = authenticate_lecturer(login_data.email, login_data.password)
        
        # Generate JWT token
        token = generate_jwt_token(user['email'], 'lecturer')
        
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'email': user['email']
            },
            'token': token
        }), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 401
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/lecturer/register', methods=['POST'])
def lecturer_register():
    """Register a new lecturer (admin only for initial setup)"""
    try:
        data = request.get_json()
        
        # Validate input
        user_data = UserCreate(**data)
        EmailValidator(email=user_data.email)
        PasswordValidator(password=user_data.password)
        
        # Create lecturer
        user = create_lecturer(user_data.email, user_data.password)
        
        return jsonify({
            'success': True,
            'user': {
                'id': user['id'],
                'email': user['email']
            }
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
    except ValueError as e:
        return jsonify({'error': str(e)}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@bp.route('/students/upload-roster', methods=['POST'])
@require_auth('lecturer')
def upload_roster():
    """Upload student roster (bulk create students)"""
    try:
        data = request.get_json()
        
        # Validate input
        roster_data = StudentBulkCreate(**data)
        
        supabase = get_supabase_admin()
        
        # Prepare students for bulk insert
        students_to_insert = [
            {'nim': student.nim, 'name': student.name}
            for student in roster_data.students
        ]
        
        # Bulk insert (upsert to handle duplicates)
        result = supabase.table('students').upsert(students_to_insert).execute()
        
        return jsonify({
            'success': True,
            'count': len(result.data),
            'message': f'Successfully uploaded {len(result.data)} students'
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Invalid input', 'details': e.errors()}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500
