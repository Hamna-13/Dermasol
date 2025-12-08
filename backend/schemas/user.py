from pydantic import BaseModel, EmailStr

# ---------- Request Schema ----------
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str | None = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


# ---------- Response Schema ----------
class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str | None

    class Config:
        from_attributes = True   # important for SQLAlchemy
