from sqlalchemy import Column, Integer, String, Text, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
from database import Base

class Consultation(Base):
    __tablename__ = "consultations"

    id = Column(Integer, primary_key=True, index=True)

    # Supabase auth user id (UUID)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)

    # ✅ new required fields
    age = Column(Integer, nullable=True)
    gender = Column(String(16), nullable=True)  # e.g. "male", "female", "other"

    # ✅ symptoms optional now
    symptoms = Column(Text, nullable=False)

    # ✅ medical history optional
    medical_history = Column(Text, nullable=True)

    # image storage pointers
    image_bucket = Column(String(128), nullable=True)
    image_path = Column(Text, nullable=True)

    # AI output
    diagnosis = Column(String(128), nullable=True)
    status = Column(String(32), nullable=False, default="PENDING")

    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
