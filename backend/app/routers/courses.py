import re
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import (
    User, Course, CourseCompetency, CourseResource, Competency,
    Enrollment, CourseFeedback, Assessment
)
from app.schemas.schemas import CourseCreate, FeedbackCreate
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/courses", tags=["Courses"])

def slugify(text: str) -> str:
    text = text.lower()
    text = re.sub(r'[^a-z0-9]+', '-', text).strip('-')
    return text

@router.get("")
def list_courses(
    search: Optional[str] = None,
    category: Optional[str] = None,
    difficulty: Optional[str] = None,
    competency_id: Optional[int] = None,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Course).filter(Course.status == "published")
    if search:
        s = f"%{search.lower()}%"
        query = query.filter((Course.title.ilike(s)) | (Course.description.ilike(s)) | (Course.subject.ilike(s)))
    if category:
        query = query.filter(Course.category == category)
    if difficulty:
        query = query.filter(Course.difficulty == difficulty)

    courses = query.all()
    
    user_enrollments = {}
    if current_user:
        enrollments = db.query(Enrollment).filter(Enrollment.user_id == current_user.id).all()
        user_enrollments = {e.course_id: e for e in enrollments}

    results = []
    for c in courses:
        # Check competency mapping
        comps = []
        for cc in c.competency_mappings:
            comp = db.query(Competency).filter(Competency.id == cc.competency_id).first()
            if comp:
                comps.append({
                    "competency_id": comp.id,
                    "competency_name": comp.name,
                    "target_level": cc.target_level,
                    "expected_improvement": cc.expected_improvement
                })

        if competency_id and not any(comp["competency_id"] == competency_id for comp in comps):
            continue

        enr = user_enrollments.get(c.id)

        results.append({
            "id": c.id,
            "title": c.title,
            "slug": c.slug,
            "description": c.description,
            "trainer_id": c.trainer_id,
            "trainer_name": c.trainer.full_name if c.trainer else "Specialist",
            "subject": c.subject,
            "category": c.category,
            "difficulty": c.difficulty,
            "duration_hours": c.duration_hours,
            "objectives": c.objectives,
            "prerequisites": c.prerequisites,
            "status": c.status,
            "thumbnail_url": c.thumbnail_url,
            "created_at": c.created_at,
            "competencies": comps,
            "resources_count": len(c.resources),
            "assessments_count": len(c.assessments),
            "enrolled": enr is not None,
            "progress_percent": enr.progress_percent if enr else 0.0,
            "enrollment_status": enr.status if enr else None
        })

    return results

@router.get("/{course_id}")
def get_course_detail(
    course_id: int,
    current_user: Optional[User] = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    comps = []
    for cc in course.competency_mappings:
        comp = db.query(Competency).filter(Competency.id == cc.competency_id).first()
        if comp:
            comps.append({
                "competency_id": comp.id,
                "competency_name": comp.name,
                "target_level": cc.target_level,
                "expected_improvement": cc.expected_improvement
            })

    resources = [{
        "id": r.id,
        "title": r.title,
        "resource_type": r.resource_type,
        "file_url": r.file_url,
        "file_size_kb": r.file_size_kb,
        "description": r.description,
        "created_at": r.created_at
    } for r in course.resources]

    assessments = [{
        "id": a.id,
        "title": a.title,
        "description": a.description,
        "time_limit_minutes": a.time_limit_minutes,
        "passing_score": a.passing_score,
        "target_competency_level": a.target_competency_level,
        "question_count": len(a.questions)
    } for a in course.assessments if a.is_published]

    enr = None
    if current_user:
        enr = db.query(Enrollment).filter(
            Enrollment.user_id == current_user.id,
            Enrollment.course_id == course.id
        ).first()

    return {
        "id": course.id,
        "title": course.title,
        "slug": course.slug,
        "description": course.description,
        "trainer_id": course.trainer_id,
        "trainer_name": course.trainer.full_name if course.trainer else "Specialist",
        "trainer_designation": course.trainer.designation if course.trainer else "Meteorological Expert",
        "subject": course.subject,
        "category": course.category,
        "difficulty": course.difficulty,
        "duration_hours": course.duration_hours,
        "objectives": course.objectives,
        "prerequisites": course.prerequisites,
        "status": course.status,
        "thumbnail_url": course.thumbnail_url,
        "created_at": course.created_at,
        "competencies": comps,
        "resources": resources,
        "assessments": assessments,
        "enrolled": enr is not None,
        "progress_percent": enr.progress_percent if enr else 0.0,
        "enrollment_status": enr.status if enr else None
    }

@router.post("")
def create_course(
    req: CourseCreate,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db)
):
    base_slug = slugify(req.title)
    slug = base_slug
    idx = 1
    while db.query(Course).filter(Course.slug == slug).first():
        slug = f"{base_slug}-{idx}"
        idx += 1

    course = Course(
        title=req.title,
        slug=slug,
        description=req.description,
        trainer_id=current_user.id,
        subject=req.subject,
        category=req.category,
        difficulty=req.difficulty,
        duration_hours=req.duration_hours,
        objectives=req.objectives,
        prerequisites=req.prerequisites,
        status="published"
    )
    db.add(course)
    db.flush()

    for idx, comp_id in enumerate(req.competency_ids):
        target_lvl = req.target_levels[idx] if idx < len(req.target_levels) else 3
        cc = CourseCompetency(
            course_id=course.id,
            competency_id=comp_id,
            target_level=target_lvl,
            expected_improvement=1
        )
        db.add(cc)

    db.commit()
    db.refresh(course)
    return {"id": course.id, "slug": course.slug, "message": "Course created and published successfully"}

@router.post("/{course_id}/enroll")
def enroll_course(
    course_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.course_id == course_id
    ).first()

    if existing:
        return {"message": "Already enrolled in this course", "enrollment_id": existing.id}

    enrollment = Enrollment(
        user_id=current_user.id,
        course_id=course_id,
        progress_percent=15.0,  # Starting progress for materials opened
        status="in_progress"
    )
    db.add(enrollment)
    db.commit()
    return {"message": f"Successfully enrolled in '{course.title}'", "enrollment_id": enrollment.id}

@router.post("/{course_id}/feedback")
def submit_course_feedback(
    course_id: int,
    req: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fb = CourseFeedback(
        course_id=course_id,
        user_id=current_user.id,
        rating=req.rating,
        content_quality_rating=req.content_quality_rating,
        trainer_rating=req.trainer_rating,
        comments=req.comments
    )
    db.add(fb)
    db.commit()
    return {"message": "Feedback submitted successfully. Thank you for helping improve capacity building standards."}

@router.get("/{course_id}/feedback")
def get_course_feedback(
    course_id: int,
    db: Session = Depends(get_db)
):
    fbs = db.query(CourseFeedback).filter(CourseFeedback.course_id == course_id).all()
    return [{
        "id": f.id,
        "rating": f.rating,
        "user_name": f.user.full_name if f.user else "Anonymous Trainee",
        "comments": f.comments,
        "created_at": f.created_at
    } for f in fbs]
