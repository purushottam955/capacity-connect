import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Assessment, Question, AssessmentResult } from '../../types';
import { Clock, AlertCircle, CheckCircle2, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { CertificateModal } from '../../components/CertificateModal';

export const TakeAssessmentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [assessment, setAssessment] = useState<Assessment | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState(1200); // 20 mins
  const [showCertificateModal, setShowCertificateModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    api.get<Assessment>(`/assessments/${id}`)
      .then((data) => {
        setAssessment(data);
        setTimeLeftSeconds((data.time_limit_minutes || 20) * 60);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!assessment || result) return;
    const timer = setInterval(() => {
      setTimeLeftSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [assessment, result]);

  const handleOptionSelect = (questionId: number, optionKey: string) => {
    if (result) return; // Prevent modifying after submission
    setAnswers((prev) => ({ ...prev, [questionId]: optionKey }));
  };

  const handleSubmit = async () => {
    if (!id || submitting) return;
    setSubmitting(true);
    try {
      const res = await api.post<AssessmentResult>(`/assessments/${id}/submit`, {
        answers
      });
      setResult(res);
    } catch (err) {
      alert('Error submitting assessment.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !assessment) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const questions = assessment.questions || [];
  const answeredCount = Object.keys(answers).length;
  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-4xl mx-auto">
      {/* Test Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700">
            {assessment.competency_name || 'Meteorology Assessment'}
          </span>
          <h1 className="text-xl font-bold text-slate-900 mt-1">{assessment.title}</h1>
          <p className="text-xs text-slate-500">
            Passing Criteria: <strong className="text-slate-800">{assessment.passing_score}%</strong> • Target Level: <strong className="text-slate-800">{assessment.target_competency_level}</strong>
          </p>
        </div>

        {!result && (
          <div className="flex items-center gap-4 shrink-0 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <Clock className="w-4 h-4 text-amber-600" />
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-medium block">Time Remaining</span>
              <span className="text-base font-mono font-bold text-slate-800">
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* CLOSED-LOOP RESULTS SCREEN (If Submitted) */}
      {result && (
        <div className="space-y-6">
          {/* Main Result Card */}
          <div className={`p-6 sm:p-8 rounded-xl border shadow-sm ${
            result.passed
              ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
              : 'bg-rose-50/70 border-rose-300 text-rose-950'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-current/15">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {result.passed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-700" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-rose-700" />
                  )}
                  <h2 className="text-2xl font-bold">
                    {result.passed ? 'Assessment Passed • Competency Qualified!' : 'Benchmark Not Met'}
                  </h2>
                </div>
                <p className="text-xs opacity-80">{result.feedback_message}</p>
              </div>

              <div className="text-right">
                <span className="text-3xl font-extrabold">{result.percentage}%</span>
                <span className="text-xs opacity-70 block">
                  Score: {result.score_obtained} / {result.total_score} pts
                </span>
              </div>
            </div>

            {/* CLOSED-LOOP REAL-TIME COMPETENCY UPGRADE BANNER */}
            {result.competency_updated && (
              <div className="mt-6 p-4 rounded-lg bg-white/90 border border-emerald-400 text-slate-800 shadow-sm space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                    Closed-Loop Competency Engine Update Confirmed
                  </h4>
                </div>
                <p className="text-xs text-slate-700">
                  Your verified competency in <strong className="text-institutional-900">{result.competency_name}</strong> has officially been upgraded from{' '}
                  <span className="font-bold line-through text-slate-400">Level {result.previous_level}</span> to{' '}
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                    Level {result.new_level}
                  </span> in the institutional database!
                </p>
              </div>
            )}

            {/* Certificate Awarded Callout */}
            {result.certificate_awarded && (
              <div className="mt-4 p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-amber-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold">Verifiable Certificate Issued!</h4>
                    <p className="text-[11px] text-amber-800">Certificate ID: {result.certificate_code}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCertificateModal(true)}
                  className="px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-md shrink-0 cursor-pointer shadow-xs"
                >
                  View Official Certificate
                </button>
              </div>
            )}

            <div className="pt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate('/trainee/competencies')}
                className="px-4 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold"
              >
                Inspect Updated Competency Matrix
              </button>
              <button
                onClick={() => navigate('/trainee/recommendations')}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold border border-slate-300"
              >
                View Next Learning Action
              </button>
            </div>
          </div>

          {/* Question Breakdown with Explanations */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Detailed Question Analysis & Explanations ({result.detailed_answers.length})
            </h3>

            {result.detailed_answers.map((item, idx) => (
              <div
                key={item.question_id}
                className={`p-4 rounded-xl border space-y-3 ${
                  item.is_correct ? 'bg-emerald-50/30 border-emerald-200' : 'bg-rose-50/30 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-xs font-bold text-slate-800">
                    Question {idx + 1}: {item.question_text}
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-sm shrink-0 ${
                    item.is_correct ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {item.is_correct ? 'Correct (+pts)' : 'Incorrect'}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <p>Your Selected Option: <strong className="text-slate-800">{item.user_answer || 'None selected'}</strong></p>
                  <p>Correct Standard Option: <strong className="text-emerald-700">{item.correct_option}</strong></p>
                </div>

                {item.explanation && (
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-[11px] text-slate-700">
                    <strong className="text-slate-900 block mb-0.5">Atmospheric Physics Explanation:</strong>
                    {item.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Certificate Modal Popup */}
          {showCertificateModal && (
            <CertificateModal
              certificate={{
                id: 999,
                certificate_code: result.certificate_code || 'CC-IMD-2026-TEMP',
                title: `Certificate of Competency: ${assessment.title}`,
                course_id: assessment.course_id,
                course_title: assessment.course_title || 'Meteorological Training Program',
                user_name: 'Dr. Rajesh Sharma',
                issued_at: new Date().toISOString(),
                issuing_org: 'Capacity Connect - Ministry of Earth Sciences / IMD',
                metadata_json: JSON.stringify({ competency: result.competency_name, score: result.percentage })
              }}
              onClose={() => setShowCertificateModal(false)}
            />
          )}
        </div>
      )}

      {/* QUESTIONS FORM (While Taking Test) */}
      {!result && (
        <div className="space-y-6">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1">
            <span>Answered: <strong>{answeredCount} of {questions.length}</strong></span>
            <span>All questions mandatory for accredited evaluation</span>
          </div>

          {questions.map((q, idx) => (
            <div key={q.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-start justify-between gap-4">
                <span className="text-xs font-bold text-slate-900 leading-snug">
                  {idx + 1}. {q.question_text}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {q.points} pt{q.points > 1 ? 's' : ''}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { key: 'A', text: q.option_a },
                  { key: 'B', text: q.option_b },
                  { key: 'C', text: q.option_c },
                  { key: 'D', text: q.option_d }
                ].map((opt) => {
                  const isSelected = answers[q.id] === opt.key;
                  return (
                    <label
                      key={opt.key}
                      onClick={() => handleOptionSelect(q.id, opt.key)}
                      className={`flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-institutional-50 border-institutional-600 text-institutional-900 font-semibold'
                          : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q_${q.id}`}
                        value={opt.key}
                        checked={isSelected}
                        onChange={() => handleOptionSelect(q.id, opt.key)}
                        className="w-3.5 h-3.5 text-institutional-600 focus:ring-institutional-500"
                      />
                      <span>
                        <strong className="mr-1.5">{opt.key}.</strong> {opt.text}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Submit Action */}
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Ensure you review all questions before submitting.
            </span>

            <button
              onClick={handleSubmit}
              disabled={submitting || answeredCount === 0}
              className="px-6 py-2.5 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {submitting ? 'Evaluating Assessment...' : 'Submit Assessment'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
