from fastapi import APIRouter, Depends
from utils.auth_utils import get_current_user

router = APIRouter(prefix="/user", tags=["User"])

@router.get("/me")
def get_my_profile(current_user = Depends(get_current_user)):
    # current_user will be Supabase user object/dict
    return {
        "id": current_user["id"],
        "email": current_user["email"],
    }
