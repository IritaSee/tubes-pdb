from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class Submission(BaseModel):
    """Submission model"""
    id: Optional[str] = None
    assignment_id: str
    link_url: str
    submission_type: Literal['progress', 'final']
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SubmissionCreate(BaseModel):
    """Model for creating a submission"""
    assignment_id: str
    link_url: str
    submission_type: Literal['progress', 'final']

class SubmissionResponse(BaseModel):
    """Model for submission response"""
    id: str
    assignment_id: str
    link_url: str
    submission_type: Literal['progress', 'final']
    created_at: datetime
    
    class Config:
        from_attributes = True
