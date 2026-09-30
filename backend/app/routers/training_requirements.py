from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import (
    User, TrainingRequirement, TrainingRequirementCompetency,
    Competency, TrainerMatch, Notification, Announcement
)
from app.schemas.schemas import TrainingRequirementCreate
from app.services.auth_service import get_current_user, require_role
from app.services.trainer_matching_service import run_trainer_matching

router = APIRouter(prefix="/training-requirements", tags=["Training Requirements & Trainer Matching"])

@router.get("")
def list_training_requirements(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(TrainingRequirement)
    if status:
        query = query.filter(TrainingRequirement.status == status)

    reqs = query.order_by(TrainingRequirement.created_at.desc()).all()
    results = []
    for r in reqs:
        req_comps = []
        for rc in r.required_competencies:
            comp = db.query(Competency).filter(Competency.id == rc.competency_id).first()
            if comp:
                req_comps.append({
                    "competency_id": comp.id,
                    "name": comp.name,
                    "required_level": rc.required_level
                })

        assigned_trainer = db.query(User).filter(User.id == r.assigned_trainer_id).first() if r.assigned_trainer_id else None

        results.append({
            "id": r.id,
            "title": r.title,
            "subject": r.subject,
            "description": r.description,
            "department": r.department,
            "required_experience_years": r.required_experience_years,
            "duration_days": r.duration_days,
            "deadline": r.deadline,
            "status": r.status,
            "assigned_trainer_id": r.assigned_trainer_id,
            "assigned_trainer_name": assigned_trainer.full_name if assigned_trainer else None,
            "required_competencies": req_comps,
            "created_at": r.created_at,
            "matches_count": len(r.matches)
        })
    return results

@router.post("")
def create_training_requirement(
    req: TrainingRequirementCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    tr = TrainingRequirement(
        title=req.title,
        subject=req.subject,
        description=req.description,
        department=req.department,
        required_experience_years=req.required_experience_years,
        duration_days=req.duration_days,
        deadline=req.deadline,
        status="open",
        created_by=current_user.id
    )
    db.add(tr)
    db.flush()

    for item in req.competency_requirements:
        comp_id = item.get("competency_id")
        lvl = item.get("required_level", 4)
        if comp_id:
            rc = TrainingRequirementCompetency(
                requirement_id=tr.id,
                competency_id=comp_id,
                required_level=lvl
            )
            db.add(rc)

    db.commit()
    db.refresh(tr)

    # Immediately execute matching algorithm to populate initial matches
    matches = run_trainer_matching(db, tr.id)

    return {
        "id": tr.id,
        "title": tr.title,
        "message": f"Training requirement created. {len(matches)} potential trainers matched based on competency profile.",
        "matched_trainers_count": len(matches)
    }

@router.get("/{requirement_id}/match-trainers")
def get_matched_trainers(
    requirement_id: int,
    current_user: User = Depends(require_role(["admin", "trainer"])),
    db: Session = Depends(get_db)
):
    req = db.query(TrainingRequirement).filter(TrainingRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Training requirement not found")

    matches = run_trainer_matching(db, requirement_id)
    return {
        "requirement_id": req.id,
        "requirement_title": req.title,
        "subject": req.subject,
        "department": req.department,
        "matches": matches
    }

@router.post("/{requirement_id}/assign-trainer")
def assign_trainer(
    requirement_id: int,
    trainer_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    req = db.query(TrainingRequirement).filter(TrainingRequirement.id == requirement_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Training requirement not found")

    trainer = db.query(User).filter(User.id == trainer_id, User.role == "trainer").first()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    req.assigned_trainer_id = trainer.id
    req.status = "assigned"

    # Update matches is_selected flag
    matches = db.query(TrainerMatch).filter(TrainerMatch.requirement_id == requirement_id).all()
    for m in matches:
        m.is_selected = (m.trainer_id == trainer_id)

    # Notify trainer
    notif = Notification(
        user_id=trainer.id,
        title="Training Assignment Confirmed",
        message=f"You have been matched and assigned to lead '{req.title}' for {req.department}.",
        link="/trainer/training-requests",
        type="course"
    )
    db.add(notif)

    # Publish public announcement
    announcement = Announcement(
        title=f"New Capacity Building Program: {req.title}",
        content=f"An organizational training program '{req.title}' ({req.subject}) has been scheduled. Lead Trainer: {trainer.full_name} ({trainer.designation}).",
        target_role="all",
        priority="high",
        created_by=current_user.id
    )
    db.add(announcement)

    db.commit()
    return {"message": f"Trainer {trainer.full_name} successfully assigned to '{req.title}'."}
