import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { GitPullRequest, Award, CheckCircle2, Clock, Building2 } from 'lucide-react';

export const TrainerTrainingRequests: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/trainer/training-requests')
      .then((data) => {
        setRequests(data);
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
          <GitPullRequest className="w-6 h-6 text-institutional-600" />
          Institutional Training Requirements & Matches
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Open capacity-building training requirements where the admin matching engine selected your competency profile.
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          No training requirements matched at this time.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {requests.map((req) => (
            <div
              key={req.requirement_id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                    {req.subject}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-institutional-50 text-institutional-800 border border-institutional-200">
                    {req.match_score}% Match Score
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{req.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5" />
                    Target Dept: <strong className="text-slate-700">{req.department}</strong>
                  </p>
                </div>

                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>Required Experience: <strong>{req.required_experience_years} Years</strong></div>
                  <div>Planned Duration: <strong>{req.duration_days} Days</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Status: <strong className="text-slate-700 capitalize">{req.status}</strong>
                </span>

                {req.is_selected ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Assigned Lead Faculty
                  </span>
                ) : (
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                    Candidate Shortlist
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
