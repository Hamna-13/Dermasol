from fastapi import FastAPI, Depends
from sqlalchemy import text
from database import get_db

app = FastAPI()

@app.get("/")
def root():
    return {"message": "FastAPI is running"}

@app.get("/test-db")
def test_db(db = Depends(get_db)):
    result = db.execute(text("SELECT version();"))
    return {"db_version": result.fetchone()}
