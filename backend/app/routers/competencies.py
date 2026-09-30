from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.entities import Competency, JobRole, RoleCompetency, User
from app.schemas.schemas import CompetencyCreate, JobRoleCreate
from app.services.auth_service import require_role

router = APIRouter(prefix="", tags=["Competencies & Framework"])

@router.get("/competencies")
def list_competencies(db: Session = Depends(get_db)):
    comps = db.query(Competency).all()
    return [{
        "id": c.id,
        "name": c.name,
        "code": c.code,
        "category": c.category,
        "description": c.description,
        "max_level": c.max_level
    } for c in comps]

@router.post("/competencies")
def create_competency(
    req: CompetencyCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    existing = db.query(Competency).filter(Competency.code == req.code.upper()).first()
    if existing:
        raise HTTPException(status_code=400, detail="Competency code already registered.")

    comp = Competency(
        name=req.name,
        code=req.code.upper(),
        category=req.category,
        description=req.description,
        max_level=req.max_level
    )
    db.add(comp)
    db.commit()
    db.refresh(comp)
    return {"id": comp.id, "name": comp.name, "message": "Competency added to framework."}

@router.get("/job-roles")
def list_job_roles(db: Session = Depends(get_db)):
    roles = db.query(JobRole).all()
    results = []
    for r in roles:
        req_comps = []
        for rc in r.role_competencies:
            comp = rc.competency
            if comp:
                req_comps.append({
                    "competency_id": comp.id,
                    "competency_name": comp.name,
                    "competency_code": comp.code,
                    "category": comp.category,
                    "required_level": rc.required_level,
                    "importance": rc.importance
                })
        results.append({
            "id": r.id,
            "title": r.title,
            "code": r.code,
            "description": r.description,
            "department": r.department,
            "required_competencies": req_comps
        })
    return results

@router.post("/job-roles")
def create_job_role(
    req: JobRoleCreate,
    current_user: User = Depends(require_role(["admin"])),
    db: Session = Depends(get_db)
):
    role = JobRole(
        title=req.title,
        code=req.code.upper(),
        description=req.description,
        department=req.department
    )
    db.add(role)
    db.flush()

    for item in req.competency_requirements:
        comp_id = item.get("competency_id")
        req_lvl = item.get("required_level", 3)
        imp = item.get("importance", "critical")
        if comp_id:
            rc = RoleCompetency(
                job_role_id=role.id,
                competency_id=comp_id,
                required_level=req_lvl,
                importance=imp
            )
            db.add(rc)

    db.commit()
    db.refresh(role)
    return {"id": role.id, "title": role.title, "message": "Job role and required competencies configured."}

@router.get("/competency-framework")
def get_competency_framework(db: Session = Depends(get_db)):
    categories = {}
    comps = db.query(Competency).all()
    for c in comps:
        if c.category not in categories:
            categories[c.category] = []
        categories[c.category].append({
            "id": c.id,
            "name": c.name,
            "code": c.code,
            "description": c.description,
            "max_level": c.max_level,
            "courses_count": len(c.course_competencies)
        })

    job_roles = db.query(JobRole).all()
    roles_summary = []
    for jr in job_roles:
        roles_summary.append({
            "id": jr.id,
            "title": jr.title,
            "code": jr.code,
            "department": jr.department,
            "competencies_count": len(jr.role_competencies),
            "trainees_count": len(jr.trainees)
        })

    return {
        "categories": categories,
        "job_roles": roles_summary,
        "total_competencies": len(comps),
        "total_roles": len(job_roles)
    }
