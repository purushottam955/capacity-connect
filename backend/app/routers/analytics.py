from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database import get_db
from app.models.entities import (
    User, Course, Enrollment, Assessment, AssessmentAttempt,
    Certificate, TrainingRequirement, Competency, UserCompetency, RoleCompetency
)
from app.services.auth_service import require_role

router = APIRouter(prefix="/analytics", tags=["Organizational Analytics"])

@router.get("/overview")
def get_org_overview(
    current_user: User = Depends(require_role(["admin", "trainer"])),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_trainees = db.query(User).filter(User.role == "trainee").count()
    total_trainers = db.query(User).filter(User.role == "trainer").count()
    total_courses = db.query(Course).count()
    total_enrollments = db.query(Enrollment).count()
    
    completed_enrollments = db.query(Enrollment).filter(Enrollment.status == "completed").count()
    completion_rate = round((completed_enrollments / total_enrollments * 100), 1) if total_enrollments > 0 else 0.0

    total_assessments_taken = db.query(AssessmentAttempt).count()
    passed_attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.passed == True).count()
    pass_rate = round((passed_attempts / total_assessments_taken * 100), 1) if total_assessments_taken > 0 else 0.0

    certificates_issued = db.query(Certificate).count()
    open_reqs = db.query(TrainingRequirement).filter(TrainingRequirement.status == "open").count()
    assigned_reqs = db.query(TrainingRequirement).filter(TrainingRequirement.status == "assigned").count()

    return {
        "kpis": {
            "total_users": total_users,
            "total_trainees": total_trainees,
            "total_trainers": total_trainers,
            "total_courses": total_courses,
            "total_enrollments": total_enrollments,
            "completion_rate": completion_rate,
            "assessments_taken": total_assessments_taken,
            "pass_rate": pass_rate,
            "certificates_issued": certificates_issued,
            "open_training_requirements": open_reqs,
            "assigned_training_requirements": assigned_reqs
        }
    }

@router.get("/competencies")
def get_competency_analytics(
    current_user: User = Depends(require_role(["admin", "trainer"])),
    db: Session = Depends(get_db)
):
    competencies = db.query(Competency).all()
    total_trainees = max(1, db.query(User).filter(User.role == "trainee").count())

    results = []
    for comp in competencies:
        # User competencies for this comp
        user_comps = db.query(UserCompetency).filter(UserCompetency.competency_id == comp.id).all()
        avg_level = (sum(uc.current_level for uc in user_comps) / len(user_comps)) if user_comps else 2.0

        # Required level from role competencies
        rcs = db.query(RoleCompetency).filter(RoleCompetency.competency_id == comp.id).all()
        benchmark = (sum(rc.required_level for rc in rcs) / len(rcs)) if rcs else 3.5

        gap = max(0.0, round(benchmark - avg_level, 2))
        trainees_gapped = sum(1 for uc in user_comps if uc.current_level < benchmark)

        results.append({
            "competency_id": comp.id,
            "name": comp.name,
            "code": comp.code,
            "category": comp.category,
            "average_current_level": round(avg_level, 2),
            "benchmark_required_level": round(benchmark, 2),
            "gap": gap,
            "trainees_gapped_count": trainees_gapped,
            "gap_percentage": round((trainees_gapped / total_trainees * 100), 1)
        })

    # Sort by gap descending (highest organizational priority first)
    results.sort(key=lambda x: x["gap"], reverse=True)
    return results

@router.get("/training-demand")
def get_training_demand(
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    reqs = db.query(TrainingRequirement).all()
    by_department = {}
    for r in reqs:
        by_department[r.department] = by_department.get(r.department, 0) + 1

    chart_data = [{"department": dept, "requirements_count": count} for dept, count in by_department.items()]
    return chart_data
