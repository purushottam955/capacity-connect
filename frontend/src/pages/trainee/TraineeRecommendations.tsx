import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { CourseRecommendation } from '../../types';
import { Sparkles, ArrowRight, CheckCircle2, Clock, UserCheck, BookOpen, AlertTriangle } from 'lucide-react';

export const TraineeRecommendations: React.FC = () => {
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState<number | null>(null);
  const navigate = useNavigate();

  const fetchRecommendations = () => {
    setLoading(true);
    api.get<CourseRecommendation[]>('/trainee/recommendations')
      .then((data) => {
        setRecommendations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleEnroll = async (courseId: number) => {
    setEnrollingId(courseId);
    try {
      await api.post(`/courses/${courseId}/enroll`);
      navigate(`/trainee/courses/${courseId}`);
    } catch (err) {
      alert('Enrollment error');
      setEnrollingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Sparkles className="w-6 h-6 text-teal-600" />
          Explainable Learning Recommendations
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Courses algorithmically recommended based on your verified competency profile and active role skill gaps.
        </p>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">You are all caught up!</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You currently have no critical skill gaps requiring urgent remediation. Feel free to explore other courses in the catalog.
          </p>
          <Link
            to="/trainee/courses"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-institutional-900 text-white rounded-lg text-xs font-semibold"
          >
            Browse Course Catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((rec) => (
            <div
              key={rec.course_id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden hover:border-teal-300 transition-all"
            >
              <div className="p-6 space-y-4">
                {/* Top Badge Strip */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200">
                      Competency: {rec.primary_competency_name}
                    </span>
                    {rec.gap > 0 && (
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Skill Gap: -{rec.gap} Levels
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-medium text-slate-400 capitalize">
                    Difficulty: <strong className="text-slate-700">{rec.difficulty}</strong>
                  </span>
                </div>

                {/* Course Main Details */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-slate-900 hover:text-institutional-700 transition-colors">
                      <Link to={`/trainee/courses/${rec.course_id}`}>{rec.course_title}</Link>
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                        Trainer: <strong className="text-slate-700">{rec.trainer_name}</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {rec.duration_hours} Training Hours
                      </span>
                      <span>•</span>
                      <span className="text-emerald-700 font-semibold">
                        Expected Improvement: +{rec.expected_improvement} Level
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 pt-2 md:pt-0">
                    {rec.enrolled ? (
                      <Link
                        to={`/trainee/courses/${rec.course_id}`}
                        className="px-4 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        Resume Learning <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <button
                        onClick={() => handleEnroll(rec.course_id)}
                        disabled={enrollingId === rec.course_id}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {enrollingId === rec.course_id ? 'Enrolling...' : 'Enroll & Start Learning'}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* The Explainable Rationale Callout Box */}
                <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                  <div className="p-1 rounded-md bg-teal-100 text-teal-800 shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 block mb-0.5">Why Capacity Connect Recommends This:</span>
                    <p className="text-slate-600 leading-relaxed">{rec.recommendation_reason}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
