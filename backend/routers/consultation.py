import os
import uuid
from dotenv import load_dotenv
from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.orm import Session
from supabase import create_client

from database import get_db
from models.consultation import Consultation
from utils.auth_utils import get_current_user
from schemas.consultation import ConsultationOut  # <-- use schema

load_dotenv()

router = APIRouter(prefix="/consultations", tags=["Consultations"])

SUPABASE_URL = os.getenv("SUPABASE_URL")
SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
BUCKET = os.getenv("SUPABASE_BUCKET", "consultation_images")

if not SUPABASE_URL or not SERVICE_KEY:
    raise RuntimeError("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env")

supabase_admin = create_client(SUPABASE_URL, SERVICE_KEY)

@router.post("/", response_model=ConsultationOut)
def create_consultation(
    age: int | None = Form(None),
    gender: str | None= Form(None),
    symptoms: str  = Form(...),
    medical_history: str | None = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # 1) Create DB row
    consultation = Consultation(
        user_id=current_user["id"],
        age=age,
        gender=gender,
        symptoms=symptoms,
        medical_history=medical_history,
        status="PENDING",
    )
    db.add(consultation)
    db.commit()
    db.refresh(consultation)

    # 2) Upload image to Supabase Storage
    try:
        ext = (image.filename.split(".")[-1] if image.filename and "." in image.filename else "jpg").lower()
        file_name = f"{uuid.uuid4()}.{ext}"
        storage_path = f"{current_user['id']}/{consultation.id}/{file_name}"

        file_bytes = image.file.read()
        if not file_bytes:
            raise HTTPException(status_code=400, detail="Empty image file")

        supabase_admin.storage.from_(BUCKET).upload(
            path=storage_path,
            file=file_bytes,
            file_options={
                "content-type": image.content_type or "application/octet-stream",
            },
        )
    except Exception as e:
        db.delete(consultation)
        db.commit()
        raise HTTPException(status_code=500, detail=f"Image upload failed: {str(e)}")

    # 3) Save bucket/path in DB
    consultation.image_bucket = BUCKET
    consultation.image_path = storage_path
    db.commit()
    db.refresh(consultation)

    # 4) Signed URL (1 hour)
    signed = supabase_admin.storage.from_(BUCKET).create_signed_url(storage_path, 60 * 60)
    image_url = signed.get("signedURL") or signed.get("signed_url")

    # 5) ML inference (LAZY IMPORT HERE ✅)
    confidence = None
    try:
        from ml_models.predict import predict_disease  # <-- moved here

        pred_idx, pred_label, confidence = predict_disease(file_bytes)
        consultation.diagnosis = pred_label
        consultation.status = "COMPLETED"
        db.commit()
        db.refresh(consultation)
    except Exception as e:
        consultation.status = "FAILED"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Model inference failed: {str(e)}")

    return {
        "id": consultation.id,
        "user_id": consultation.user_id,
        "age": consultation.age,
        "gender": consultation.gender,
        "symptoms": consultation.symptoms,
        "medical_history": consultation.medical_history,
        "image_bucket": consultation.image_bucket,
        "image_path": consultation.image_path,
        "image_url": image_url,
        "diagnosis": consultation.diagnosis,
        "confidence": confidence,
        "status": consultation.status,
        "created_at": consultation.created_at,
    }
