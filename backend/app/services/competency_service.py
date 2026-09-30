import datetime
import uuid
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.entities import (
    User, TraineeProfile, JobRole, Competency, RoleCompetency,
    UserCompetency, Course, CourseCompetency, Enrollment,
    Assessment, Certificate, Notification
)

def get_user_skill_gaps(db: Session, user_id: int) -> Dict[str, Any]:
    """
    Computes explainable required vs current competency levels and gaps
    for a given trainee.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"competencies": [], "total_competencies": 0, "competencies_met": 0, "competencies_gapped": 0, "average_gap": 0.0}

    profile = db.query(TraineeProfile).filter(TraineeProfile.user_id == user_id).first()
    job_role = None
    if profile and profile.job_role_id:
        job_role = db.query(JobRole).filter(JobRole.id == profile.job_role_id).first()

    # Get all role competencies or default all competencies
    role_comps = {}
    if job_role:
        for rc in job_role.role_competencies:
            role_comps[rc.competency_id] = rc.required_level

    # If user has no job role assigned yet, fallback to baseline level 3 for common competencies
    all_competencies = db.query(Competency).all()

    # Get user's current assessed competencies
    user_comps = {uc.competency_id: uc for uc in user.user_competencies}

    competency_items = []
    total_gapped = 0
    total_met = 0
    total_gap_sum = 0

    for comp in all_competencies:
        required_level = role_comps.get(comp.id, 3)
        user_comp = user_comps.get(comp.id)
        current_level = user_comp.current_level if user_comp else 1
        gap = max(0, required_level - current_level)

        if gap == 0:
            status = "on_track"
            total_met += 1
        elif gap == 1:
            status = "needs_development"
            total_gapped += 1
            total_gap_sum += gap
        else:
            status = "critical_gap"
            total_gapped += 1
            total_gap_sum += gap

        competency_items.append({
            "id": user_comp.id if user_comp else 0,
            "competency_id": comp.id,
            "name": comp.name,
            "code": comp.code,
            "category": comp.category,
            "description": comp.description,
            "current_level": current_level,
            "required_level": required_level,
            "gap": gap,
            "status": status,
            "assessment_source": user_comp.assessment_source if user_comp else "Initial Baseline",
            "evidence": user_comp.evidence if user_comp else "Self-declared upon onboarding",
            "last_updated": user_comp.last_updated if user_comp else user.created_at
        })

    # Sort so biggest gaps appear first
    competency_items.sort(key=lambda x: (x["gap"], 5 - x["current_level"]), reverse=True)

    avg_gap = round(total_gap_sum / len(competency_items), 2) if competency_items else 0.0

    return {
        "trainee_id": user.id,
        "trainee_name": user.full_name,
        "job_role": job_role.title if job_role else "Meteorological Trainee",
        "competencies": competency_items,
        "total_competencies": len(competency_items),
        "competencies_met": total_met,
        "competencies_gapped": total_gapped,
        "average_gap": avg_gap
    }


def get_personalized_recommendations(db: Session, user_id: int) -> List[Dict[str, Any]]:
    """
    Generate explainable personalized course recommendations matching
    learner's skill gaps.
    """
    gaps_data = get_user_skill_gaps(db, user_id)
    gapped_comps = {c["competency_id"]: c for c in gaps_data["competencies"] if c["gap"] > 0}

    # Fetch user's enrollments to know progress/status
    enrollments = {e.course_id: e for e in db.query(Enrollment).filter(Enrollment.user_id == user_id).all()}

    courses = db.query(Course).filter(Course.status == "published").all()
    recommendations = []

    for course in courses:
        enrollment = enrollments.get(course.id)
        is_completed = enrollment and enrollment.status == "completed"
        if is_completed:
            continue  # Don't recommend already completed courses

        # Check matching competencies
        matched_comp_item = None
        best_gap = -1

        for cc in course.competency_mappings:
            if cc.competency_id in gapped_comps:
                comp_info = gapped_comps[cc.competency_id]
                if comp_info["gap"] > best_gap:
                    best_gap = comp_info["gap"]
                    matched_comp_item = comp_info

        # If course addresses a gap or is a foundational course
        if matched_comp_item:
            reason = (
                f"Recommended because your '{matched_comp_item['name']}' competency is Level {matched_comp_item['current_level']}, "
                f"while your role '{gaps_data['job_role']}' requires Level {matched_comp_item['required_level']} (Skill Gap: -{matched_comp_item['gap']})."
            )
            priority = best_gap * 10
            primary_comp_id = matched_comp_item["competency_id"]
            primary_comp_name = matched_comp_item["name"]
            curr_lvl = matched_comp_item["current_level"]
            req_lvl = matched_comp_item["required_level"]
            gap_val = matched_comp_item["gap"]
        elif course.competency_mappings:
            # Course has competency but no active gap: recommend for proficiency reinforcement
            primary_cc = course.competency_mappings[0]
            comp_obj = db.query(Competency).filter(Competency.id == primary_cc.competency_id).first()
            primary_comp_id = comp_obj.id if comp_obj else 0
            primary_comp_name = comp_obj.name if comp_obj else "Specialized Meteorology"
            curr_lvl = 3
            req_lvl = 3
            gap_val = 0
            reason = f"Broadens foundational proficiency in {primary_comp_name} for institutional readiness."
            priority = 1
        else:
            continue

        recommendations.append({
            "course_id": course.id,
            "course_title": course.title,
            "course_slug": course.slug,
            "subject": course.subject,
            "difficulty": course.difficulty,
            "duration_hours": course.duration_hours,
            "trainer_name": course.trainer.full_name if course.trainer else "Senior Specialist",
            "primary_competency_id": primary_comp_id,
            "primary_competency_name": primary_comp_name,
            "current_level": curr_lvl,
            "required_level": req_lvl,
            "gap": gap_val,
            "expected_improvement": 1,
            "recommendation_reason": reason,
            "enrolled": enrollment is not None,
            "progress_percent": enrollment.progress_percent if enrollment else 0.0,
            "_priority": priority
        })

    # Sort by priority descending (largest gaps first)
    recommendations.sort(key=lambda x: x["_priority"], reverse=True)
    return recommendations


def evaluate_assessment_and_update_competency(
    db: Session,
    user_id: int,
    assessment_id: int,
    score_obtained: float,
    total_score: float
) -> Tuple[bool, Optional[str], Optional[int], Optional[int], bool, Optional[str]]:
    """
    Closed-loop competency engine:
    1. Evaluates passing criteria
    2. Updates trainee's competency level in the database
    3. Updates enrollment progress
    4. Auto-issues verifiable Certificate if passed
    5. Dispatches real-time notification
    """
    percentage = (score_obtained / total_score * 100) if total_score > 0 else 0.0
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        return False, None, None, None, False, None

    passed = percentage >= assessment.passing_score
    competency_updated = False
    competency_name = None
    prev_level = None
    new_level = None
    certificate_awarded = False
    certificate_code = None

    # Identify relevant competency
    competency_id = assessment.competency_id
    if not competency_id and assessment.course and assessment.course.competency_mappings:
        competency_id = assessment.course.competency_mappings[0].competency_id

    if passed and competency_id:
        comp = db.query(Competency).filter(Competency.id == competency_id).first()
        if comp:
            competency_name = comp.name
            user_comp = db.query(UserCompetency).filter(
                UserCompetency.user_id == user_id,
                UserCompetency.competency_id == competency_id
            ).first()

            if not user_comp:
                prev_level = 1
                new_level = min(comp.max_level, max(2, assessment.target_competency_level))
                user_comp = UserCompetency(
                    user_id=user_id,
                    competency_id=competency_id,
                    current_level=new_level,
                    assessment_source=f"Assessment: {assessment.title} ({percentage:.1f}%)",
                    evidence=f"Passed assessment with {percentage:.1f}% on {datetime.datetime.utcnow().strftime('%Y-%m-%d')}",
                    last_updated=datetime.datetime.utcnow()
                )
                db.add(user_comp)
                competency_updated = True
            else:
                prev_level = user_comp.current_level
                target_lvl = assessment.target_competency_level
                if user_comp.current_level < target_lvl:
                    new_level = min(comp.max_level, user_comp.current_level + 1)
                    user_comp.current_level = new_level
                    user_comp.assessment_source = f"Assessment: {assessment.title} ({percentage:.1f}%)"
                    user_comp.evidence = f"Passed assessment with {percentage:.1f}% on {datetime.datetime.utcnow().strftime('%Y-%m-%d')}"
                    user_comp.last_updated = datetime.datetime.utcnow()
                    competency_updated = True
                else:
                    new_level = user_comp.current_level

    # Update course enrollment
    if assessment.course_id:
        enrollment = db.query(Enrollment).filter(
            Enrollment.user_id == user_id,
            Enrollment.course_id == assessment.course_id
        ).first()

        if enrollment:
            if passed:
                enrollment.progress_percent = 100.0
                enrollment.status = "completed"
                enrollment.completed_at = datetime.datetime.utcnow()

                # Issue certificate
                existing_cert = db.query(Certificate).filter(
                    Certificate.user_id == user_id,
                    Certificate.course_id == assessment.course_id
                ).first()

                if not existing_cert:
                    certificate_code = f"CC-IMD-2026-{uuid.uuid4().hex[:8].upper()}"
                    course_title = assessment.course.title if assessment.course else "Meteorological Training"
                    cert = Certificate(
                        certificate_code=certificate_code,
                        user_id=user_id,
                        course_id=assessment.course_id,
                        title=f"Certificate of Competency: {course_title}",
                        issuing_org="Capacity Connect - Ministry of Earth Sciences / IMD",
                        issued_at=datetime.datetime.utcnow(),
                        metadata_json=f'{{"competency": "{competency_name or "Meteorological Analysis"}", "score": {percentage:.1f}}}'
                    )
                    db.add(cert)
                    certificate_awarded = True

                    # Notify Trainee
                    notif = Notification(
                        user_id=user_id,
                        title="Certificate Awarded!",
                        message=f"You earned a certificate for successfully completing '{course_title}' with {percentage:.1f}%.",
                        link="/trainee/certificates",
                        type="achievement",
                        is_read=False
                    )
                    db.add(notif)
            else:
                enrollment.progress_percent = max(enrollment.progress_percent, 75.0)

    # Add competency increase notification if updated
    if competency_updated and user_id:
        notif = Notification(
            user_id=user_id,
            title="Competency Level Upgraded!",
            message=f"Your competency in '{competency_name}' increased from Level {prev_level} to Level {new_level} after passing '{assessment.title}'.",
            link="/trainee/competencies",
            type="assessment",
            is_read=False
        )
        db.add(notif)

    db.commit()

    return competency_updated, competency_name, prev_level, new_level, certificate_awarded, certificate_code
