import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { SkillGapReport, UserCompetencyItem } from '../../types';
import { GapBadge } from '../../components/GapBadge';
import { CompetencyBadge } from '../../components/CompetencyBadge';
import { AlertTriangle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export const TraineeSkillGaps: React.FC = () => {
  const [data, setData] = useState<SkillGapReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<SkillGapReport>('/trainee/skill-gaps')
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

  const gappedComps = data.competencies.filter(c => c.gap > 0);

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
            Skill Gap Remediation Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Targeted institutional development plan for <span className="font-semibold text-slate-700">{data.job_role}</span>
          </p>
        </div>

        <Link
          to="/trainee/recommendations"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          View Recommended Courses
        </Link>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Evaluated Competencies</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{data.total_competencies}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-amber-600">Active Competency Gaps</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{data.competencies_gapped}</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Average Gap Magnitude</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">-{data.average_gap} Levels</p>
        </div>
      </div>

      {/* Gap Remediation Cards */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Prioritized Gaps Requiring Formal Upgrading ({gappedComps.length})
        </h3>

        {gappedComps.length === 0 ? (
          <div className="p-8 bg-emerald-50 rounded-xl border border-emerald-200 text-center space-y-2">
            <ShieldCheck className="w-10 h-10 text-emerald-600 mx-auto" />
            <h4 className="text-sm font-bold text-emerald-900">All Competencies On Track!</h4>
            <p className="text-xs text-emerald-700">
              You meet or exceed every required proficiency benchmark for your role.
            </p>
          </div>
        ) : (
          gappedComps.map((comp) => (
            <div
              key={comp.competency_id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-300 transition-all"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-base font-bold text-slate-900">{comp.name}</h4>
                  <span className="px-2 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-600 rounded-sm">
                    {comp.code}
                  </span>
                  <GapBadge gap={comp.gap} />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {comp.description}
                </p>
                <div className="text-[11px] text-slate-500 flex items-center gap-3 pt-1">
                  <span>Category: <strong className="text-slate-700">{comp.category}</strong></span>
                  <span>•</span>
                  <span>Assessment: <strong className="text-slate-700">{comp.assessment_source}</strong></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                <div className="text-right space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Current:</span>
                    <CompetencyBadge level={comp.current_level} size="sm" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Required:</span>
                    <CompetencyBadge level={comp.required_level} size="sm" />
                  </div>
                </div>

                <Link
                  to="/trainee/recommendations"
                  className="px-3.5 py-1.5 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  Bridge this Gap <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
