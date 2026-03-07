import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from utils.auth_utils import get_current_user
from models.profile import Profile
from schemas.user import ProfileOut, ProfileUpdate
from models.consultation import Consultation
from utils.storage_utils import delete_storage_object 
from utils.auth_admin import delete_auth_user

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me", response_model=ProfileOut)
def get_me(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_uuid = uuid.UUID(current_user["id"])
    row = db.query(Profile).filter(Profile.id == user_uuid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")
    return row

@router.patch("/me", response_model=ProfileOut)
def update_me(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_uuid = uuid.UUID(current_user["id"])
    row = db.query(Profile).filter(Profile.id == user_uuid).first()
    if not row:
        raise HTTPException(status_code=404, detail="Profile not found")

    if payload.full_name is not None:
        row.full_name = payload.full_name.strip() if payload.full_name else None

    # OPTIONAL: allow email update in your profiles table (does NOT change auth email)
    if payload.email is not None:
        row.email = payload.email.lower().strip()

    db.commit()
    db.refresh(row)
    return row

 # you will add this helper

@router.delete("/me")
def delete_me(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    user_uuid = uuid.UUID(current_user["id"])

    # 1) fetch consultations to delete storage images
    consultations = (
        db.query(Consultation)
        .filter(Consultation.user_id == user_uuid)
        .all()
    )

    # 2) delete images from storage (best-effort)
    for c in consultations:
        if c.image_bucket and c.image_path:
            try:
                delete_storage_object(c.image_bucket, c.image_path)
            except Exception:
                pass  # don't block account deletion on storage cleanup

    # 3) delete consultations
    db.query(Consultation).filter(Consultation.user_id == user_uuid).delete(synchronize_session=False)

    # 4) delete profile
    deleted = db.query(Profile).filter(Profile.id == user_uuid).delete(synchronize_session=False)
    db.commit()

    if deleted == 0:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    try:
        delete_auth_user(current_user["id"])
    except Exception as e:
        return {"ok": True, "message": "User data deleted, but auth deletion failed.", "error": str(e)}
    
    return {"ok": True, "message": "User data deleted (profile + consultations)."}