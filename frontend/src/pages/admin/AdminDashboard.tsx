import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import {
  Shield,
  Users,
  GraduationCap,
  Compass,
  BookOpen,
  Award,
  BarChart3,
  GitPullRequest,
  Cpu,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [compAnalytics, setCompAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get<any>('/analytics/overview'),
      api.get<any[]>('/analytics/competencies')
    ]).then(([resStats, resComps]) => {
      setStats(resStats.kpis);
      setCompAnalytics(resComps);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const chartData = compAnalytics.slice(0, 7).map((c) => ({
    name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
    fullName: c.name,
    'Avg Current Level': c.average_current_level,
    'Required Benchmark': c.benchmark_required_level,
    gap: c.gap
  }));

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-institutional-900 to-institutional-950 text-white p-6 sm:p-8 rounded-2xl shadow-sm border border-institutional-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-white/10 text-teal-300 border border-white/20">
            <Shield className="w-3.5 h-3.5" />
            Institutional Capacity Building Directorate
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ministry Capacity Administration
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Ministry of Earth Sciences • India Meteorological Department Overview
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/admin/training-requirements"
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-semibold border border-white/20 transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Training Need
          </Link>
          <Link
            to="/admin/trainer-matching"
            className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold shadow-md transition-colors flex items-center gap-1.5"
          >
            <Cpu className="w-4 h-4" />
            Trainer Matching Engine
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Registered Users</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total_users}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {stats.total_trainees} Trainees • {stats.total_trainers} Trainers
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Active Courses</span>
          <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total_courses}</p>
          <span className="text-[11px] text-teal-600 font-medium mt-0.5 block">
            {stats.total_enrollments} Total Enrollments
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Completion Rate</span>
          <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completion_rate}%</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {stats.certificates_issued} Certificates Issued
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Open Training Needs</span>
          <p className="text-2xl font-bold text-amber-600 mt-1">{stats.open_training_requirements}</p>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            {stats.assigned_training_requirements} Assigned to Trainers
          </span>
        </div>
      </div>

      {/* Main Grid: Competency Gaps Chart & Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Organizational Gap Benchmark Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-institutional-600" />
                Organizational Competency Gap Matrix
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Average current capability vs institutional benchmark across active trainees
              </p>
            </div>
            <Link to="/admin/analytics" className="text-xs font-semibold text-institutional-600 hover:underline">
              Detailed Analytics
            </Link>
          </div>

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
                          <p className="text-teal-300">Avg Current Level: {d['Avg Current Level']}</p>
                          <p className="text-slate-300">Required Benchmark: {d['Required Benchmark']}</p>
                          <p className="text-amber-300">Department Gap: -{d.gap} Levels</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="Avg Current Level" fill="#0D9488" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Required Benchmark" fill="#1B365D" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1 Col: Quick Administrative Workflows */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-600" />
              Trainer Matching Engine
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Match suitable faculty to specialized meteorological requirements using transparent 40/25/20/15 weighted scoring.
            </p>
            <Link
              to="/admin/trainer-matching"
              className="w-full py-2.5 px-4 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              Run Matching Engine <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Governance Shortcuts</h3>
            <div className="space-y-2 text-xs">
              <Link
                to="/admin/users"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-800 font-medium"
              >
                <span>User Directory & Approvals</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/admin/competency-framework"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-800 font-medium"
              >
                <span>Competency Framework & Roles</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                to="/admin/announcements"
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-slate-800 font-medium"
              >
                <span>Broadcast Announcements</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
