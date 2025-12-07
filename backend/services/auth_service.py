import bcrypt
import jwt
from datetime import datetime, timedelta
from backend.config import get_config
from backend.utils.db import get_supabase_admin

config = get_config()

def hash_password(password: str) -> str:
    """Hash a password using bcrypt"""
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))

def generate_jwt_token(user_id: str, user_type: str) -> str:
    """
    Generate JWT token for authentication
    
    Args:
        user_id: User ID (email for lecturers, NIM for students)
        user_type: 'lecturer' or 'student'
    
    Returns:
        JWT token string
    """
    payload = {
        'user_id': user_id,
        'user_type': user_type,
        'exp': datetime.utcnow() + timedelta(hours=config.JWT_EXPIRATION_HOURS),
        'iat': datetime.utcnow()
    }
    
    token = jwt.encode(payload, config.JWT_SECRET, algorithm=config.JWT_ALGORITHM)
    return token

def decode_jwt_token(token: str) -> dict:
    """
    Decode and verify JWT token
    
    Args:
        token: JWT token string
    
    Returns:
        Decoded payload dict
    
    Raises:
        jwt.ExpiredSignatureError: If token is expired
        jwt.InvalidTokenError: If token is invalid
    """
    try:
        payload = jwt.decode(token, config.JWT_SECRET, algorithms=[config.JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")

def create_lecturer(email: str, password: str) -> dict:
    """
    Create a new lecturer account
    
    Args:
        email: Lecturer email
        password: Plain text password
    
    Returns:
        Created user dict
    """
    supabase = get_supabase_admin()
    
    # Hash password
    password_hash = hash_password(password)
    
    # Insert into database
    result = supabase.table('users').insert({
        'email': email,
        'password_hash': password_hash
    }).execute()
    
    if result.data:
        return result.data[0]
    else:
        raise ValueError("Failed to create user")

def authenticate_lecturer(email: str, password: str) -> dict:
    """
    Authenticate a lecturer
    
    Args:
        email: Lecturer email
        password: Plain text password
    
    Returns:
        User dict if authentication successful
    
    Raises:
        ValueError: If authentication fails
    """
    supabase = get_supabase_admin()
    
    # Get user from database
    result = supabase.table('users').select('*').eq('email', email).execute()
    
    if not result.data:
        raise ValueError("Invalid email or password")
    
    user = result.data[0]
    
    # Verify password
    if not verify_password(password, user['password_hash']):
        raise ValueError("Invalid email or password")
    
    return user

def authenticate_student(nim: str) -> dict:
    """
    Authenticate a student (NIM-only login)
    
    Args:
        nim: Student NIM
    
    Returns:
        Student dict if exists
    
    Raises:
        ValueError: If student not found
    """
    supabase = get_supabase_admin()
    
    # Get student from database
    result = supabase.table('students').select('*').eq('nim', nim).execute()
    
    if not result.data:
        raise ValueError("Student not found. Please contact your lecturer.")
    
    return result.data[0]
