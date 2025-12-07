from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Dataset(BaseModel):
    """Dataset model with enhanced metadata for meta-prompt architecture"""
    id: Optional[str] = None
    name: str
    url: str
    metadata_summary: Optional[str] = None
    columns_list: Optional[list[str]] = None  # List of column names
    sample_data: Optional[str] = None  # CSV format, first 5 rows
    data_quality_notes: Optional[str] = None  # Known data issues
    created_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class DatasetCreate(BaseModel):
    """Model for creating a new dataset"""
    name: str
    url: str
    metadata_summary: Optional[str] = None
    columns_list: Optional[list[str]] = None
    sample_data: Optional[str] = None
    data_quality_notes: Optional[str] = None

class DatasetResponse(BaseModel):
    """Model for dataset response"""
    id: str
    name: str
    url: str
    metadata_summary: Optional[str]
    columns_list: Optional[list[str]]
    sample_data: Optional[str]
    data_quality_notes: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

