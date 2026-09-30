from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import (
    User, TraineeProfile, JobRole, Competency, Course,
    Enrollment, Assessment, AssessmentAttempt, Certificate, Notification
)
from app.services.auth_service import get_current_user, require_role
from app.services.competency_service import get_user_skill_gaps, get_personalized_recommendations

router = APIRouter(prefix="/trainee", tags=["Trainee"])

@router.get("/dashboard")
def get_trainee_dashboard(
    current_user: User = Depends(require_role(["trainee", "admin"])),
    db: Session = Depends(get_db)
):
    user_id = current_user.id
    gaps_data = get_user_skill_gaps(db, user_id)
    recommendations = get_personalized_recommendations(db, user_id)

    # Enrollments
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == user_id).all()
    courses_in_progress = sum(1 for e in enrollments if e.status == "in_progress")
    courses_completed = sum(1 for e in enrollments if e.status == "completed")

    # Certificates
    certificates = db.query(Certificate).filter(Certificate.user_id == user_id).all()

    # Recent attempts
    recent_attempts = (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.user_id == user_id)
        .order_by(AssessmentAttempt.submitted_at.desc())
        .limit(5)
        .all()
    )
    attempt_history = []
    for a in recent_attempts:
        assessment = a.assessment
        attempt_history.append({
            "id": a.id,
            "assessment_id": a.assessment_id,
            "assessment_title": assessment.title if assessment else "Assessment",
            "score_obtained": a.score_obtained,
            "total_score": a.total_score,
            "percentage": a.percentage,
            "passed": a.passed,
            "submitted_at": a.submitted_at
        })

    # Competencies status snapshot
    top_gaps = [c for c in gaps_data["competencies"] if c["gap"] > 0][:4]

    return {
        "user": {
            "id": current_user.id,
            "full_name": current_user.full_name,
            "designation": current_user.designation,
            "department": current_user.department,
            "job_role": gaps_data["job_role"]
        },
        "metrics": {
            "courses_in_progress": courses_in_progress,
            "courses_completed": courses_completed,
            "certificates_earned": len(certificates),
            "competencies_met": gaps_data["competencies_met"],
            "competencies_gapped": gaps_data["competencies_gapped"],
            "average_gap": gaps_data["average_gap"]
        },
        "top_skill_gaps": top_gaps,
        "recommendations": recommendations[:3],
        "recent_results": attempt_history
    }

@router.get("/competencies")
def get_trainee_competencies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_skill_gaps(db, current_user.id)

@router.get("/skill-gaps")
def get_trainee_skill_gaps(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_user_skill_gaps(db, current_user.id)

@router.get("/recommendations")
def get_trainee_recommendations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return get_personalized_recommendations(db, current_user.id)

@router.get("/my-learning")
def get_my_learning(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    enrollments = db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
    results = []
    for e in enrollments:
        c = e.course
        assessments = []
        for a in c.assessments:
            # Check latest attempt for this user
            attempt = db.query(AssessmentAttempt).filter(
                AssessmentAttempt.assessment_id == a.id,
                AssessmentAttempt.user_id == current_user.id
            ).order_by(AssessmentAttempt.submitted_at.desc()).first()

            assessments.append({
                "id": a.id,
                "title": a.title,
                "passing_score": a.passing_score,
                "time_limit_minutes": a.time_limit_minutes,
                "target_competency_level": a.target_competency_level,
                "completed": attempt.passed if attempt else False,
                "best_score": attempt.percentage if attempt else None
            })

        results.append({
            "enrollment_id": e.id,
            "course_id": c.id,
            "title": c.title,
            "slug": c.slug,
            "subject": c.subject,
            "difficulty": c.difficulty,
            "duration_hours": c.duration_hours,
            "progress_percent": e.progress_percent,
            "status": e.status,
            "enrolled_at": e.enrolled_at,
            "completed_at": e.completed_at,
            "trainer_name": c.trainer.full_name if c.trainer else "Senior Specialist",
            "assessments": assessments
        })
    return results

@router.get("/certificates")
def get_trainee_certificates(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    certs = db.query(Certificate).filter(Certificate.user_id == current_user.id).all()
    result = []
    for cert in certs:
        result.append({
            "id": cert.id,
            "certificate_code": cert.certificate_code,
            "title": cert.title,
            "course_id": cert.course_id,
            "course_title": cert.course.title if cert.course else "Meteorological Training Program",
            "user_name": current_user.full_name,
            "issued_at": cert.issued_at,
            "issuing_org": cert.issuing_org,
            "metadata_json": cert.metadata_json
        })
    return result

@router.get("/results")
def get_trainee_results(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    attempts = (
        db.query(AssessmentAttempt)
        .filter(AssessmentAttempt.user_id == current_user.id)
        .order_by(AssessmentAttempt.submitted_at.desc())
        .all()
    )
    result = []
    for a in attempts:
        result.append({
            "id": a.id,
            "assessment_id": a.assessment_id,
            "assessment_title": a.assessment.title if a.assessment else "Assessment",
            "course_title": a.assessment.course.title if a.assessment and a.assessment.course else None,
            "score_obtained": a.score_obtained,
            "total_score": a.total_score,
            "percentage": a.percentage,
            "passed": a.passed,
            "submitted_at": a.submitted_at
        })
    return result
