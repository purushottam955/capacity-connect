import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { TrainingRequirement, Competency } from '../../types';
import { GitPullRequest, Plus, Cpu, ArrowRight, CheckCircle2, Clock } from 'lucide-react';

export const AdminTrainingRequirements: React.FC = () => {
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<TrainingRequirement[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('National Weather Forecasting Centre, New Delhi');
  const [experienceYears, setExperienceYears] = useState(5);
  const [durationDays, setDurationDays] = useState(5);
  const [selectedComps, setSelectedComps] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    Promise.all([
      api.get<TrainingRequirement[]>('/training-requirements'),
      api.get<Competency[]>('/competencies')
    ]).then(([reqs, comps]) => {
      setRequirements(reqs);
      setCompetencies(comps);
      if (comps.length > 0) {
        setSelectedComps({ [comps[0].id]: 4 });
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const toggleComp = (id: number) => {
    setSelectedComps((prev) => {
      const copy = { ...prev };
      if (copy[id]) {
        delete copy[id];
      } else {
        copy[id] = 4;
      }
      return copy;
    });
  };

  const handleLevelChange = (id: number, lvl: number) => {
    setSelectedComps((prev) => ({ ...prev, [id]: lvl }));
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !subject || !description) return;
    setSubmitting(true);
    try {
      const compReqs = Object.entries(selectedComps).map(([k, v]) => ({
        competency_id: Number(k),
        required_level: v
      }));

      const res = await api.post<any>('/training-requirements', {
        title,
        subject,
        description,
        department,
        required_experience_years: experienceYears,
        duration_days: durationDays,
        competency_requirements: compReqs
      });

      setShowCreate(false);
      setTitle('');
      setSubject('');
      setDescription('');
      fetchAll();
      // Navigate to matching
      navigate('/admin/trainer-matching');
    } catch {
      alert('Error creating requirement');
    } finally {
      setSubmitting(false);
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
            <GitPullRequest className="w-6 h-6 text-institutional-600" />
            Institutional Training Requirements
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Define upcoming organizational capacity building programs and match accredited faculty.
          </p>
        </div>

        <button
          onClick={() => setShowCreate(!showCreate)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {showCreate ? 'Close Form' : 'Create Training Requirement'}
        </button>
      </div>

      {/* Creation Modal / Panel */}
      {showCreate && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-institutional-200 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="text-sm font-bold text-slate-900">Define Training Requirement</h3>
            <p className="text-xs text-slate-500">
              The matching engine will immediately evaluate trainer profiles against these competencies.
            </p>
          </div>

          <form onSubmit={handleCreateSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Training Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Tropical Cyclone Rapid Intensification Analysis"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Matter *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Radar & Satellite Synoptic Dynamics"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Min Required Experience (Years)</label>
                <input
                  type="number"
                  min="1"
                  max="40"
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (Days)</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={durationDays}
                  onChange={(e) => setDurationDays(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Program Description & Objectives</label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Comprehensive technical goals, target audience, and operational impact..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            {/* Competency Requirements */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-bold text-slate-900">
                Required Competencies & Target Levels (used for 40% algorithm match)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {competencies.map((c) => {
                  const isChecked = !!selectedComps[c.id];
                  return (
                    <div
                      key={c.id}
                      className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                        isChecked ? 'bg-teal-50 border-teal-300' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleComp(c.id)}
                          className="w-4 h-4 text-teal-600 rounded-xs"
                        />
                        <span className="font-semibold text-slate-800">{c.name}</span>
                      </label>
                      {isChecked && (
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500">Req:</span>
                          <select
                            value={selectedComps[c.id]}
                            onChange={(e) => handleLevelChange(c.id, parseInt(e.target.value))}
                            className="px-1.5 py-0.5 text-xs bg-white border border-teal-300 rounded-md font-bold text-teal-900"
                          >
                            <option value={2}>Lvl 2</option>
                            <option value={3}>Lvl 3</option>
                            <option value={4}>Lvl 4</option>
                            <option value={5}>Lvl 5</option>
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold"
              >
                {submitting ? 'Creating & Matching...' : 'Save & Run Matching'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Requirements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3.5 px-4">Training Program Title</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Target Department</th>
                <th className="py-3.5 px-4">Assigned Faculty</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Matching Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requirements.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{r.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.subject}</td>
                  <td className="py-3.5 px-4 text-slate-600">{r.department}</td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">
                    {r.assigned_trainer_name ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {r.assigned_trainer_name}
                      </span>
                    ) : (
                      <span className="text-slate-400">Unassigned</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="capitalize px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {r.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/admin/trainer-matching"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-institutional-900 hover:bg-institutional-800 text-white rounded-md text-xs font-semibold transition-colors"
                    >
                      <Cpu className="w-3.5 h-3.5 text-teal-400" />
                      Run Matching
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
