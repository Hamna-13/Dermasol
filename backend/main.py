import os
from fastapi import FastAPI, Depends
from sqlalchemy import text
from database import get_db
from routers import auth, user
# from routers import consultation
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
import uvicorn
import sys

# 👇 Add these debug lines
print(f"🔍 Current working directory: {os.getcwd()}")
print(f"🔍 PORT environment variable: {os.environ.get('PORT')}")
print(f"🔍 Python executable: {sys.executable}")
print("🔍 Checking if we can write to filesystem...")
try:
    with open('test.txt', 'w') as f:
        f.write('test')
    print("✅ Filesystem is writable")
    os.remove('test.txt')
except Exception as e:
    print(f"❌ Filesystem error: {e}")
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8001",      # your vite runs on 8001 sometimes
        "http://127.0.0.1:8001",
        "https://dermasol-git-main-hamna-13s-projects.vercel.app",
        "https://dermasol-dokr42jz4-hamna-13s-projects.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# include routers
app.include_router(auth.router)
app.include_router(user.router)
app.include_router(consultation.router)
@app.get("/")
def root():
    return {"message": "FastAPI is running"}

@app.get("/ping")
def ping():
    return {"ok": True, "message": "backend connected"}

@app.get("/test-db")
def test_db(db = Depends(get_db)):
    result = db.execute(text("SELECT version();"))
    return {"db_version": result.fetchone()}


# ==============================
# 🚀 FIX OPENAPI FOR HTTPBEARER
# ==============================

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Dermasol API",
        version="1.0.0",
        description="Skin Diagnosis Backend API",
        routes=app.routes,
    )

    # ✅ Correct HTTP Bearer scheme for Swagger UI
    openapi_schema["components"]["securitySchemes"] = {
        "HTTPBearer": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
# Add this at the VERY BOTTOM of your main.py file
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    print(f"🚀 Starting server on port {port}")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)