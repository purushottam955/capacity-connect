import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { FileCheck2, Bot, Plus, ArrowRight, Eye, CheckCircle2 } from 'lucide-react';

export const TrainerAssessments: React.FC = () => {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/assessments')
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FileCheck2 className="w-6 h-6 text-institutional-600" />
            Assessment & Exam Manager
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review live assessments, configure pass thresholds, or create AI quizzes with human-in-the-loop review.
          </p>
        </div>

        <Link
          to="/trainer/ai-quiz"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Bot className="w-4 h-4" />
          Generate AI Quiz
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3.5 px-4">Assessment Title</th>
                <th className="py-3.5 px-4">Associated Course</th>
                <th className="py-3.5 px-4 text-center">Questions</th>
                <th className="py-3.5 px-4 text-center">Passing Benchmark</th>
                <th className="py-3.5 px-4 text-center">Target Level</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assessments.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{a.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">{a.course_title || 'General'}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold">{a.question_count}</td>
                  <td className="py-3.5 px-4 text-center font-mono font-semibold">{a.passing_score}%</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                      Level {a.target_competency_level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      Published
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/trainer/performance"
                      className="text-xs font-semibold text-institutional-600 hover:underline inline-flex items-center gap-1"
                    >
                      View Attempts <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
