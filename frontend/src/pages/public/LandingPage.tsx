import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Compass,
  Award,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  BarChart3,
  BrainCircuit,
  GraduationCap
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { switchRole } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role: 'trainee' | 'trainer' | 'admin') => {
    await switchRole(role);
    if (role === 'trainee') navigate('/trainee/dashboard');
    else if (role === 'trainer') navigate('/trainer/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Banner */}
      <div className="bg-institutional-950 text-slate-300 px-4 py-2 text-xs border-b border-institutional-800 text-center flex items-center justify-center gap-2">
        <span className="font-semibold text-teal-400">SIH 2026 Problem Statement 26075</span>
        <span className="text-slate-500">•</span>
        <span>Ministry of Earth Sciences (MoES)</span>
        <span className="text-slate-500">•</span>
        <span>India Meteorological Department (IMD)</span>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-institutional-900 to-institutional-950 text-white py-16 sm:py-24 border-b border-institutional-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-300 border border-teal-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Digital Capacity Building & Competency Intelligence
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight max-w-4xl mx-auto leading-tight">
            CAPACITY CONNECT
          </h1>
          <p className="text-lg sm:text-2xl font-light text-slate-300 tracking-wide max-w-2xl mx-auto">
            “Connecting People, Competencies and Learning.”
          </p>
          <p className="text-sm sm:text-base text-slate-400 max-w-3xl mx-auto leading-relaxed">
            Capacity Connect elevates ordinary LMS paradigms into an institutional capacity-building ecosystem.
            We map role requirements, pinpoint individual skill gaps, recommend tailored learning, update competencies
            upon verified assessment, and match optimal trainers using explainable intelligence.
          </p>

          {/* Quick Demo Access Bar */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => handleQuickDemo('trainee')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs sm:text-sm font-semibold shadow-md transition-colors cursor-pointer"
            >
              <GraduationCap className="w-4 h-4" />
              Demo as Trainee
            </button>
            <button
              onClick={() => handleQuickDemo('trainer')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-institutional-700 hover:bg-institutional-600 text-white text-xs sm:text-sm font-semibold border border-institutional-500 shadow-md transition-colors cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              Demo as Trainer
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold border border-slate-600 shadow-md transition-colors cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              Demo as Admin
            </button>
          </div>
        </div>
      </section>

      {/* The Central Closed Loop Architecture Diagram */}
      <section className="py-16 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-institutional-600">
            End-to-End Institutional Logic
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            How Capacity Connect Solves the Skill Gap
          </h2>
          <p className="text-sm text-slate-500 max-w-2xl mx-auto">
            A closed-loop system connecting learner skill deficiency, tailored course curriculum,
            automated assessment scoring, and dynamic competency progression.
          </p>
        </div>

        {/* Diagram 1: Trainee Competency Loop */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              The Closed-Loop Competency Progression Cycle (Trainee Flow)
            </h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
            {[
              { step: '01', title: 'Role Profile', desc: 'Job role standards defined with target level benchmarks' },
              { step: '02', title: 'Competency Map', desc: 'Current assessed level compared against role expectations' },
              { step: '03', title: 'Skill Gap', desc: 'Explainable gap calculated (e.g. Req: 4, Curr: 2 → Gap: 2)' },
              { step: '04', title: 'Smart Learning', desc: 'Curriculum recommended specifically targeting the gap' },
              { step: '05', title: 'Assessment', desc: 'Subject MCQ test evaluated with auto-scoring' },
              { step: '06', title: 'Level Upgrade', desc: 'Database updates competency level automatically upon ≥70%' },
              { step: '07', title: 'Next Action', desc: 'New recommendations refresh with closing gap feedback' },
            ].map((node, i) => (
              <div key={node.step} className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 flex flex-col justify-between">
                <div>
                  <span className="text-[11px] font-mono font-bold text-institutional-600 block mb-1">
                    {node.step}
                  </span>
                  <h4 className="text-xs font-bold text-slate-800">{node.title}</h4>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">{node.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Diagram 2: Trainer Matching Algorithm */}
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-2.5 h-2.5 rounded-full bg-institutional-600" />
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              The Transparent Weighted Trainer Matching Engine (Admin Flow)
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 bg-institutional-50/60 rounded-lg border border-institutional-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-institutional-900">Competency Match</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-institutional-600 text-white rounded-md">40%</span>
              </div>
              <p className="text-xs text-slate-600">
                Direct alignment of trainer’s verified competencies and levels with required program syllabus.
              </p>
            </div>

            <div className="p-4 bg-teal-50/60 rounded-lg border border-teal-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal-900">Subject Expertise</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-teal-600 text-white rounded-md">25%</span>
              </div>
              <p className="text-xs text-slate-600">
                Core domain background in radar, NWP modeling, satellite imagery, or climate data analytics.
              </p>
            </div>

            <div className="p-4 bg-sky-50/60 rounded-lg border border-sky-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-sky-900">Relevant Experience</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-sky-600 text-white rounded-md">20%</span>
              </div>
              <p className="text-xs text-slate-600">
                Total years of operational forecasting or research delivery surpassing requirement minimums.
              </p>
            </div>

            <div className="p-4 bg-amber-50/60 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-900">Certifications & Rating</span>
                <span className="text-xs font-bold px-2 py-0.5 bg-amber-600 text-white rounded-md">15%</span>
              </div>
              <p className="text-xs text-slate-600">
                WMO pedagogical instructor credentials, IMD certifications, and trainee review ratings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Role Feature Overview */}
      <section className="bg-slate-100 py-16 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
              Role-Specific Capacities
            </h2>
            <p className="text-sm text-slate-500">
              Tailored workspaces specifically designed for operational meteorologists, subject matter faculty, and departmental directors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trainee Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Trainee Portal</h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">✓ Competency matrix with required vs current levels</li>
                  <li className="flex items-center gap-2">✓ Explainable course recommendations targeting gaps</li>
                  <li className="flex items-center gap-2">✓ Study materials: NetCDF guides, slides, lectures</li>
                  <li className="flex items-center gap-2">✓ Interactive MCQ assessments with timed tests</li>
                  <li className="flex items-center gap-2">✓ Verifiable tamper-evident certificates</li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemo('trainee')}
                className="mt-6 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Enter Trainee Portal <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Trainer Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-institutional-100 text-institutional-700 flex items-center justify-center font-bold">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Trainer Portal</h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">✓ Program curriculum & course creation</li>
                  <li className="flex items-center gap-2">✓ Resource library (PDF, PPTX, lecture video links)</li>
                  <li className="flex items-center gap-2">✓ AI-assisted MCQ generator with human review</li>
                  <li className="flex items-center gap-2">✓ Trainee attempt analytics & score distribution</li>
                  <li className="flex items-center gap-2">✓ Organizational training requirement matching</li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemo('trainer')}
                className="mt-6 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Enter Trainer Portal <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Admin Card */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Admin Portal</h3>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">✓ Organizational competency framework & levels</li>
                  <li className="flex items-center gap-2">✓ Create institutional training requirements</li>
                  <li className="flex items-center gap-2">✓ Run 40/25/20/15 Trainer Matching Engine</li>
                  <li className="flex items-center gap-2">✓ User directory and role-based access control</li>
                  <li className="flex items-center gap-2">✓ Departmental competency gap analytics</li>
                </ul>
              </div>
              <button
                onClick={() => handleQuickDemo('admin')}
                className="mt-6 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                Enter Admin Portal <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto bg-slate-900 text-slate-400 py-8 border-t border-slate-800 text-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <p className="font-semibold text-slate-200">CAPACITY CONNECT</p>
            <p className="text-slate-500">Ministry of Earth Sciences • India Meteorological Department</p>
          </div>
          <div className="text-center sm:text-right text-slate-500">
            <p>Smart India Hackathon 2026 • Problem Statement ID 26075</p>
            <p>Theme: Smart Education | Category: Software</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
