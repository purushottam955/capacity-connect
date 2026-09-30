import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { BarChart3, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';

export const TraineeResults: React.FC = () => {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/trainee/results')
      .then((data) => {
        setResults(data);
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
          <BarChart3 className="w-6 h-6 text-institutional-600" />
          Assessment Performance History
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Historical records of your examination attempts and validated competency criteria.
        </p>
      </div>

      {results.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          No assessment records found. Take an assessment to see results.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3 px-4">Assessment Title</th>
                  <th className="py-3 px-4">Course</th>
                  <th className="py-3 px-4 text-center">Score</th>
                  <th className="py-3 px-4 text-center">Percentage</th>
                  <th className="py-3 px-4">Evaluation</th>
                  <th className="py-3 px-4">Submitted Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {results.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/80">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{r.assessment_title}</td>
                    <td className="py-3.5 px-4 text-slate-600">{r.course_title || 'Core Program'}</td>
                    <td className="py-3.5 px-4 text-center font-mono">
                      {r.score_obtained} / {r.total_score}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className={r.passed ? 'text-emerald-700' : 'text-rose-600'}>
                        {r.percentage}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {r.passed ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Competency Met
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                          <AlertCircle className="w-3 h-3" />
                          Did Not Qualify
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(r.submitted_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
