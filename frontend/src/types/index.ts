export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'trainee' | 'trainer' | 'admin';
  designation?: string;
  department?: string;
  phone?: string;
  avatar_url?: string;
  is_approved: boolean;
  is_active: boolean;
  created_at: string;
  profile?: TraineeProfile | TrainerProfile;
}

export interface TraineeProfile {
  qualifications?: string;
  experience_years?: number;
  bio?: string;
  skills?: string;
  interests?: string;
  certifications?: string;
  job_role_id?: number;
  job_role_title?: string;
}

export interface TrainerProfile {
  qualifications?: string;
  experience_years?: number;
  expertise_areas?: string;
  competencies_taught?: string;
  certifications?: string;
  bio?: string;
  rating?: number;
  total_trainings_delivered?: number;
}

export interface JobRoleResponse {
  id: number;
  title: string;
  code: string;
  description?: string;
  department: string;
  required_competencies: Array<{
    competency_id: number;
    competency_name: string;
    competency_code: string;
    category: string;
    required_level: number;
    importance: string;
  }>;
}

export interface Competency {
  id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  max_level: number;
}

export interface UserCompetencyItem {
  id: number;
  competency_id: number;
  name: string;
  code: string;
  category: string;
  description?: string;
  current_level: number;
  required_level: number;
  gap: number;
  status: 'on_track' | 'needs_development' | 'critical_gap';
  assessment_source?: string;
  evidence?: string;
  last_updated?: string;
}

export interface SkillGapReport {
  trainee_id: number;
  trainee_name: string;
  job_role: string;
  competencies: UserCompetencyItem[];
  total_competencies: number;
  competencies_met: number;
  competencies_gapped: number;
  average_gap: number;
}

export interface CourseCompetencyMapping {
  competency_id: number;
  competency_name: string;
  target_level: number;
  expected_improvement: number;
}

export interface CourseResourceItem {
  id: number;
  title: string;
  resource_type: string;
  file_url: string;
  file_size_kb: number;
  description?: string;
  created_at: string;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  trainer_id: number;
  trainer_name?: string;
  trainer_designation?: string;
  subject: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration_hours: number;
  objectives?: string;
  prerequisites?: string;
  status: string;
  thumbnail_url?: string;
  created_at: string;
  competencies: CourseCompetencyMapping[];
  resources: CourseResourceItem[];
  enrolled?: boolean;
  progress_percent?: number;
  enrollment_status?: 'in_progress' | 'completed' | 'dropped';
  assessments?: any[];
}

export interface CourseRecommendation {
  course_id: number;
  course_title: string;
  course_slug: string;
  subject: string;
  difficulty: string;
  duration_hours: number;
  trainer_name: string;
  primary_competency_id: number;
  primary_competency_name: string;
  current_level: number;
  required_level: number;
  gap: number;
  expected_improvement: number;
  recommendation_reason: string;
  enrolled: boolean;
  progress_percent: number;
}

export interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option?: string;
  explanation?: string;
  topic?: string;
  difficulty: string;
  points: number;
}

export interface Assessment {
  id: number;
  course_id: number;
  course_title?: string;
  competency_name?: string;
  title: string;
  description?: string;
  time_limit_minutes: number;
  passing_score: number;
  target_competency_level: number;
  is_published: boolean;
  deadline?: string;
  question_count: number;
  questions?: Question[];
  best_score?: number;
  passed?: boolean;
}

export interface AssessmentResult {
  attempt_id: number;
  assessment_id: number;
  assessment_title: string;
  score_obtained: number;
  total_score: number;
  percentage: number;
  passed: boolean;
  competency_updated: boolean;
  competency_name?: string;
  previous_level?: number;
  new_level?: number;
  feedback_message: string;
  certificate_awarded: boolean;
  certificate_code?: string;
  detailed_answers: Array<{
    question_id: number;
    question_text: string;
    user_answer?: string;
    correct_option: string;
    is_correct: boolean;
    explanation?: string;
  }>;
}

export interface Certificate {
  id: number;
  certificate_code: string;
  title: string;
  course_id: number;
  course_title: string;
  user_name: string;
  issued_at: string;
  issuing_org: string;
  metadata_json?: string;
}

export interface TrainerMatchResult {
  trainer_id: number;
  trainer_name: string;
  email: string;
  designation: string;
  department: string;
  avatar_url?: string;
  qualifications?: string;
  experience_years: number;
  rating: number;
  total_trainings_delivered: number;
  overall_match_score: number;
  competency_score: number;
  subject_score: number;
  experience_score: number;
  certification_score: number;
  match_reasons: string[];
  is_selected: boolean;
}

export interface TrainingRequirement {
  id: number;
  title: string;
  subject: string;
  description: string;
  department: string;
  required_experience_years: number;
  duration_days: number;
  deadline?: string;
  status: 'open' | 'matched' | 'assigned' | 'completed';
  assigned_trainer_id?: number;
  assigned_trainer_name?: string;
  required_competencies: Array<{
    competency_id: number;
    name: string;
    required_level: number;
  }>;
  created_at: string;
  matches_count?: number;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  link?: string;
  type: string;
  is_read: boolean;
  created_at: string;
}

export interface AnnouncementItem {
  id: number;
  title: string;
  content: string;
  target_role: string;
  priority: string;
  author_name: string;
  created_at: string;
}
