import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Competency } from '../../types';
import { BookOpen, Plus, Save, ArrowRight } from 'lucide-react';

export const TrainerCourseCreate: React.FC = () => {
  const navigate = useNavigate();
  const [competencies, setCompetencies] = useState<Competency[]>([]);

  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Data & Computing');
  const [difficulty, setDifficulty] = useState('intermediate');
  const [durationHours, setDurationHours] = useState(12.0);
  const [description, setDescription] = useState('');
  const [objectives, setObjectives] = useState('');
  const [prerequisites, setPrerequisites] = useState('Basic atmospheric thermodynamics.');

  const [selectedCompetencies, setSelectedCompetencies] = useState<number[]>([]);
  const [targetLevels, setTargetLevels] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Competency[]>('/competencies').then((data) => {
      setCompetencies(data);
      if (data.length > 0) {
        setSelectedCompetencies([data[0].id]);
        setTargetLevels({ [data[0].id]: 4 });
      }
    });
  }, []);

  const toggleCompetency = (compId: number) => {
    setSelectedCompetencies((prev) => {
      if (prev.includes(compId)) {
        return prev.filter((id) => id !== compId);
      } else {
        setTargetLevels((levels) => ({ ...levels, [compId]: levels[compId] || 3 }));
        return [...prev, compId];
      }
    });
  };

  const handleLevelChange = (compId: number, level: number) => {
    setTargetLevels((prev) => ({ ...prev, [compId]: level }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !subject) {
      alert('Please fill out all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/courses', {
        title,
        description,
        subject,
        category,
        difficulty,
        duration_hours: Number(durationHours),
        objectives,
        prerequisites,
        competency_ids: selectedCompetencies,
        target_levels: selectedCompetencies.map((id) => targetLevels[id] || 3)
      });
      navigate('/trainer/courses');
    } catch {
      alert('Error creating course.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-4xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-institutional-600" />
          Create New Competency Course
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Define institutional objectives and map targeted competency proficiency benchmarks.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Course Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Satellite Meteorology & INSAT-3DR Operational Processing"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Subject Area *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Earth Observation & Satellite Data"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Curriculum Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="Data & Computing">Data & Computing</option>
                <option value="Core Meteorology">Core Meteorology</option>
                <option value="Earth Observation">Earth Observation</option>
                <option value="Public & Institutional">Public & Institutional</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Duration (Hours)</label>
              <input
                type="number"
                min="1"
                max="120"
                value={durationHours}
                onChange={(e) => setDurationHours(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Course Description & Summary *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outline the core practical skills, tools, and meteorological scenarios covered..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          {/* Competency Mapping Box */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-900">
                Mapped Competencies & Target Proficiency Benchmarks
              </label>
              <p className="text-[11px] text-slate-500">
                Select competencies that this course develops and set target proficiency levels.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto p-1">
              {competencies.map((comp) => {
                const isSelected = selectedCompetencies.includes(comp.id);
                return (
                  <div
                    key={comp.id}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-teal-50/70 border-teal-300'
                        : 'bg-slate-50 border-slate-200'
                    }`}
                  >
                    <label className="flex items-center gap-2.5 cursor-pointer flex-1">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleCompetency(comp.id)}
                        className="w-4 h-4 text-teal-600 rounded-xs"
                      />
                      <div>
                        <span className="font-semibold text-slate-800 block">{comp.name}</span>
                        <span className="text-[10px] text-slate-400">{comp.category}</span>
                      </div>
                    </label>

                    {isSelected && (
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-[10px] text-slate-500">Target:</span>
                        <select
                          value={targetLevels[comp.id] || 3}
                          onChange={(e) => handleLevelChange(comp.id, parseInt(e.target.value))}
                          className="px-2 py-0.5 text-xs bg-white border border-teal-300 rounded-md font-semibold text-teal-900"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Prerequisites</label>
              <input
                type="text"
                value={prerequisites}
                onChange={(e) => setPrerequisites(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Learning Objectives</label>
              <input
                type="text"
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                placeholder="Hands-on xarray NetCDF ingestion"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/trainer/courses')}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {submitting ? 'Creating Course...' : 'Publish Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
