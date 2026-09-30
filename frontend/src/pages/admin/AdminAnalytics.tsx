import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { BarChart3, TrendingUp, Users, Target, Building2 } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';

export const AdminAnalytics: React.FC = () => {
  const [compAnalytics, setCompAnalytics] = useState<any[]>([]);
  const [demandData, setDemandData] = useState<any[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any[]>('/analytics/competencies'),
      api.get<any[]>('/analytics/training-demand'),
      api.get<any>('/analytics/overview')
    ]).then(([comps, demand, overview]) => {
      setCompAnalytics(comps);
      setDemandData(demand);
      setKpis(overview.kpis);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !kpis) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const chartData = compAnalytics.map((c) => ({
    name: c.name,
    'Average Level': c.average_current_level,
    'Benchmark Benchmark': c.benchmark_required_level,
    'Skill Gap': c.gap,
    'Trainees Gapped (%)': c.gap_percentage
  }));

  const COLORS = ['#0D9488', '#1B365D', '#D97706', '#E11D48', '#4F46E5'];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <BarChart3 className="w-6 h-6 text-institutional-600" />
          Organizational Competency & Capacity Analytics
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Institutional intelligence monitoring workforce capabilities, department training demands, and pass rates.
        </p>
      </div>

      {/* Top 3 High-Level Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Overall Course Pass Rate</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{kpis.pass_rate}%</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {kpis.assessments_taken} assessments evaluated
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Course Completion Rate</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{kpis.completion_rate}%</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {kpis.total_enrollments} total enrollments
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Verified Credentials Issued</span>
          <p className="text-2xl font-bold text-institutional-700 mt-1">{kpis.certificates_issued}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            MoES & IMD digital certificates
          </span>
        </div>
      </div>

      {/* Competency Gap Analysis Bar Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Institutional Competency Gap Heatmap
          </h3>
          <p className="text-xs text-slate-500">
            Current assessed level versus required benchmark across all operational competencies
          </p>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-15} textAnchor="end" />
              <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey="Average Level" fill="#0D9488" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Benchmark Benchmark" fill="#1B365D" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Structured Competency Matrix Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-6">
        <h3 className="text-sm font-bold text-slate-900">
          Workforce Deficiency Breakdown by Subject
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Competency</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Average Current Level</th>
                <th className="py-3 px-4 text-center">Required Benchmark</th>
                <th className="py-3 px-4 text-center">Institutional Gap</th>
                <th className="py-3 px-4 text-center">Trainees with Active Gaps</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {compAnalytics.map((c) => (
                <tr key={c.competency_id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 text-slate-600">{c.category}</td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                    Lvl {c.average_current_level}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                    Lvl {c.benchmark_required_level}
                  </td>
                  <td className="py-3 px-4 text-center font-bold">
                    <span className={c.gap > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                      {c.gap > 0 ? `-${c.gap} Levels` : '0 (Optimal)'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="font-semibold text-slate-800">{c.trainees_gapped_count} Trainees</span>{' '}
                    <span className="text-[11px] text-slate-400">({c.gap_percentage}%)</span>
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
