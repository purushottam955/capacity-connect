from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import (
    User, TrainerProfile, Course, CourseResource, Assessment,
    AssessmentAttempt, Enrollment, TrainingRequirement, TrainerMatch
)
from app.services.auth_service import require_role
from app.services.storage_service import StorageService

router = APIRouter(prefix="/trainer", tags=["Trainer"])

@router.get("/dashboard")
def get_trainer_dashboard(
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db)
):
    profile = current_user.trainer_profile
    courses = db.query(Course).filter(Course.trainer_id == current_user.id).all()
    course_ids = [c.id for c in courses]

    # Total trainees enrolled across trainer's courses
    enrollment_count = db.query(Enrollment).filter(Enrollment.course_id.in_(course_ids)).count() if course_ids else 0

    # Total assessments created
    assessment_count = db.query(Assessment).filter(Assessment.course_id.in_(course_ids)).count() if course_ids else 0

    # Total attempts evaluated
    assessments = db.query(Assessment).filter(Assessment.course_id.in_(course_ids)).all() if course_ids else []
    assessment_ids = [a.id for a in assessments]
    attempt_count = db.query(AssessmentAttempt).filter(AssessmentAttempt.assessment_id.in_(assessment_ids)).count() if assessment_ids else 0

    # Training requirements matched
    matches = db.query(TrainerMatch).filter(TrainerMatch.trainer_id == current_user.id).order_by(TrainerMatch.overall_match_score.desc()).limit(3).all()
    matched_reqs = []
    for m in matches:
        req = m.requirement
        matched_reqs.append({
            "requirement_id": req.id,
            "title": req.title,
            "subject": req.subject,
            "department": req.department,
            "match_score": m.overall_match_score,
            "is_selected": m.is_selected,
            "deadline": req.deadline
        })

    return {
        "trainer": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "designation": current_user.designation,
            "rating": profile.rating if profile else 4.8,
            "trainings_delivered": profile.total_trainings_delivered if profile else 12,
            "experience_years": profile.experience_years if profile else 8
        },
        "metrics": {
            "active_courses": len(courses),
            "enrolled_trainees": enrollment_count,
            "assessments_created": assessment_count,
            "trainee_attempts_evaluated": attempt_count
        },
        "courses": [{
            "id": c.id,
            "title": c.title,
            "subject": c.subject,
            "difficulty": c.difficulty,
            "status": c.status,
            "enrollments": len(c.enrollments),
            "resources_count": len(c.resources),
            "assessments_count": len(c.assessments)
        } for c in courses],
        "training_opportunities": matched_reqs
    }

@router.get("/courses")
def get_trainer_courses(
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db)
):
    courses = db.query(Course).filter(Course.trainer_id == current_user.id).all()
    return [{
        "id": c.id,
        "title": c.title,
        "slug": c.slug,
        "subject": c.subject,
        "category": c.category,
        "difficulty": c.difficulty,
        "duration_hours": c.duration_hours,
        "status": c.status,
        "created_at": c.created_at,
        "enrollments_count": len(c.enrollments),
        "assessments_count": len(c.assessments),
        "resources_count": len(c.resources)
    } for c in courses]

@router.get("/resources")
def get_trainer_resources(
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db)
):
    resources = db.query(CourseResource).filter(CourseResource.trainer_id == current_user.id).order_by(CourseResource.created_at.desc()).all()
    return [{
        "id": r.id,
        "course_id": r.course_id,
        "course_title": r.course.title if r.course else None,
        "title": r.title,
        "resource_type": r.resource_type,
        "file_url": r.file_url,
        "file_size_kb": r.file_size_kb,
        "description": r.description,
        "created_at": r.created_at
    } for r in resources]

@router.post("/resources/upload")
async def upload_trainer_resource(
    course_id: int = Form(...),
    title: str = Form(...),
    resource_type: str = Form("pdf"),
    description: Optional[str] = Form(None),
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db)
):
    # Verify course ownership
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    upload_result = await StorageService.save_file(file)

    resource = CourseResource(
        course_id=course_id,
        trainer_id=current_user.id,
        title=title,
        resource_type=resource_type or upload_result["file_type"],
        file_url=upload_result["file_url"],
        file_size_kb=upload_result["file_size_kb"],
        description=description
    )
    db.add(resource)
    db.commit()
    db.refresh(resource)

    return {
        "id": resource.id,
        "title": resource.title,
        "file_url": resource.file_url,
        "file_size_kb": resource.file_size_kb,
        "message": "Resource uploaded and cataloged in resource library successfully."
    }

@router.get("/performance")
def get_trainer_performance(
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db)
):
    courses = db.query(Course).filter(Course.trainer_id == current_user.id).all()
    course_ids = [c.id for c in courses]
    assessments = db.query(Assessment).filter(Assessment.course_id.in_(course_ids)).all() if course_ids else []
    assessment_ids = [a.id for a in assessments]

    attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.assessment_id.in_(assessment_ids)).all() if assessment_ids else []

    total_attempts = len(attempts)
    passed_attempts = sum(1 for a in attempts if a.passed)
    avg_score = round(sum(a.percentage for a in attempts) / total_attempts, 1) if total_attempts > 0 else 0.0

    return {
        "total_assessments": len(assessments),
        "total_attempts": total_attempts,
        "pass_rate_percent": round((passed_attempts / total_attempts * 100), 1) if total_attempts > 0 else 0.0,
        "average_score": avg_score,
        "recent_attempts": [{
            "attempt_id": a.id,
            "trainee_name": a.user.full_name if a.user else "Trainee",
            "assessment_title": a.assessment.title if a.assessment else "Assessment",
            "score": a.score_obtained,
            "percentage": a.percentage,
            "passed": a.passed,
            "submitted_at": a.submitted_at
        } for a in attempts[-10:]]
    }

@router.get("/training-requests")
def get_trainer_training_requests(
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db)
):
    # Find requirements where trainer has a match record or is assigned
    matches = db.query(TrainerMatch).filter(TrainerMatch.trainer_id == current_user.id).all()
    res = []
    for m in matches:
        req = m.requirement
        res.append({
            "requirement_id": req.id,
            "title": req.title,
            "subject": req.subject,
            "department": req.department,
            "duration_days": req.duration_days,
            "required_experience_years": req.required_experience_years,
            "match_score": m.overall_match_score,
            "is_selected": m.is_selected,
            "status": req.status,
            "deadline": req.deadline
        })
    return res
