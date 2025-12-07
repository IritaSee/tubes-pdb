from pydantic import BaseModel, validator
import re

class NIMValidator(BaseModel):
    """Validator for student NIM"""
    nim: str
    
    @validator('nim')
    def validate_nim(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('NIM cannot be empty')
        if len(v) > 50:
            raise ValueError('NIM too long (max 50 characters)')
        return v.strip()

class EmailValidator(BaseModel):
    """Validator for email addresses"""
    email: str
    
    @validator('email')
    def validate_email(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('Email cannot be empty')
        
        # Basic email regex
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, v):
            raise ValueError('Invalid email format')
        
        return v.strip().lower()

class URLValidator(BaseModel):
    """Validator for URLs"""
    url: str
    
    @validator('url')
    def validate_url(cls, v):
        if not v or len(v.strip()) == 0:
            raise ValueError('URL cannot be empty')
        
        # Basic URL validation
        if not v.startswith(('http://', 'https://')):
            raise ValueError('URL must start with http:// or https://')
        
        return v.strip()

class PasswordValidator(BaseModel):
    """Validator for passwords"""
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        if not v or len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if len(v) > 128:
            raise ValueError('Password too long (max 128 characters)')
        return v

def validate_score(score: int) -> int:
    """Validate grade score (0-100)"""
    if not isinstance(score, int):
        raise ValueError('Score must be an integer')
    if score < 0 or score > 100:
        raise ValueError('Score must be between 0 and 100')
    return score
