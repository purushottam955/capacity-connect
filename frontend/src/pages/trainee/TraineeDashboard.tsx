import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { CompetencyBadge } from '../../components/CompetencyBadge';
import { GapBadge } from '../../components/GapBadge';
import {
  BookOpen,
  Award,
  Target,
  FileCheck2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Clock,
  Compass
} from 'lucide-react';

export const TraineeDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<any>('/trainee/dashboard')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500 font-medium">Loading competency intelligence...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
          {error || 'Unable to retrieve dashboard.'}
        </div>
      </div>
    );
  }

  const { metrics, top_skill_gaps, recommendations, recent_results, user } = data;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Institutional Header Banner */}
      <div className="bg-gradient-to-r from-institutional-900 to-institutional-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-institutional-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30">
            <Target className="w-3.5 h-3.5" />
            Active Role: {user.job_role || 'Meteorologist Grade-I'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome, {user.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            {user.designation} • {user.department}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/trainee/competencies"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <Target className="w-4 h-4 text-teal-300" />
            Competency Profile
          </Link>
          <Link
            to="/trainee/recommendations"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4" />
            Learning Recommendations
          </Link>
        </div>
      </div>

      {/* 4 Core KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Courses in Progress</span>
            <div className="w-8 h-8 rounded-lg bg-institutional-50 text-institutional-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.courses_in_progress}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Active institutional enrollments</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Competencies Met</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {metrics.competencies_met}
            <span className="text-xs text-slate-400 font-normal"> / {metrics.competencies_met + metrics.competencies_gapped}</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">On track with role standards</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Skill Gaps</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.competencies_gapped}</p>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">Targeted learning recommended</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Certificates Earned</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.certificates_earned}</p>
          <span className="text-[11px] text-purple-600 font-medium mt-1 block">Verified MoES credentials</span>
        </div>
      </div>

      {/* Main Grid: Left = Top Skill Gaps & Explainable Recommendations | Right = Quick Learning & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-8">
          {/* Top Skill Gaps Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-4 h-4 text-institutional-600" />
                  Priority Competency Gaps for Your Role
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Benchmarks required for {user.job_role || 'Meteorologist Grade-I'}
                </p>
              </div>
              <Link to="/trainee/competencies" className="text-xs font-semibold text-institutional-600 hover:underline flex items-center gap-1">
                View Full Matrix <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {top_skill_gaps.map((item: any) => (
                <div key={item.competency_id} className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">{item.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{item.code}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-slate-700">Lvl {item.current_level}</span>
                        <span className="text-xs text-slate-400">/ Req Lvl {item.required_level}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">Gap: -{item.gap} Levels</span>
                    </div>
                    <GapBadge gap={item.gap} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Explainable Course Recommendations Section */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  Personalized Learning Recommendations
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Algorithmically curated based on your active skill gaps
                </p>
              </div>
              <Link to="/trainee/recommendations" className="text-xs font-semibold text-teal-600 hover:underline flex items-center gap-1">
                All Recommendations <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {recommendations.slice(0, 2).map((rec: any) => (
                <div key={rec.course_id} className="p-4 bg-teal-50/40 rounded-xl border border-teal-100 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-teal-100 text-teal-800 uppercase tracking-wider">
                        Addresses Gap: {rec.primary_competency_name}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">{rec.course_title}</h4>
                      <p className="text-xs text-slate-500">
                        Instructor: {rec.trainer_name} • Duration: {rec.duration_hours} hrs • Level: {rec.difficulty}
                      </p>
                    </div>

                    <Link
                      to={`/trainee/courses/${rec.course_id}`}
                      className="px-3 py-1.5 bg-institutional-900 hover:bg-institutional-800 text-white text-xs font-semibold rounded-lg shrink-0 transition-colors"
                    >
                      {rec.enrolled ? 'Resume Course' : 'View Course'}
                    </Link>
                  </div>

                  {/* Explainable Reason Box */}
                  <div className="p-2.5 bg-white rounded-lg border border-teal-200/80 text-[11px] text-slate-700 flex items-start gap-2">
                    <span className="font-semibold text-teal-700 shrink-0">Why Recommended:</span>
                    <span>{rec.recommendation_reason}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Recent Results & Shortcuts */}
        <div className="space-y-8">
          {/* Quick Learning Resume */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-institutional-600" />
              Fast Track: Closed-Loop Demo
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Experience the instant closed-loop competency engine: take the Python assessment and see your verified competency score upgrade in real time!
            </p>
            <Link
              to="/trainee/assessments/1/take"
              className="w-full py-2.5 px-4 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <FileCheck2 className="w-4 h-4" />
              Attempt Python Assessment Now
            </Link>
          </div>

          {/* Recent Assessment Attempts */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-institutional-600" />
              Recent Assessment Results
            </h3>

            {recent_results.length === 0 ? (
              <div className="text-center py-6 text-slate-400 text-xs">
                No assessments attempted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {recent_results.map((att: any) => (
                  <div key={att.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-semibold text-slate-800">{att.assessment_title}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(att.submitted_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${att.passed ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {att.percentage}%
                      </span>
                      <span className={`block text-[10px] ${att.passed ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {att.passed ? 'Qualified' : 'Needs Review'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
