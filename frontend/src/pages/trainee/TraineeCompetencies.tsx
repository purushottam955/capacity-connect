import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { CompetencyBadge } from '../../components/CompetencyBadge';
import { GapBadge } from '../../components/GapBadge';
import { SkillGapReport, UserCompetencyItem } from '../../types';
import { Target, CheckCircle2, AlertTriangle, AlertCircle, RefreshCw } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

export const TraineeCompetencies: React.FC = () => {
  const [data, setData] = useState<SkillGapReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const fetchCompetencies = () => {
    setLoading(true);
    api.get<SkillGapReport>('/trainee/competencies')
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCompetencies();
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-500">Loading competency matrix...</p>
        </div>
      </div>
    );
  }

  const categories = ['all', ...Array.from(new Set(data.competencies.map(c => c.category)))];

  const filteredCompetencies = filterCategory === 'all'
    ? data.competencies
    : data.competencies.filter(c => c.category === filterCategory);

  const chartData = data.competencies.map(c => ({
    name: c.name.length > 15 ? c.name.slice(0, 15) + '…' : c.name,
    fullName: c.name,
    'Current Level': c.current_level,
    'Required Benchmark': c.required_level,
    gap: c.gap
  }));

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <Target className="w-6 h-6 text-institutional-600" />
            Trainee Competency Profile
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Required vs Current proficiency levels mapped to your role: <span className="font-semibold text-slate-700">{data.job_role}</span>
          </p>
        </div>

        <button
          onClick={fetchCompetencies}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Profile
        </button>
      </div>

      {/* Chart: Required vs Current Level Comparison */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Competency Benchmark Analysis (Level 1 to 5)
        </h3>
        <p className="text-xs text-slate-500">
          Visual comparison showing where your current verified capability stands relative to organizational expectations.
        </p>

        <div className="h-72 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-lg shadow-xl text-xs space-y-1">
                        <p className="font-bold">{d.fullName}</p>
                        <p className="text-teal-300">Current Level: {d['Current Level']}</p>
                        <p className="text-slate-300">Required Benchmark: {d['Required Benchmark']}</p>
                        <p className="text-amber-300">Skill Gap: {d.gap > 0 ? `-${d.gap} Levels` : 'Met (On Track)'}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Current Level" fill="#0D9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Required Benchmark" fill="#1B365D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Structured Competency Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h3 className="text-sm font-bold text-slate-900">
            Competency Details & Evidence Records ({filteredCompetencies.length})
          </h3>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium capitalize transition-colors cursor-pointer ${
                  filterCategory === cat
                    ? 'bg-institutional-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/60 text-slate-600 font-semibold">
                <th className="py-3 px-4">Competency</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Required Level</th>
                <th className="py-3 px-4 text-center">Current Level</th>
                <th className="py-3 px-4 text-center">Skill Gap</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assessment Source & Evidence</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCompetencies.map((comp) => (
                <tr key={comp.competency_id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div>{comp.name}</div>
                    <span className="text-[10px] font-mono text-slate-400">{comp.code}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{comp.category}</td>
                  <td className="py-3 px-4 text-center">
                    <CompetencyBadge level={comp.required_level} size="sm" showText={false} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <CompetencyBadge level={comp.current_level} size="sm" showText={false} />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`font-bold ${comp.gap > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {comp.gap > 0 ? `-${comp.gap}` : '0'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <GapBadge gap={comp.gap} />
                  </td>
                  <td className="py-3 px-4 text-[11px] text-slate-600 max-w-xs">
                    <p className="font-medium text-slate-800">{comp.assessment_source || 'Baseline'}</p>
                    <p className="text-slate-400 line-clamp-1">{comp.evidence}</p>
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
