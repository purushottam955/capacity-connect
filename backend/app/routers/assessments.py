import json
from typing import List, Optional, Dict
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import (
    User, Assessment, Question, AssessmentAttempt, Course, Competency
)
from app.schemas.schemas import (
    AssessmentCreate, AssessmentSubmitRequest, AssessmentResultResponse
)
from app.services.auth_service import get_current_user, require_role
from app.services.competency_service import evaluate_assessment_and_update_competency

router = APIRouter(prefix="/assessments", tags=["Assessments"])

@router.get("")
def list_assessments(
    course_id: Optional[int] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Assessment)
    if course_id:
        query = query.filter(Assessment.course_id == course_id)
    if current_user.role == "trainee":
        query = query.filter(Assessment.is_published == True)

    assessments = query.all()
    results = []
    for a in assessments:
        comp = a.course.competency_mappings[0].competency if (a.course and a.course.competency_mappings) else None
        
        # User attempt status
        attempt = db.query(AssessmentAttempt).filter(
            AssessmentAttempt.assessment_id == a.id,
            AssessmentAttempt.user_id == current_user.id
        ).order_by(AssessmentAttempt.submitted_at.desc()).first()

        results.append({
            "id": a.id,
            "course_id": a.course_id,
            "course_title": a.course.title if a.course else None,
            "competency_name": comp.name if comp else "Meteorological Core",
            "title": a.title,
            "description": a.description,
            "time_limit_minutes": a.time_limit_minutes,
            "passing_score": a.passing_score,
            "target_competency_level": a.target_competency_level,
            "question_count": len(a.questions),
            "is_published": a.is_published,
            "deadline": a.deadline,
            "best_score": attempt.percentage if attempt else None,
            "passed": attempt.passed if attempt else False
        })
    return results

@router.get("/{assessment_id}")
def get_assessment(
    assessment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    is_privileged = current_user.role in ["trainer", "admin"]
    comp = assessment.course.competency_mappings[0].competency if (assessment.course and assessment.course.competency_mappings) else None

    questions_data = []
    for q in assessment.questions:
        q_item = {
            "id": q.id,
            "question_text": q.question_text,
            "option_a": q.option_a,
            "option_b": q.option_b,
            "option_c": q.option_c,
            "option_d": q.option_d,
            "points": q.points,
            "difficulty": q.difficulty,
            "topic": q.topic
        }
        if is_privileged:
            q_item["correct_option"] = q.correct_option
            q_item["explanation"] = q.explanation
        questions_data.append(q_item)

    return {
        "id": assessment.id,
        "course_id": assessment.course_id,
        "course_title": assessment.course.title if assessment.course else None,
        "competency_name": comp.name if comp else "General Atmospheric Sciences",
        "title": assessment.title,
        "description": assessment.description,
        "time_limit_minutes": assessment.time_limit_minutes,
        "passing_score": assessment.passing_score,
        "target_competency_level": assessment.target_competency_level,
        "is_published": assessment.is_published,
        "deadline": assessment.deadline,
        "question_count": len(questions_data),
        "questions": questions_data
    }

@router.post("")
def create_assessment(
    req: AssessmentCreate,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db)
):
    course = db.query(Course).filter(Course.id == req.course_id).first()
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")

    assessment = Assessment(
        course_id=req.course_id,
        competency_id=req.competency_id or (course.competency_mappings[0].competency_id if course.competency_mappings else None),
        created_by=current_user.id,
        title=req.title,
        description=req.description,
        time_limit_minutes=req.time_limit_minutes,
        passing_score=req.passing_score,
        target_competency_level=req.target_competency_level,
        is_published=True,
        deadline=req.deadline
    )
    db.add(assessment)
    db.flush()

    for q in req.questions:
        question = Question(
            assessment_id=assessment.id,
            question_text=q.question_text,
            option_a=q.option_a,
            option_b=q.option_b,
            option_c=q.option_c,
            option_d=q.option_d,
            correct_option=q.correct_option.upper(),
            explanation=q.explanation,
            topic=q.topic,
            difficulty=q.difficulty,
            points=q.points
        )
        db.add(question)

    db.commit()
    db.refresh(assessment)
    return {"id": assessment.id, "title": assessment.title, "message": "Assessment created and published successfully"}

@router.post("/{assessment_id}/submit")
def submit_assessment(
    assessment_id: int,
    req: AssessmentSubmitRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    questions = assessment.questions
    if not questions:
        raise HTTPException(status_code=400, detail="This assessment has no questions configured.")

    total_possible_points = sum(q.points for q in questions)
    earned_points = 0
    detailed_answers = []

    for q in questions:
        # Convert key to int or str
        user_answer = req.answers.get(q.id) or req.answers.get(str(q.id))
        is_correct = (user_answer and user_answer.strip().upper() == q.correct_option.strip().upper())
        if is_correct:
            earned_points += q.points

        detailed_answers.append({
            "question_id": q.id,
            "question_text": q.question_text,
            "user_answer": user_answer,
            "correct_option": q.correct_option,
            "is_correct": is_correct,
            "explanation": q.explanation
        })

    percentage = round((earned_points / total_possible_points * 100), 1) if total_possible_points > 0 else 0.0
    passed = percentage >= assessment.passing_score

    # Save attempt
    attempt = AssessmentAttempt(
        assessment_id=assessment.id,
        user_id=current_user.id,
        score_obtained=float(earned_points),
        total_score=float(total_possible_points),
        percentage=percentage,
        passed=passed,
        answers_payload=json.dumps(req.answers)
    )
    db.add(attempt)
    db.commit()
    db.refresh(attempt)

    # Closed-loop competency update
    (
        competency_updated,
        competency_name,
        prev_level,
        new_level,
        cert_awarded,
        cert_code
    ) = evaluate_assessment_and_update_competency(
        db=db,
        user_id=current_user.id,
        assessment_id=assessment.id,
        score_obtained=float(earned_points),
        total_score=float(total_possible_points)
    )

    if passed:
        if competency_updated:
            feedback_msg = (
                f"Outstanding! You passed with {percentage}%. "
                f"Your verified competency in '{competency_name}' has been updated to Level {new_level}!"
            )
        else:
            feedback_msg = f"Passed successfully with {percentage}%. Competency proficiency requirements validated."
    else:
        feedback_msg = (
            f"You scored {percentage}%, which is below the required passing benchmark of {assessment.passing_score}%. "
            f"Review the explanations below and consult recommended study resources before retaking."
        )

    return {
        "attempt_id": attempt.id,
        "assessment_id": assessment.id,
        "assessment_title": assessment.title,
        "score_obtained": float(earned_points),
        "total_score": float(total_possible_points),
        "percentage": percentage,
        "passed": passed,
        "competency_updated": competency_updated,
        "competency_name": competency_name,
        "previous_level": prev_level,
        "new_level": new_level,
        "feedback_message": feedback_msg,
        "certificate_awarded": cert_awarded,
        "certificate_code": cert_code,
        "detailed_answers": detailed_answers
    }

@router.get("/{assessment_id}/results")
def get_assessment_results(
    assessment_id: int,
    current_user: User = Depends(require_role(["trainer", "admin"])),
    db: Session = Depends(get_db)
):
    attempts = db.query(AssessmentAttempt).filter(AssessmentAttempt.assessment_id == assessment_id).all()
    return [{
        "attempt_id": a.id,
        "trainee_id": a.user_id,
        "trainee_name": a.user.full_name if a.user else "Trainee",
        "email": a.user.email if a.user else None,
        "score_obtained": a.score_obtained,
        "total_score": a.total_score,
        "percentage": a.percentage,
        "passed": a.passed,
        "submitted_at": a.submitted_at
    } for a in attempts]
