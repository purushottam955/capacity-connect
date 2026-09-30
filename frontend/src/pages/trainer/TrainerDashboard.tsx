import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Compass,
  BookOpen,
  Users,
  FileCheck2,
  Bot,
  FolderOpen,
  GitPullRequest,
  ArrowRight,
  Star,
  Award,
  Plus
} from 'lucide-react';

export const TrainerDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/trainer/dashboard')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { trainer, metrics, courses, training_opportunities } = data;

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-institutional-900 to-institutional-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-institutional-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Star className="w-3.5 h-3.5 fill-current" />
            Trainer Rating: {trainer.rating || 4.9} / 5.0 • {trainer.trainings_delivered} Programs Delivered
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Faculty Workspace: {trainer.full_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {trainer.designation} • {trainer.experience_years} Years Experience
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/trainer/courses/create"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Create Course
          </Link>
          <Link
            to="/trainer/ai-quiz"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4" />
            AI Quiz Generator
          </Link>
        </div>
      </div>

      {/* 4 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Courses</span>
            <div className="w-8 h-8 rounded-lg bg-institutional-50 text-institutional-700 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.active_courses}</p>
          <span className="text-[11px] text-slate-400 mt-1 block">Curriculum programs published</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Enrolled Trainees</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.enrolled_trainees}</p>
          <span className="text-[11px] text-teal-600 font-medium mt-1 block">Active learners across courses</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Assessments Created</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.assessments_created}</p>
          <span className="text-[11px] text-purple-600 font-medium mt-1 block">Standardized MCQ exams</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Attempts Evaluated</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{metrics.trainee_attempts_evaluated}</p>
          <span className="text-[11px] text-amber-600 font-medium mt-1 block">Automated auto-score records</span>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: My Courses */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-institutional-600" />
                  My Managed Courses & Modules
                </h3>
                <p className="text-xs text-slate-500">Your published instructional curriculum</p>
              </div>
              <Link to="/trainer/courses" className="text-xs font-semibold text-institutional-600 hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {courses.map((c: any) => (
                <div
                  key={c.id}
                  className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-700">
                      {c.subject}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900">{c.title}</h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>Enrollments: <strong>{c.enrollments}</strong></span>
                      <span>•</span>
                      <span>Resources: <strong>{c.resources_count}</strong></span>
                      <span>•</span>
                      <span>Assessments: <strong>{c.assessments_count}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Link
                      to="/trainer/resources"
                      className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-300 transition-colors"
                    >
                      Resources
                    </Link>
                    <Link
                      to="/trainer/ai-quiz"
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      Add Quiz
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Training Requirements Matched */}
        <div className="space-y-8">
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GitPullRequest className="w-4 h-4 text-institutional-600" />
              Institutional Training Matches
            </h3>
            <p className="text-xs text-slate-500">
              Training requirements where the matching engine identified your competency profile.
            </p>

            {training_opportunities.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No open matching requests.</p>
            ) : (
              <div className="space-y-3">
                {training_opportunities.map((opp: any) => (
                  <div
                    key={opp.requirement_id}
                    className="p-3 bg-institutional-50/50 rounded-lg border border-institutional-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 line-clamp-1">{opp.title}</span>
                      <span className="px-1.5 py-0.5 rounded-sm text-[10px] font-bold bg-institutional-600 text-white">
                        {opp.match_score}% Match
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">{opp.department}</p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                      <span>Status: {opp.is_selected ? 'Assigned to You' : 'Evaluating Candidates'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <Link
              to="/trainer/training-requests"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              View Training Requirements <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
