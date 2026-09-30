from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import User, TraineeProfile, TrainerProfile, JobRole, AuditLog
from app.schemas.schemas import UserUpdate
from app.services.auth_service import get_current_user, require_role

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("")
def list_users(
    role: Optional[str] = None,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    query = db.query(User)
    if role:
        query = query.filter(User.role == role)
    users = query.all()
    
    result = []
    for u in users:
        result.append({
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role,
            "designation": u.designation,
            "department": u.department,
            "is_approved": u.is_approved,
            "is_active": u.is_active,
            "created_at": u.created_at
        })
    return result

@router.put("/profile")
def update_profile(
    req: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if req.full_name is not None:
        current_user.full_name = req.full_name
    if req.designation is not None:
        current_user.designation = req.designation
    if req.department is not None:
        current_user.department = req.department
    if req.phone is not None:
        current_user.phone = req.phone

    if current_user.role == "trainee":
        tp = current_user.trainee_profile
        if not tp:
            tp = TraineeProfile(user_id=current_user.id)
            db.add(tp)
        if req.qualifications is not None:
            tp.qualifications = req.qualifications
        if req.experience_years is not None:
            tp.experience_years = req.experience_years
        if req.bio is not None:
            tp.bio = req.bio
        if req.skills is not None:
            tp.skills = req.skills
        if req.interests is not None:
            tp.interests = req.interests
        if req.certifications is not None:
            tp.certifications = req.certifications
        if req.job_role_id is not None:
            tp.job_role_id = req.job_role_id

    elif current_user.role == "trainer":
        trp = current_user.trainer_profile
        if not trp:
            trp = TrainerProfile(user_id=current_user.id)
            db.add(trp)
        if req.qualifications is not None:
            trp.qualifications = req.qualifications
        if req.experience_years is not None:
            trp.experience_years = req.experience_years
        if req.bio is not None:
            trp.bio = req.bio
        if req.expertise_areas is not None:
            trp.expertise_areas = req.expertise_areas
        if req.certifications is not None:
            trp.certifications = req.certifications

    db.commit()
    return {"message": "Profile updated successfully"}

@router.put("/{user_id}/approve")
def approve_user(
    user_id: int,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    u.is_approved = True
    
    # Audit log
    audit = AuditLog(
        user_id=current_user.id,
        action="APPROVE_USER",
        details=f"Admin {current_user.full_name} approved user {u.email} (Role: {u.role})"
    )
    db.add(audit)
    db.commit()
    return {"message": f"User {u.full_name} approved successfully"}

@router.put("/{user_id}/role")
def update_user_role(
    user_id: int,
    new_role: str,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    if new_role not in ["trainee", "trainer", "admin"]:
        raise HTTPException(status_code=400, detail="Invalid role specification.")
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    
    old_role = u.role
    u.role = new_role
    
    audit = AuditLog(
        user_id=current_user.id,
        action="UPDATE_USER_ROLE",
        details=f"Admin {current_user.full_name} changed role of {u.email} from {old_role} to {new_role}"
    )
    db.add(audit)
    db.commit()
    return {"message": f"Role updated to {new_role}"}
