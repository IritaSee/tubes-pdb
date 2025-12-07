from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class User(BaseModel):
    """Lecturer/Admin user model"""
    id: Optional[str] = None
    email: str
    password_hash: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    """Model for creating a new user"""
    email: str
    password: str

class UserLogin(BaseModel):
    """Model for user login"""
    email: str
    password: str

class UserResponse(BaseModel):
    """Model for user response (without password)"""
    id: str
    email: str
    created_at: datetime
    
    class Config:
        from_attributes = True
