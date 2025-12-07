from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class ChatMessage(BaseModel):
    """Chat message model"""
    id: Optional[str] = None
    assignment_id: str
    sender: Literal['student', 'ai']
    content: str
    timestamp: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ChatMessageCreate(BaseModel):
    """Model for creating a chat message"""
    content: str

class ChatMessageResponse(BaseModel):
    """Model for chat message response"""
    id: str
    assignment_id: str
    sender: Literal['student', 'ai']
    content: str
    timestamp: datetime
    
    class Config:
        from_attributes = True

class ChatResponse(BaseModel):
    """Model for AI chat response"""
    response: str
    timestamp: datetime
