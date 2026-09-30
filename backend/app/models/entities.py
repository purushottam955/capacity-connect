import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="trainee", nullable=False)  # trainee, trainer, admin
    designation = Column(String(255), default="Scientific Assistant")
    department = Column(String(255), default="India Meteorological Department")
    phone = Column(String(50), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    is_approved = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    trainee_profile = relationship("TraineeProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    trainer_profile = relationship("TrainerProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    user_competencies = relationship("UserCompetency", back_populates="user", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    assessment_attempts = relationship("AssessmentAttempt", back_populates="user", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    feedbacks = relationship("CourseFeedback", back_populates="user", cascade="all, delete-orphan")
    taught_courses = relationship("Course", back_populates="trainer")


class JobRole(Base):
    __tablename__ = "job_roles"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), unique=True, nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    department = Column(String(255), default="India Meteorological Department")

    role_competencies = relationship("RoleCompetency", back_populates="job_role", cascade="all, delete-orphan")
    trainees = relationship("TraineeProfile", back_populates="job_role")


class Competency(Base):
    __tablename__ = "competencies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False)
    code = Column(String(100), unique=True, nullable=False)
    category = Column(String(100), nullable=False)  # e.g., Core Meteorology, Numerical Modeling, Data & Computing, Risk Communication
    description = Column(Text, nullable=True)
    max_level = Column(Integer, default=5)

    user_competencies = relationship("UserCompetency", back_populates="competency", cascade="all, delete-orphan")
    role_competencies = relationship("RoleCompetency", back_populates="competency", cascade="all, delete-orphan")
    course_competencies = relationship("CourseCompetency", back_populates="competency", cascade="all, delete-orphan")


class RoleCompetency(Base):
    __tablename__ = "role_competencies"

    id = Column(Integer, primary_key=True, index=True)
    job_role_id = Column(Integer, ForeignKey("job_roles.id"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id"), nullable=False)
    required_level = Column(Integer, default=3)  # 1 to 5
    importance = Column(String(50), default="critical")  # critical, recommended, optional

    job_role = relationship("JobRole", back_populates="role_competencies")
    competency = relationship("Competency", back_populates="role_competencies")


class TraineeProfile(Base):
    __tablename__ = "trainee_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    job_role_id = Column(Integer, ForeignKey("job_roles.id"), nullable=True)
    qualifications = Column(Text, nullable=True)
    experience_years = Column(Integer, default=2)
    bio = Column(Text, nullable=True)
    skills = Column(Text, nullable=True)  # Comma separated or JSON string
    interests = Column(Text, nullable=True)
    certifications = Column(Text, nullable=True)

    user = relationship("User", back_populates="trainee_profile")
    job_role = relationship("JobRole", back_populates="trainees")


class TrainerProfile(Base):
    __tablename__ = "trainer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    qualifications = Column(Text, nullable=True)
    experience_years = Column(Integer, default=8)
    expertise_areas = Column(Text, nullable=True)  # Comma separated or JSON string
    competencies_taught = Column(Text, nullable=True)  # Comma separated competency names/codes
    certifications = Column(Text, nullable=True)
    bio = Column(Text, nullable=True)
    rating = Column(Float, default=4.8)
    total_trainings_delivered = Column(Integer, default=12)

    user = relationship("User", back_populates="trainer_profile")


class UserCompetency(Base):
    __tablename__ = "user_competencies"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id"), nullable=False)
    current_level = Column(Integer, default=1)  # 1 to 5
    assessment_source = Column(String(255), default="Initial Evaluation")
    evidence = Column(Text, nullable=True)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="user_competencies")
    competency = relationship("Competency", back_populates="user_competencies")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    trainer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    subject = Column(String(255), nullable=False)
    category = Column(String(100), default="Meteorological Computing")
    difficulty = Column(String(50), default="intermediate")  # beginner, intermediate, advanced
    duration_hours = Column(Float, default=12.0)
    objectives = Column(Text, nullable=True)
    prerequisites = Column(Text, nullable=True)
    status = Column(String(50), default="published")  # published, draft, archived
    thumbnail_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    trainer = relationship("User", back_populates="taught_courses")
    competency_mappings = relationship("CourseCompetency", back_populates="course", cascade="all, delete-orphan")
    resources = relationship("CourseResource", back_populates="course", cascade="all, delete-orphan")
    assessments = relationship("Assessment", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")
    certificates = relationship("Certificate", back_populates="course")
    feedbacks = relationship("CourseFeedback", back_populates="course")


class CourseCompetency(Base):
    __tablename__ = "course_competencies"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id"), nullable=False)
    target_level = Column(Integer, default=3)
    expected_improvement = Column(Integer, default=1)  # e.g., level increases by +1

    course = relationship("Course", back_populates="competency_mappings")
    competency = relationship("Competency", back_populates="course_competencies")


class CourseResource(Base):
    __tablename__ = "course_resources"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    trainer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    resource_type = Column(String(50), nullable=False)  # pdf, pptx, video, notes
    file_url = Column(String(500), nullable=False)
    file_size_kb = Column(Integer, default=1024)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    course = relationship("Course", back_populates="resources")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)
    progress_percent = Column(Float, default=0.0)
    status = Column(String(50), default="in_progress")  # in_progress, completed, dropped
    completed_at = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class Assessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    time_limit_minutes = Column(Integer, default=20)
    passing_score = Column(Float, default=70.0)
    target_competency_level = Column(Integer, default=3)
    is_published = Column(Boolean, default=True)
    deadline = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    course = relationship("Course", back_populates="assessments")
    questions = relationship("Question", back_populates="assessment", cascade="all, delete-orphan")
    attempts = relationship("AssessmentAttempt", back_populates="assessment", cascade="all, delete-orphan")


class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    option_a = Column(String(500), nullable=False)
    option_b = Column(String(500), nullable=False)
    option_c = Column(String(500), nullable=False)
    option_d = Column(String(500), nullable=False)
    correct_option = Column(String(10), nullable=False)  # A, B, C, D
    explanation = Column(Text, nullable=True)
    topic = Column(String(255), nullable=True)
    difficulty = Column(String(50), default="intermediate")
    points = Column(Integer, default=1)

    assessment = relationship("Assessment", back_populates="questions")


class AssessmentAttempt(Base):
    __tablename__ = "assessment_attempts"

    id = Column(Integer, primary_key=True, index=True)
    assessment_id = Column(Integer, ForeignKey("assessments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)
    score_obtained = Column(Float, default=0.0)
    total_score = Column(Float, default=100.0)
    percentage = Column(Float, default=0.0)
    passed = Column(Boolean, default=False)
    answers_payload = Column(Text, nullable=True)  # JSON string of responses

    assessment = relationship("Assessment", back_populates="attempts")
    user = relationship("User", back_populates="assessment_attempts")


class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(Integer, primary_key=True, index=True)
    certificate_code = Column(String(100), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    title = Column(String(255), nullable=False)
    issuing_org = Column(String(255), default="Capacity Connect - Ministry of Earth Sciences / IMD")
    issued_at = Column(DateTime, default=datetime.datetime.utcnow)
    metadata_json = Column(Text, nullable=True)

    user = relationship("User", back_populates="certificates")
    course = relationship("Course", back_populates="certificates")


class TrainingRequirement(Base):
    __tablename__ = "training_requirements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    subject = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    department = Column(String(255), default="National Weather Forecasting Centre")
    required_experience_years = Column(Integer, default=5)
    duration_days = Column(Integer, default=5)
    deadline = Column(DateTime, nullable=True)
    status = Column(String(50), default="open")  # open, matched, assigned, completed
    assigned_trainer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    required_competencies = relationship("TrainingRequirementCompetency", back_populates="requirement", cascade="all, delete-orphan")
    matches = relationship("TrainerMatch", back_populates="requirement", cascade="all, delete-orphan")


class TrainingRequirementCompetency(Base):
    __tablename__ = "training_requirement_competencies"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("training_requirements.id"), nullable=False)
    competency_id = Column(Integer, ForeignKey("competencies.id"), nullable=False)
    required_level = Column(Integer, default=4)

    requirement = relationship("TrainingRequirement", back_populates="required_competencies")
    competency = relationship("Competency")


class TrainerMatch(Base):
    __tablename__ = "trainer_matches"

    id = Column(Integer, primary_key=True, index=True)
    requirement_id = Column(Integer, ForeignKey("training_requirements.id"), nullable=False)
    trainer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    overall_match_score = Column(Float, default=0.0)  # 0 to 100
    competency_score = Column(Float, default=0.0)    # 40% weight
    subject_score = Column(Float, default=0.0)       # 25% weight
    experience_score = Column(Float, default=0.0)    # 20% weight
    certification_score = Column(Float, default=0.0) # 15% weight
    match_reasons = Column(Text, nullable=True)      # JSON list of bullet points
    is_selected = Column(Boolean, default=False)
    matched_at = Column(DateTime, default=datetime.datetime.utcnow)

    requirement = relationship("TrainingRequirement", back_populates="matches")
    trainer = relationship("User")


class CourseFeedback(Base):
    __tablename__ = "course_feedback"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, default=5)
    content_quality_rating = Column(Integer, default=5)
    trainer_rating = Column(Integer, default=5)
    comments = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    course = relationship("Course", back_populates="feedbacks")
    user = relationship("User", back_populates="feedbacks")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    link = Column(String(255), nullable=True)
    type = Column(String(50), default="info")  # assessment, course, achievement, system
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=False)
    target_role = Column(String(50), default="all")  # all, trainee, trainer
    priority = Column(String(50), default="normal")  # normal, high
    created_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=True)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=True)
    ip_address = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
