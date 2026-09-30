from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional, Any, Dict
from datetime import datetime

# --- AUTH & USER ---
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: str = "trainee"  # trainee, trainer, admin
    designation: Optional[str] = "Scientific Assistant"
    department: Optional[str] = "India Meteorological Department"
    job_role_id: Optional[int] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = 2
    skills: Optional[str] = None
    expertise_areas: Optional[str] = None

class Token(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]

class UserBase(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    designation: Optional[str]
    department: Optional[str]
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    is_approved: bool
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    designation: Optional[str] = None
    department: Optional[str] = None
    phone: Optional[str] = None
    qualifications: Optional[str] = None
    experience_years: Optional[int] = None
    bio: Optional[str] = None
    skills: Optional[str] = None
    interests: Optional[str] = None
    certifications: Optional[str] = None
    expertise_areas: Optional[str] = None
    job_role_id: Optional[int] = None

# --- JOB ROLES & COMPETENCIES ---
class CompetencyBase(BaseModel):
    id: int
    name: str
    code: str
    category: str
    description: Optional[str]
    max_level: int = 5

    class Config:
        from_attributes = True

class CompetencyCreate(BaseModel):
    name: str
    code: str
    category: str
    description: Optional[str] = None
    max_level: int = 5

class RoleCompetencyMapping(BaseModel):
    competency_id: int
    competency_name: str
    competency_code: str
    category: str
    required_level: int
    importance: str

class JobRoleResponse(BaseModel):
    id: int
    title: str
    code: str
    description: Optional[str]
    department: str
    required_competencies: List[RoleCompetencyMapping] = []

    class Config:
        from_attributes = True

class JobRoleCreate(BaseModel):
    title: str
    code: str
    description: Optional[str] = None
    department: str = "India Meteorological Department"
    competency_requirements: List[Dict[str, Any]] = []

class UserCompetencyItem(BaseModel):
    id: int
    competency_id: int
    name: str
    code: str
    category: str
    description: Optional[str]
    current_level: int
    required_level: int
    gap: int
    status: str  # on_track, needs_development, critical_gap
    assessment_source: Optional[str]
    evidence: Optional[str]
    last_updated: Optional[datetime]

class SkillGapReport(BaseModel):
    trainee_id: int
    trainee_name: str
    job_role: Optional[str]
    competencies: List[UserCompetencyItem]
    total_competencies: int
    competencies_met: int
    competencies_gapped: int
    average_gap: float

# --- COURSES & RECOMMENDATIONS ---
class CourseResourceItem(BaseModel):
    id: int
    title: str
    resource_type: str
    file_url: str
    file_size_kb: int
    description: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True

class CourseCompetencyMapping(BaseModel):
    competency_id: int
    competency_name: str
    target_level: int
    expected_improvement: int

class CourseResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    trainer_id: int
    trainer_name: Optional[str] = None
    subject: str
    category: str
    difficulty: str
    duration_hours: float
    objectives: Optional[str]
    prerequisites: Optional[str]
    status: str
    thumbnail_url: Optional[str]
    created_at: datetime
    competencies: List[CourseCompetencyMapping] = []
    resources: List[CourseResourceItem] = []
    enrolled: Optional[bool] = False
    progress_percent: Optional[float] = 0.0

    class Config:
        from_attributes = True

class CourseCreate(BaseModel):
    title: str
    description: str
    subject: str
    category: str = "Meteorological Computing"
    difficulty: str = "intermediate"
    duration_hours: float = 10.0
    objectives: Optional[str] = None
    prerequisites: Optional[str] = None
    competency_ids: List[int] = []
    target_levels: List[int] = []

class CourseRecommendationItem(BaseModel):
    course_id: int
    course_title: str
    course_slug: str
    subject: str
    difficulty: str
    duration_hours: float
    trainer_name: str
    primary_competency_id: int
    primary_competency_name: str
    current_level: int
    required_level: int
    gap: int
    expected_improvement: int
    recommendation_reason: str
    enrolled: bool = False
    progress_percent: float = 0.0

# --- ASSESSMENTS & CLOSED-LOOP UPDATES ---
class QuestionCreate(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str  # A, B, C, D
    explanation: Optional[str] = None
    topic: Optional[str] = None
    difficulty: str = "intermediate"
    points: int = 1

class QuestionResponse(BaseModel):
    id: int
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: Optional[str] = None  # Hidden during test, shown in review
    explanation: Optional[str] = None
    topic: Optional[str] = None
    difficulty: str
    points: int

    class Config:
        from_attributes = True

class AssessmentCreate(BaseModel):
    course_id: int
    competency_id: Optional[int] = None
    title: str
    description: Optional[str] = None
    time_limit_minutes: int = 20
    passing_score: float = 70.0
    target_competency_level: int = 3
    deadline: Optional[datetime] = None
    questions: List[QuestionCreate] = []

class AssessmentResponse(BaseModel):
    id: int
    course_id: int
    course_title: Optional[str] = None
    competency_id: Optional[int] = None
    competency_name: Optional[str] = None
    title: str
    description: Optional[str]
    time_limit_minutes: int
    passing_score: float
    target_competency_level: int
    is_published: bool
    deadline: Optional[datetime]
    question_count: int = 0
    questions: List[QuestionResponse] = []
    created_at: datetime
    best_score: Optional[float] = None
    passed: Optional[bool] = None

    class Config:
        from_attributes = True

class AssessmentSubmitRequest(BaseModel):
    answers: Dict[int, str]  # question_id: selected_option (A, B, C, D)

class AssessmentResultResponse(BaseModel):
    attempt_id: int
    assessment_id: int
    assessment_title: str
    score_obtained: float
    total_score: float
    percentage: float
    passed: bool
    competency_updated: bool
    competency_name: Optional[str] = None
    previous_level: Optional[int] = None
    new_level: Optional[int] = None
    feedback_message: str
    certificate_awarded: bool = False
    certificate_code: Optional[str] = None
    detailed_answers: List[Dict[str, Any]] = []

# --- AI MCQ GENERATION ---
class AIMCQGenerationRequest(BaseModel):
    topic: str
    content: Optional[str] = None  # Uploaded text/notes or prompt
    competency_id: Optional[int] = None
    course_id: Optional[int] = None
    num_questions: int = 5
    difficulty: str = "intermediate"

class AIMCQItem(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_option: str
    explanation: str
    topic: str
    difficulty: str
    competency_name: Optional[str] = None

# --- TRAINER MATCHING & TRAINING REQUIREMENTS ---
class TrainingRequirementCreate(BaseModel):
    title: str
    subject: str
    description: str
    department: str = "National Weather Forecasting Centre"
    required_experience_years: int = 5
    duration_days: int = 5
    deadline: Optional[datetime] = None
    competency_requirements: List[Dict[str, int]] = []  # [{"competency_id": 1, "required_level": 4}]

class TrainerMatchResult(BaseModel):
    trainer_id: int
    trainer_name: str
    email: str
    designation: str
    department: str
    avatar_url: Optional[str]
    qualifications: Optional[str]
    experience_years: int
    rating: float
    total_trainings_delivered: int
    overall_match_score: float
    competency_score: float      # 40%
    subject_score: float         # 25%
    experience_score: float      # 20%
    certification_score: float   # 15%
    match_reasons: List[str]     # Transparent explainable bullet points
    is_selected: bool = False

class TrainingRequirementResponse(BaseModel):
    id: int
    title: str
    subject: str
    description: str
    department: str
    required_experience_years: int
    duration_days: int
    deadline: Optional[datetime]
    status: str
    assigned_trainer_id: Optional[int]
    assigned_trainer_name: Optional[str] = None
    created_at: datetime
    required_competencies: List[Dict[str, Any]] = []
    matches: List[TrainerMatchResult] = []

    class Config:
        from_attributes = True

# --- CERTIFICATES & FEEDBACK ---
class CertificateResponse(BaseModel):
    id: int
    certificate_code: str
    title: str
    course_id: int
    course_title: Optional[str] = None
    user_name: str
    issued_at: datetime
    issuing_org: str
    competencies_gained: List[str] = []

class FeedbackCreate(BaseModel):
    course_id: int
    rating: int = Field(ge=1, le=5)
    content_quality_rating: int = Field(ge=1, le=5)
    trainer_rating: int = Field(ge=1, le=5)
    comments: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    course_id: int
    user_name: str
    rating: int
    comments: Optional[str]
    created_at: datetime

# --- NOTIFICATIONS & ANNOUNCEMENTS ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    link: Optional[str]
    type: str
    is_read: bool
    created_at: datetime

class AnnouncementCreate(BaseModel):
    title: str
    content: str
    target_role: str = "all"
    priority: str = "normal"

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    content: str
    target_role: str
    priority: str
    author_name: str
    created_at: datetime

# --- ANALYTICS ---
class OrgOverviewStats(BaseModel):
    total_users: int
    total_trainees: int
    total_trainers: int
    total_courses: int
    total_enrollments: int
    completion_rate: float
    assessments_completed: int
    certificates_issued: int
    open_training_requirements: int

class CompetencyAnalytics(BaseModel):
    competency_id: int
    name: str
    category: str
    average_level: float
    required_benchmark: float
    gap: float
    trainees_gapped_count: int
