import os
import datetime
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from app.config import settings
from app.database import engine, Base, get_db
from app.seed import seed_database
from app.routers import (
    auth, users, trainees, trainers, courses, competencies,
    assessments, ai, training_requirements, notifications, analytics
)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Ensure upload directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=(
        "CAPACITY CONNECT - Digital Capacity Building and Competency Management Portal "
        "for the Ministry of Earth Sciences & India Meteorological Department (IMD). "
        "Connecting People, Competencies and Learning."
    ),
    version=settings.VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
    @app.get("/")
def home():
    return {"message": "CAPACITY CONNECT API is running"}
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploaded files directory
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Startup Event: Auto-seed initial demo dataset
@app.on_event("startup")
def on_startup():
    db = next(get_db())
    try:
        seed_database(db)
    except Exception as e:
        print(f"Startup seed notice: {e}")
    finally:
        db.close()

# Health Check Endpoint
@app.get("/health", tags=["System"])
def health_check(db: Session = Depends(get_db)):
    try:
        # Verify db connectivity
        db.execute(Base.metadata.tables["users"].select().limit(1))
        db_status = "connected"
    except Exception as e:
        db_status = f"degraded: {str(e)}"

    return {
        "status": "healthy",
        "platform": "CAPACITY CONNECT",
        "agency": "Ministry of Earth Sciences | India Meteorological Department",
        "database": db_status,
        "version": settings.VERSION,
        "timestamp": datetime.datetime.utcnow().isoformat()
    }

# Register Routers under /api
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(users.router, prefix=api_prefix)
app.include_router(trainees.router, prefix=api_prefix)
app.include_router(trainers.router, prefix=api_prefix)
app.include_router(courses.router, prefix=api_prefix)
app.include_router(competencies.router, prefix=api_prefix)
app.include_router(assessments.router, prefix=api_prefix)
app.include_router(ai.router, prefix=api_prefix)
app.include_router(training_requirements.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(analytics.router, prefix=api_prefix)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)
