from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Grade(BaseModel):
    """Grade model"""
    assignment_id: str
    score: Optional[int] = None
    feedback: Optional[str] = None
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class GradeCreate(BaseModel):
    """Model for creating/updating a grade"""
    assignment_id: str
    score: int
    feedback: Optional[str] = None

class GradeResponse(BaseModel):
    """Model for grade response"""
    assignment_id: str
    score: int
    feedback: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True
