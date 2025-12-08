from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
from uuid import UUID

class ConsultationOut(BaseModel):
    id: int
    user_id: UUID

    age: Optional[int] = Field(..., ge=0, le=120)
    gender: Optional[str]

    symptoms: str = None
    medical_history: Optional[str] = None

    image_bucket: Optional[str] = None
    image_path: Optional[str] = None
    image_url: Optional[str] = None  # signed URL returned by API

    diagnosis: Optional[str] = None
    confidence: Optional[float] = None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
