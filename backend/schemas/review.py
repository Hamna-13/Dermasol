from pydantic import BaseModel, Field
from datetime import datetime
from uuid import UUID


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    condition_identification: bool
    products_recommended: bool
    experience: bool


class ReviewResponse(BaseModel):
    id: UUID
    user_id: UUID
    rating: int
    condition_identification: bool
    products_recommended: bool
    experience: bool
    created_at: datetime

    class Config:
        from_attributes = True