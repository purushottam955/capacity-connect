import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Course } from '../../types';
import {
  BookOpen,
  UserCheck,
  Clock,
  FileText,
  Video,
  FileCheck2,
  Download,
  ExternalLink,
  CheckCircle2,
  ArrowRight,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export const TraineeCourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComments, setFeedbackComments] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  const fetchCourse = () => {
    if (!id) return;
    setLoading(true);
    api.get<Course>(`/courses/${id}`)
      .then((data) => {
        setCourse(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!id) return;
    setEnrolling(true);
    try {
      await api.post(`/courses/${id}/enroll`);
      fetchCourse();
    } catch {
      alert('Enrollment error');
    } finally {
      setEnrolling(false);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.post(`/courses/${id}/feedback`, {
        course_id: parseInt(id),
        rating: feedbackRating,
        content_quality_rating: feedbackRating,
        trainer_rating: feedbackRating,
        comments: feedbackComments
      });
      setFeedbackSubmitted(true);
    } catch {}
  };

  if (loading || !course) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const backendHost = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-institutional-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-institutional-800 space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-semibold bg-white/10 text-teal-300 uppercase tracking-wider">
            {course.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-semibold bg-white/10 text-slate-300 capitalize">
            Level: {course.difficulty}
          </span>
          {course.enrolled && (
            <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Enrolled ({course.progress_percent}%)
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{course.title}</h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">{course.description}</p>

        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 pt-2 border-t border-institutional-800">
          <span className="flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-teal-400" />
            Instructor: <strong className="text-white">{course.trainer_name}</strong>
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-teal-400" />
            Estimated Duration: <strong className="text-white">{course.duration_hours} Hours</strong>
          </span>
        </div>

        <div className="pt-2">
          {!course.enrolled ? (
            <button
              onClick={handleEnroll}
              disabled={enrolling}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              {enrolling ? 'Enrolling...' : 'Enroll in this Program'}
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-900/60 text-emerald-300 rounded-lg text-xs font-medium border border-emerald-700/50">
              <CheckCircle2 className="w-4 h-4" />
              You are actively enrolled in this course module.
            </div>
          )}
        </div>
      </div>

      {/* Target Competencies */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900">Competencies Developed in this Course</h3>
        <div className="flex flex-wrap gap-2">
          {course.competencies.map((comp) => (
            <div
              key={comp.competency_id}
              className="px-3 py-2 rounded-lg bg-teal-50 border border-teal-200 text-xs text-teal-900"
            >
              <strong className="block">{comp.competency_name}</strong>
              <span className="text-[11px] text-teal-700">Target Proficiency: Level {comp.target_level}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Study Materials & Resources */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-institutional-600" />
          Curriculum Study Materials ({course.resources.length})
        </h3>

        {course.resources.length === 0 ? (
          <p className="text-xs text-slate-400 py-4">No uploaded resources attached yet.</p>
        ) : (
          <div className="space-y-3">
            {course.resources.map((res) => {
              const fileLink = res.file_url.startsWith('http')
                ? res.file_url
                : `${backendHost}${res.file_url}`;

              return (
                <div
                  key={res.id}
                  className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                      {res.resource_type === 'video' ? <Video className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{res.title}</h4>
                      <p className="text-[11px] text-slate-500">{res.description || 'Reference notes & training slides'}</p>
                    </div>
                  </div>

                  <a
                    href={fileLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-md text-xs font-semibold text-slate-700 transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Open Resource
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Subject Assessments & Quizzes */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-institutional-600" />
          Course Competency Assessments
        </h3>

        {(!course.assessments || course.assessments.length === 0) ? (
          <p className="text-xs text-slate-400 py-4">No assessments currently scheduled for this module.</p>
        ) : (
          <div className="space-y-3">
            {course.assessments.map((a) => (
              <div
                key={a.id}
                className="p-4 bg-institutional-50/50 rounded-xl border border-institutional-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">{a.title}</h4>
                  <p className="text-xs text-slate-600">{a.description}</p>
                  <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                    <span>Questions: <strong>{a.question_count}</strong></span>
                    <span>•</span>
                    <span>Passing Benchmark: <strong>{a.passing_score}%</strong></span>
                    <span>•</span>
                    <span>Time Limit: <strong>{a.time_limit_minutes} Mins</strong></span>
                  </div>
                </div>

                <Link
                  to={`/trainee/assessments/${a.id}/take`}
                  className="px-4 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                >
                  Start Assessment <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Course & Trainer Feedback Form */}
      {course.enrolled && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-institutional-600" />
            Submit Course & Faculty Feedback
          </h3>

          {feedbackSubmitted ? (
            <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200">
              Thank you! Your institutional feedback has been logged for quality oversight.
            </div>
          ) : (
            <form onSubmit={handleFeedbackSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Overall Rating (1 to 5 Stars)
                </label>
                <select
                  value={feedbackRating}
                  onChange={(e) => setFeedbackRating(parseInt(e.target.value))}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value={5}>★★★★★ (5/5) - Excellent</option>
                  <option value={4}>★★★★☆ (4/5) - Very Good</option>
                  <option value={3}>★★★☆☆ (3/5) - Satisfactory</option>
                  <option value={2}>★★☆☆☆ (2/5) - Needs Improvement</option>
                  <option value={1}>★☆☆☆☆ (1/5) - Unsatisfactory</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Comments & Feedback on Technical Content
                </label>
                <textarea
                  rows={2}
                  value={feedbackComments}
                  onChange={(e) => setFeedbackComments(e.target.value)}
                  placeholder="The NetCDF exercises were directly applicable to our NWP operational desk..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <button
                type="submit"
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                Submit Feedback
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
