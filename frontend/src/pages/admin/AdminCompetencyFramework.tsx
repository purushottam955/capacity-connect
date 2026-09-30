import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Competency, JobRoleResponse } from '../../types';
import { Target, Plus, CheckCircle2, Layers, Briefcase, BookOpen } from 'lucide-react';
import { CompetencyBadge } from '../../components/CompetencyBadge';

export const AdminCompetencyFramework: React.FC = () => {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [jobRoles, setJobRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // New Competency Form
  const [showAddComp, setShowAddComp] = useState(false);
  const [compName, setCompName] = useState('');
  const [compCode, setCompCode] = useState('');
  const [compCategory, setCompCategory] = useState('Core Meteorology');
  const [compDesc, setCompDesc] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchFramework = () => {
    setLoading(true);
    Promise.all([
      api.get<Competency[]>('/competencies'),
      api.get<any[]>('/job-roles')
    ]).then(([comps, roles]) => {
      setCompetencies(comps);
      setJobRoles(roles);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchFramework();
  }, []);

  const handleAddCompetency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !compCode) return;
    setCreating(true);
    try {
      await api.post('/competencies', {
        name: compName,
        code: compCode,
        category: compCategory,
        description: compDesc,
        max_level: 5
      });
      setShowAddComp(false);
      setCompName('');
      setCompCode('');
      setCompDesc('');
      fetchFramework();
    } catch {
      alert('Error creating competency');
    } finally {
      setCreating(false);
    }
  };

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
            <Target className="w-6 h-6 text-institutional-600" />
            Institutional Competency Framework
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Hierarchical structure defining job role expectations, proficiency levels, and required capabilities.
          </p>
        </div>

        <button
          onClick={() => setShowAddComp(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Competency to Framework
        </button>
      </div>

      {/* Add Competency Modal */}
      {showAddComp && (
        <div className="p-6 bg-white rounded-xl border border-institutional-200 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Define New Competency</h3>
            <button onClick={() => setShowAddComp(false)} className="text-xs text-slate-400 hover:text-slate-600">Cancel</button>
          </div>
          <form onSubmit={handleAddCompetency} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Competency Name *</label>
                <input
                  type="text"
                  required
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. Atmospheric Chemistry"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Code *</label>
                <input
                  type="text"
                  required
                  value={compCode}
                  onChange={(e) => setCompCode(e.target.value)}
                  placeholder="e.g. COMP-AC"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={compCategory}
                  onChange={(e) => setCompCategory(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="Core Meteorology">Core Meteorology</option>
                  <option value="Data & Computing">Data & Computing</option>
                  <option value="Earth Observation">Earth Observation</option>
                  <option value="Public & Institutional">Public & Institutional</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={compDesc}
                onChange={(e) => setCompDesc(e.target.value)}
                placeholder="Scope of proficiency and operational applications..."
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="px-4 py-2 bg-institutional-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              {creating ? 'Saving...' : 'Save Competency'}
            </button>
          </form>
        </div>
      )}

      {/* Competencies Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-4 p-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Layers className="w-4 h-4 text-institutional-600" />
          Competency Repository ({competencies.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Max Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {competencies.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{c.code}</td>
                  <td className="py-3 px-4 text-slate-600">{c.category}</td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm">{c.description}</td>
                  <td className="py-3 px-4 text-center font-bold text-institutional-900">
                    Level {c.max_level}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Roles & Mapped Benchmark Requirements */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-6 p-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-institutional-600" />
          Job Role Competency Mappings & Benchmarks ({jobRoles.length})
        </h3>

        <div className="space-y-6">
          {jobRoles.map((role) => (
            <div key={role.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{role.title}</h4>
                  <p className="text-xs text-slate-500">{role.description}</p>
                </div>
                <span className="font-mono text-[11px] px-2 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-600 font-semibold">
                  {role.code}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">
                  Role Required Competency Benchmarks:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {role.required_competencies.map((rc: any) => (
                    <div
                      key={rc.competency_id}
                      className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-800 block">{rc.competency_name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{rc.importance} importance</span>
                      </div>
                      <CompetencyBadge level={rc.required_level} size="sm" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
