from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
import os
from supabase import create_client

router = APIRouter(prefix="/auth", tags=["Auth"])

supabase = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_ANON_KEY"))

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@router.post("/signup")
def signup(body: UserCreate):
    try:
        res = supabase.auth.sign_up({"email": body.email, "password": body.password})
        return {
            "user": res.user,
            "session": res.session,   # may be None if email confirmation is ON
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login")
def login(body: UserLogin):
    try:
        res = supabase.auth.sign_in_with_password({"email": body.email, "password": body.password})
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "user": res.user,
            "token_type": "bearer",
        }
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid email/password")
