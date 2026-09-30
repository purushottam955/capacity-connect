import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { BarChart3, TrendingUp, Users, CheckCircle2, AlertCircle, Award } from 'lucide-react';

export const TrainerPerformance: React.FC = () => {
  const [perf, setPerf] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any>('/trainer/performance')
      .then((data) => {
        setPerf(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !perf) {
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
          <BarChart3 className="w-6 h-6 text-institutional-600" />
          Trainee Performance Analytics & Evaluation
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor learner qualification rates, assessment attempts, and competency progression outcomes.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Attempts Evaluated</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{perf.total_attempts}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-emerald-600">Qualification Pass Rate</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{perf.pass_rate_percent}%</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Average Trainee Score</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{perf.average_score}%</p>
        </div>
      </div>

      {/* Recent Attempts Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-6">
        <h3 className="text-sm font-bold text-slate-900">Recent Trainee Exam Submissions</h3>

        {perf.recent_attempts.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No trainee submissions recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Trainee Name</th>
                  <th className="py-3 px-4">Assessment</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4">Qualification</th>
                  <th className="py-3 px-4">Submitted At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {perf.recent_attempts.map((att: any) => (
                  <tr key={att.attempt_id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{att.trainee_name}</td>
                    <td className="py-3.5 px-4 text-slate-600">{att.assessment_title}</td>
                    <td className="py-3.5 px-4 text-center font-mono">{att.score} pts</td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className={att.passed ? 'text-emerald-700' : 'text-rose-600'}>
                        {att.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {att.passed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Passed (Competency Upgraded)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          Failed (Under 70%)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {new Date(att.submitted_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
