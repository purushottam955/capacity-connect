from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.entities import User, TraineeProfile, TrainerProfile, JobRole, UserCompetency, Competency, Notification
from app.schemas.schemas import LoginRequest, RegisterRequest, Token, UserBase, UserUpdate
from app.services.auth_service import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    # Check if email exists
    existing = db.query(User).filter(User.email == req.email.lower()).first()
    if existing:
        raise HTTPException(status_code=400, detail="User with this email already exists.")

    hashed_pw = get_password_hash(req.password)
    user = User(
        email=req.email.lower(),
        hashed_password=hashed_pw,
        full_name=req.full_name,
        role=req.role.lower(),
        designation=req.designation or "Scientific Assistant",
        department=req.department or "India Meteorological Department",
        is_approved=True,  # Auto-approved for frictionless demo
        is_active=True
    )
    db.add(user)
    db.flush()

    if user.role == "trainee":
        # Create Trainee Profile
        profile = TraineeProfile(
            user_id=user.id,
            job_role_id=req.job_role_id or 1,
            qualifications=req.qualifications or "M.Sc. Atmospheric Sciences / Meteorology",
            experience_years=req.experience_years or 2,
            skills=req.skills or "Python, Basic Meteorology, Weather Charts",
            bio="Meteorological officer engaged in operational weather forecasting."
        )
        db.add(profile)

        # Initialize baseline competencies for trainee
        competencies = db.query(Competency).all()
        for comp in competencies:
            uc = UserCompetency(
                user_id=user.id,
                competency_id=comp.id,
                current_level=2,  # Baseline level
                assessment_source="Initial Profile Baseline",
                evidence="Self-declared upon portal onboarding"
            )
            db.add(uc)

    elif user.role == "trainer":
        # Create Trainer Profile
        profile = TrainerProfile(
            user_id=user.id,
            qualifications=req.qualifications or "Ph.D. Atmospheric Sciences / WMO Fellow",
            experience_years=req.experience_years or 8,
            expertise_areas=req.expertise_areas or "Numerical Weather Prediction, Radar Meteorology, Satellite Meteorology",
            competencies_taught="Numerical Weather Prediction, Data Analytics, Python",
            certifications="WMO Instructor Credential, IMD Advanced Training Certificate",
            bio="Senior Meteorological Trainer with research and operational forecasting experience.",
            rating=4.9,
            total_trainings_delivered=15
        )
        db.add(profile)

    # Welcome notification
    notif = Notification(
        user_id=user.id,
        title="Welcome to CAPACITY CONNECT",
        message="Your digital capacity building and competency profile has been initialized.",
        link="/trainee/profile" if user.role == "trainee" else "/trainer/profile",
        type="system"
    )
    db.add(notif)
    db.commit()
    db.refresh(user)

    # Generate JWT
    token_data = {"sub": str(user.id), "role": user.role, "email": user.email}
    access_token = create_access_token(token_data, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "designation": user.designation,
            "department": user.department,
            "avatar_url": user.avatar_url
        }
    }


@router.post("/login", response_model=Token)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email.lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Account is disabled. Contact system administrator.")
    if not user.is_approved:
        raise HTTPException(status_code=403, detail="Account pending approval by portal administrator.")

    token_data = {"sub": str(user.id), "role": user.role, "email": user.email}
    access_token = create_access_token(token_data, expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "role": user.role,
            "designation": user.designation,
            "department": user.department,
            "avatar_url": user.avatar_url
        }
    }


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    user_info = {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "role": current_user.role,
        "designation": current_user.designation,
        "department": current_user.department,
        "phone": current_user.phone,
        "avatar_url": current_user.avatar_url,
        "is_approved": current_user.is_approved,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at
    }

    if current_user.role == "trainee" and current_user.trainee_profile:
        tp = current_user.trainee_profile
        job_role = db.query(JobRole).filter(JobRole.id == tp.job_role_id).first() if tp.job_role_id else None
        user_info["profile"] = {
            "qualifications": tp.qualifications,
            "experience_years": tp.experience_years,
            "bio": tp.bio,
            "skills": tp.skills,
            "interests": tp.interests,
            "certifications": tp.certifications,
            "job_role_id": tp.job_role_id,
            "job_role_title": job_role.title if job_role else "Meteorologist Grade-I"
        }
    elif current_user.role == "trainer" and current_user.trainer_profile:
        trp = current_user.trainer_profile
        user_info["profile"] = {
            "qualifications": trp.qualifications,
            "experience_years": trp.experience_years,
            "expertise_areas": trp.expertise_areas,
            "competencies_taught": trp.competencies_taught,
            "certifications": trp.certifications,
            "bio": trp.bio,
            "rating": trp.rating,
            "total_trainings_delivered": trp.total_trainings_delivered
        }

    return user_info


@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}
