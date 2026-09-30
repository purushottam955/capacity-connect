import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { TrainingRequirement, TrainerMatchResult } from '../../types';
import {
  Cpu,
  UserCheck,
  CheckCircle2,
  Award,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Building2,
  RefreshCw,
  GitPullRequest
} from 'lucide-react';

export const AdminTrainerMatching: React.FC = () => {
  const [requirements, setRequirements] = useState<TrainingRequirement[]>([]);
  const [selectedReqId, setSelectedReqId] = useState<number | ''>('');
  const [selectedReq, setSelectedReq] = useState<TrainingRequirement | null>(null);
  const [matches, setMatches] = useState<TrainerMatchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [assignedMessage, setAssignedMessage] = useState<string | null>(null);

  const fetchRequirements = () => {
    setLoading(true);
    api.get<TrainingRequirement[]>('/training-requirements')
      .then((data) => {
        setRequirements(data);
        if (data.length > 0) {
          setSelectedReqId(data[0].id);
          setSelectedReq(data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchRequirements();
  }, []);

  const runMatching = (reqId: number) => {
    setMatching(true);
    setAssignedMessage(null);
    api.get<any>(`/training-requirements/${reqId}/match-trainers`)
      .then((res) => {
        setMatches(res.matches);
        setMatching(false);
      })
      .catch(() => setMatching(false));
  };

  useEffect(() => {
    if (selectedReqId) {
      const found = requirements.find(r => r.id === selectedReqId) || null;
      setSelectedReq(found);
      runMatching(Number(selectedReqId));
    }
  }, [selectedReqId]);

  const handleAssignTrainer = async (trainerId: number) => {
    if (!selectedReqId) return;
    setAssigningId(trainerId);
    setAssignedMessage(null);
    try {
      const res = await api.post<any>(`/training-requirements/${selectedReqId}/assign-trainer?trainer_id=${trainerId}`);
      setAssignedMessage(res.message);
      // Update local state
      setMatches(prev => prev.map(m => ({ ...m, is_selected: m.trainer_id === trainerId })));
      fetchRequirements();
    } catch {
      alert('Error assigning trainer.');
    } finally {
      setAssigningId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Cpu className="w-6 h-6 text-teal-600" />
          Competency-Based Trainer Matching Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Transparent 40/25/20/15 weighted matching algorithm pairing institutional training needs with verified faculty competencies.
        </p>
      </div>

      {/* Requirement Selector & Summary Box */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Institutional Training Requirement:
            </label>
            <select
              value={selectedReqId}
              onChange={(e) => setSelectedReqId(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 font-semibold"
            >
              {requirements.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.department}) - Status: {r.status}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => selectedReqId && runMatching(Number(selectedReqId))}
            disabled={matching}
            className="px-4 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors self-end cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${matching ? 'animate-spin' : ''}`} />
            Re-calculate Match Scores
          </button>
        </div>

        {selectedReq && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold text-slate-900">{selectedReq.title}</span>
              <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-white border border-slate-200 uppercase">
                {selectedReq.subject}
              </span>
            </div>
            <p className="text-xs text-slate-600">{selectedReq.description}</p>

            <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-6 text-[11px] text-slate-600">
              <span>Department: <strong>{selectedReq.department}</strong></span>
              <span>•</span>
              <span>Min Experience: <strong>{selectedReq.required_experience_years} Years</strong></span>
              <span>•</span>
              <span>Program Duration: <strong>{selectedReq.duration_days} Days</strong></span>
            </div>

            {selectedReq.required_competencies && selectedReq.required_competencies.length > 0 && (
              <div className="pt-2 flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500 mr-1">Required Competencies:</span>
                {selectedReq.required_competencies.map((rc) => (
                  <span
                    key={rc.competency_id}
                    className="px-2 py-0.5 rounded-xs text-[10px] bg-teal-50 text-teal-800 border border-teal-200"
                  >
                    {rc.name} (Req Level {rc.required_level})
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {assignedMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{assignedMessage}</span>
        </div>
      )}

      {/* Algorithm Scoring Model Legend */}
      <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
          Transparent Weighted Scoring Model Breakdown
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-2.5 rounded-lg bg-institutional-50/60 border border-institutional-200">
            <span className="font-bold text-institutional-900 block">40% Competency Coverage</span>
            <span className="text-[10px] text-slate-500">Verified domain levels & syllabus tags</span>
          </div>
          <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-200">
            <span className="font-bold text-teal-900 block">25% Subject Expertise</span>
            <span className="text-[10px] text-slate-500">Thematic radar, NWP, satellite matching</span>
          </div>
          <div className="p-2.5 rounded-lg bg-sky-50/60 border border-sky-200">
            <span className="font-bold text-sky-900 block">20% Relevant Experience</span>
            <span className="text-[10px] text-slate-500">Operational forecasting years</span>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-200">
            <span className="font-bold text-amber-900 block">15% Certifications & Rating</span>
            <span className="text-[10px] text-slate-500">WMO credentials & pedagogical rating</span>
          </div>
        </div>
      </div>

      {/* Ranked Trainer Matches */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">
            Ranked & Evaluated Faculty Candidates ({matches.length})
          </h3>
          <span className="text-xs text-slate-400">Ranked by algorithm match score descending</span>
        </div>

        {matching ? (
          <div className="p-12 bg-white rounded-xl border border-slate-200 text-center">
            <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-500 mt-2">Evaluating faculty competency matrix...</p>
          </div>
        ) : matches.length === 0 ? (
          <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
            No trainers currently matched for this requirement.
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((trainer, index) => (
              <div
                key={trainer.trainer_id}
                className={`p-6 rounded-xl border transition-all ${
                  trainer.is_selected
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-sm'
                    : 'bg-white border-slate-200 shadow-2xs hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left Column: Trainer Bio & Score */}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-institutional-900 text-white font-bold text-xs flex items-center justify-center">
                        #{index + 1}
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          {trainer.trainer_name}
                          {trainer.is_selected && (
                            <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Assigned Lead Trainer
                            </span>
                          )}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {trainer.designation} • {trainer.department}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 flex flex-wrap items-center gap-4">
                      <span>Qualifications: <strong>{trainer.qualifications}</strong></span>
                      <span>•</span>
                      <span>Experience: <strong>{trainer.experience_years} Years</strong></span>
                      <span>•</span>
                      <span>Rating: <strong className="text-amber-600">★ {trainer.rating}</strong></span>
                      <span>•</span>
                      <span>Trainings Delivered: <strong>{trainer.total_trainings_delivered}</strong></span>
                    </div>

                    {/* Transparent Bulleted Reasons */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                        Explainable Algorithmic Justifications:
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {trainer.match_reasons.map((r, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 shrink-0 font-bold">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Right Column: Score Breakdown & Action */}
                  <div className="lg:w-72 shrink-0 space-y-4 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">Match Score</span>
                        <span className="text-3xl font-extrabold text-institutional-900">
                          {trainer.overall_match_score}%
                        </span>
                      </div>

                      {/* 4-Bar Mini Breakdown */}
                      <div className="space-y-1.5 text-[11px]">
                        <div>
                          <div className="flex justify-between text-slate-500 mb-0.5">
                            <span>Competency (40%):</span>
                            <strong>{trainer.competency_score} / 40</strong>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-institutional-600 rounded-full" style={{ width: `${(trainer.competency_score / 40) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-500 mb-0.5">
                            <span>Subject (25%):</span>
                            <strong>{trainer.subject_score} / 25</strong>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-teal-600 rounded-full" style={{ width: `${(trainer.subject_score / 25) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-500 mb-0.5">
                            <span>Experience (20%):</span>
                            <strong>{trainer.experience_score} / 20</strong>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-600 rounded-full" style={{ width: `${(trainer.experience_score / 20) * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-500 mb-0.5">
                            <span>Certification (15%):</span>
                            <strong>{trainer.certification_score} / 15</strong>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-600 rounded-full" style={{ width: `${(trainer.certification_score / 15) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      {trainer.is_selected ? (
                        <div className="w-full py-2 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg text-center border border-emerald-300">
                          Selected & Assigned
                        </div>
                      ) : (
                        <button
                          onClick={() => handleAssignTrainer(trainer.trainer_id)}
                          disabled={assigningId === trainer.trainer_id}
                          className="w-full py-2.5 bg-institutional-900 hover:bg-institutional-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4 text-teal-400" />
                          {assigningId === trainer.trainer_id ? 'Assigning...' : 'Assign as Lead Faculty'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
