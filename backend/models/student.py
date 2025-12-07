from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Student(BaseModel):
    """Student model"""
    nim: str
    name: str
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class StudentLogin(BaseModel):
    """Model for student login"""
    nim: str

class StudentCreate(BaseModel):
    """Model for creating a new student"""
    nim: str
    name: str

class StudentBulkCreate(BaseModel):
    """Model for bulk student creation (roster upload)"""
    students: list[StudentCreate]

class StudentResponse(BaseModel):
    """Model for student response"""
    nim: str
    name: str
    created_at: datetime
    
    class Config:
        from_attributes = True
