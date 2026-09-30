from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import User, Competency
from app.schemas.schemas import AIMCQGenerationRequest
from app.services.auth_service import require_role
from app.services.ai_service import AIService

router = APIRouter(prefix="/ai", tags=["AI Engine"])

@router.post("/generate-mcqs")
def generate_mcqs(
    req: AIMCQGenerationRequest,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db)
):
    topic = req.topic
    if req.competency_id:
        comp = db.query(Competency).filter(Competency.id == req.competency_id).first()
        if comp and not topic:
            topic = comp.name

    questions = AIService.generate_mcqs(
        topic=topic or "Atmospheric Science & Meteorological Analysis",
        content=req.content,
        num_questions=req.num_questions or 5,
        difficulty=req.difficulty or "intermediate"
    )

    return {
        "topic": topic,
        "questions_generated": len(questions),
        "source": "deterministic_meteorology_engine" if not current_user else "ai_assisted",
        "questions": questions
    }
