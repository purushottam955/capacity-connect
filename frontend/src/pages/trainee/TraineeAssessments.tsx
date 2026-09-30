import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Assessment } from '../../types';
import { FileCheck2, Clock, CheckCircle2, ArrowRight, Target, AlertCircle } from 'lucide-react';

export const TraineeAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Assessment[]>('/assessments')
      .then((data) => {
        setAssessments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <FileCheck2 className="w-6 h-6 text-institutional-600" />
          Competency Assessment Center
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Standardized multiple-choice examinations directly evaluating competency levels.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {assessments.map((a) => (
          <div
            key={a.id}
            className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-teal-50 text-teal-800 border border-teal-200">
                  Target: Level {a.target_competency_level}
                </span>

                {a.passed ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Passed ({a.best_score}%)
                  </span>
                ) : a.best_score !== null && a.best_score !== undefined ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Retake Needed ({a.best_score}%)
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">Not Attempted</span>
                )}
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-900">{a.title}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{a.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                <div>Questions: <strong>{a.question_count} MCQs</strong></div>
                <div>Passing Score: <strong>{a.passing_score}%</strong></div>
                <div>Time Limit: <strong>{a.time_limit_minutes} Mins</strong></div>
                <div>Course: <strong>{a.course_title || 'Core Program'}</strong></div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                Subject: <strong className="text-slate-700">{a.competency_name || 'Meteorology'}</strong>
              </span>

              <Link
                to={`/trainee/assessments/${a.id}/take`}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold transition-colors"
              >
                {a.passed ? 'Retake Exam' : 'Start Exam'} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
