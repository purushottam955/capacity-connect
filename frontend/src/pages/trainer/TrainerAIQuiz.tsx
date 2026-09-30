import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../api/client';
import { Course, Competency } from '../../types';
import { Bot, Sparkles, Plus, Trash2, Edit3, CheckCircle2, ArrowRight, BookOpen, Layers } from 'lucide-react';

interface QuestionDraft {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string;
  difficulty: string;
  points: number;
}

export const TrainerAIQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [selectedCompId, setSelectedCompId] = useState<number | ''>('');

  const [topic, setTopic] = useState('Numerical Weather Prediction - Primitive Equations & Data Assimilation');
  const [contentNotes, setContentNotes] = useState(
    'Atmospheric model equations enforce mass continuity, hydrostatic balance, and thermodynamics. In operational NWP, 4D-Var data assimilation integrates radar reflectivity, satellite soundings, and radiosondes across a time window to generate optimal initial conditions for forecasting.'
  );
  const [numQuestions, setNumQuestions] = useState(4);
  const [difficulty, setDifficulty] = useState('intermediate');

  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);
  const [assessmentTitle, setAssessmentTitle] = useState('Atmospheric Modeling Operational Quiz');
  const [targetLevel, setTargetLevel] = useState(4);
  const [passingScore, setPassingScore] = useState(70.0);
  const [timeLimit, setTimeLimit] = useState(20);

  const [publishing, setPublishing] = useState(false);
  const [publishedId, setPublishedId] = useState<number | null>(null);

  useEffect(() => {
    api.get<Course[]>('/courses').then((data) => {
      setCourses(data);
      if (data.length > 0) setSelectedCourseId(data[0].id);
    });

    api.get<Competency[]>('/competencies').then((data) => {
      setCompetencies(data);
      if (data.length > 0) setSelectedCompId(data[0].id);
    });
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setPublishedId(null);
    try {
      const res = await api.post<any>('/ai/generate-mcqs', {
        topic,
        content: contentNotes,
        num_questions: numQuestions,
        difficulty,
        competency_id: selectedCompId || undefined
      });

      const formatted = res.questions.map((q: any) => ({
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        correct_option: q.correct_option || 'A',
        explanation: q.explanation || '',
        difficulty: q.difficulty || difficulty,
        points: 20
      }));

      setQuestions(formatted);
      setAssessmentTitle(`${topic} - Assessment`);
    } catch {
      alert('AI generation failed. Fallback error.');
    } finally {
      setGenerating(false);
    }
  };

  const handleQuestionChange = (index: number, field: keyof QuestionDraft, value: any) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: 'New meteorological question text...',
        option_a: 'Option A description',
        option_b: 'Option B description',
        option_c: 'Option C description',
        option_d: 'Option D description',
        correct_option: 'A',
        explanation: 'Scientific justification for Option A...',
        difficulty: 'intermediate',
        points: 20
      }
    ]);
  };

  const handlePublish = async () => {
    if (!selectedCourseId) {
      alert('Please select a course to attach this assessment.');
      return;
    }
    if (questions.length === 0) {
      alert('Please generate or add at least one question.');
      return;
    }

    setPublishing(true);
    try {
      const res = await api.post<any>('/assessments', {
        course_id: Number(selectedCourseId),
        competency_id: selectedCompId ? Number(selectedCompId) : undefined,
        title: assessmentTitle,
        description: `Accredited assessment evaluating competency in ${topic}.`,
        time_limit_minutes: timeLimit,
        passing_score: passingScore,
        target_competency_level: targetLevel,
        questions: questions
      });

      setPublishedId(res.id);
    } catch {
      alert('Error publishing assessment.');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Bot className="w-6 h-6 text-teal-600" />
          AI Assessment Generator & Human Review Engine
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Generate accredited meteorological assessment questionnaires from syllabus topics or uploaded notes, with mandatory human faculty oversight before publishing.
        </p>
      </div>

      {publishedId ? (
        <div className="p-8 bg-emerald-50 rounded-xl border border-emerald-300 text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h2 className="text-lg font-bold text-emerald-950">Assessment Published Successfully!</h2>
          <p className="text-xs text-emerald-800 max-w-md mx-auto">
            The assessment <strong className="text-slate-900">"{assessmentTitle}"</strong> is now live. Trainees can attempt this assessment to upgrade their verified competency level in the database.
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => {
                setPublishedId(null);
                setQuestions([]);
              }}
              className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
            >
              Create Another Assessment
            </button>
            <button
              onClick={() => navigate('/trainer/assessments')}
              className="px-4 py-2 bg-white text-slate-800 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              View Assessment Manager
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* STEP 1: Generation Configuration */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-slate-900">Configure Content & Topics</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Course</label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Competency</label>
                <select
                  value={selectedCompId}
                  onChange={(e) => setSelectedCompId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {competencies.map((comp) => (
                    <option key={comp.id} value={comp.id}>{comp.name} ({comp.category})</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Meteorological Topic / Concept
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Doppler Radar Velocity Couplets & Tornado Signatures"
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contextual Study Material Notes (or paste lecture text)
              </label>
              <textarea
                rows={3}
                value={contentNotes}
                onChange={(e) => setContentNotes(e.target.value)}
                placeholder="Paste key theorems, formulas, operational rules, or syllabus excerpt here..."
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Number of Questions</label>
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate (Standard)</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              {generating ? 'Synthesizing Meteorological Questions...' : 'Generate MCQs with AI Engine'}
            </button>
          </div>

          {/* STEP 2: Human-in-the-Loop Review & Inline Editing */}
          {questions.length > 0 && (
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-institutional-100 text-institutional-800 text-xs font-bold flex items-center justify-center">
                    2
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Human Faculty Review & Editing ({questions.length} Questions)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Review each question, revise incorrect options, or refine explanations before publishing.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleAddQuestion}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Question
                </button>
              </div>

              {/* Assessment Meta Fields */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">Assessment Title</label>
                  <input
                    type="text"
                    value={assessmentTitle}
                    onChange={(e) => setAssessmentTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Level</label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    value={targetLevel}
                    onChange={(e) => setTargetLevel(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Passing Score (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={passingScore}
                    onChange={(e) => setPassingScore(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-slate-900"
                  />
                </div>
              </div>

              {/* Editable Question Cards */}
              <div className="space-y-6">
                {questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="p-5 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4 relative"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Question {idx + 1}</span>
                      <button
                        onClick={() => handleDeleteQuestion(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Remove question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-500 mb-1">Question Prompt</label>
                      <textarea
                        rows={2}
                        value={q.question_text}
                        onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                        className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Option A</label>
                        <input
                          type="text"
                          value={q.option_a}
                          onChange={(e) => handleQuestionChange(idx, 'option_a', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Option B</label>
                        <input
                          type="text"
                          value={q.option_b}
                          onChange={(e) => handleQuestionChange(idx, 'option_b', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Option C</label>
                        <input
                          type="text"
                          value={q.option_c}
                          onChange={(e) => handleQuestionChange(idx, 'option_c', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Option D</label>
                        <input
                          type="text"
                          value={q.option_d}
                          onChange={(e) => handleQuestionChange(idx, 'option_d', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">
                          Designated Correct Option
                        </label>
                        <select
                          value={q.correct_option}
                          onChange={(e) => handleQuestionChange(idx, 'correct_option', e.target.value)}
                          className="w-full px-3 py-1.5 bg-emerald-50 border border-emerald-300 font-bold text-emerald-900 rounded-lg"
                        >
                          <option value="A">Option A</option>
                          <option value="B">Option B</option>
                          <option value="C">Option C</option>
                          <option value="D">Option D</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Diagnostic Explanation (shown after attempt)
                        </label>
                        <input
                          type="text"
                          value={q.explanation}
                          onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Publish Final Action */}
              <div className="p-4 bg-institutional-50 rounded-xl border border-institutional-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-institutional-900">Faculty Review Certified</h4>
                  <p className="text-[11px] text-slate-500">
                    Questions meet institutional meteorology rigor and will be published live to the course curriculum.
                  </p>
                </div>

                <button
                  onClick={handlePublish}
                  disabled={publishing}
                  className="px-6 py-2.5 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  {publishing ? 'Publishing Assessment...' : 'Approve & Publish Assessment'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
