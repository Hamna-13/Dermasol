import uuid
from sqlalchemy import Column, String, Text, DateTime, func, Integer, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base


class Consultation(Base):
    __tablename__ = "consultations"

    # ✅ UUID PK (recommended)
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    age = Column(Integer, nullable=True)
    gender = Column(String(16), nullable=True)
    symptoms = Column(Text, nullable=True)
    medical_history = Column(Text, nullable=True)

    image_bucket = Column(String(128), nullable=True)
    image_path = Column(Text, nullable=True)

    context_type = Column(String(16), nullable=True)      # "medical" | "skincare"
    final_condition = Column(String(128), nullable=True)

    cv_label = Column(String(128), nullable=True)
    disease_confidence = Column(Float, nullable=True)
    skin_type = Column(String(32), nullable=True)
    skin_type_confidence = Column(Float, nullable=True)

    cv_result = Column(JSONB, nullable=True)
    nlp_result = Column(JSONB, nullable=True)
    decision_context = Column(JSONB, nullable=True)
    rag_context_used = Column(JSONB, nullable=True)
    llm_output = Column(JSONB, nullable=True)
    final_response = Column(JSONB, nullable=True)

    status = Column(String(32), nullable=False, default="COMPLETED")
    error = Column(Text, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)