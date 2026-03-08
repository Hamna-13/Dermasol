from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, Dict, List
from uuid import UUID


class ConsultationHistoryItem(BaseModel):
    id: UUID
    created_at: datetime

    context_type: Optional[str] = None
    cv_label: Optional[str] = None
    disease_confidence: Optional[float] = None
    skin_type: Optional[str] = None

    image_url: Optional[str] = None

    class Config:
        from_attributes = True


class ConsultationDetail(BaseModel):
    id: UUID
    user_id: UUID
    created_at: datetime

    age: Optional[int] = None
    gender: Optional[str] = None
    symptoms: Optional[str] = None
    medical_history: Optional[str] = None

    image_bucket: Optional[str] = None
    image_path: Optional[str] = None
    image_url: Optional[str] = None  # ✅ add

    context_type: Optional[str] = None
    final_condition: Optional[str] = None

    cv_result: Optional[Dict[str, Any]] = None
    nlp_result: Optional[Dict[str, Any]] = None
    decision_context: Optional[Dict[str, Any]] = None
    rag_context_used: Optional[Any] = None
    llm_output: Optional[Dict[str, Any]] = None
    final_response: Optional[Dict[str, Any]] = None
    recommended_products: Optional[List[Dict[str, Any]]] = None
    status: str
    error: Optional[str] = None

    class Config:
        from_attributes = True