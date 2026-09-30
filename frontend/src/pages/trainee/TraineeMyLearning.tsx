import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { GraduationCap, ArrowRight, CheckCircle2, Clock, FileCheck2 } from 'lucide-react';

export const TraineeMyLearning: React.FC = () => {
  const [learning, setLearning] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/trainee/my-learning')
      .then((data) => {
        setLearning(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <GraduationCap className="w-6 h-6 text-institutional-600" />
          My Enrolled Courses & Learning Progress
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Track your course completion, module study progress, and assessment qualification records.
        </p>
      </div>

      {learning.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center space-y-3">
          <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-sm font-bold text-slate-800">No active course enrollments</h3>
          <p className="text-xs text-slate-500">Explore the course catalog or check your personalized recommendations.</p>
          <Link
            to="/trainee/recommendations"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded-lg text-xs font-semibold"
          >
            View Recommendations <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {learning.map((item) => (
            <div
              key={item.enrollment_id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                      {item.subject}
                    </span>
                    {item.status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-institutional-700 bg-institutional-50 px-2 py-0.5 rounded-md border border-institutional-200">
                        In Progress ({item.progress_percent}%)
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    <Link to={`/trainee/courses/${item.course_id}`} className="hover:text-institutional-700">
                      {item.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Faculty Lead: {item.trainer_name} • Duration: {item.duration_hours} hrs
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    to={`/trainee/courses/${item.course_id}`}
                    className="px-4 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    Open Curriculum <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-2">
                <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                  <span>Course Syllabus Completion</span>
                  <span>{item.progress_percent}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      item.status === 'completed' ? 'bg-emerald-600' : 'bg-institutional-600'
                    }`}
                    style={{ width: `${item.progress_percent}%` }}
                  />
                </div>
              </div>

              {/* Assessments under this course */}
              {item.assessments && item.assessments.length > 0 && (
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                    Associated Assessments:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {item.assessments.map((a: any) => (
                      <div
                        key={a.id}
                        className="px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center gap-3"
                      >
                        <span className="font-semibold text-slate-800">{a.title}</span>
                        {a.completed ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-sm">
                            Passed ({a.best_score}%)
                          </span>
                        ) : (
                          <Link
                            to={`/trainee/assessments/${a.id}/take`}
                            className="text-[11px] font-semibold text-institutional-600 hover:underline flex items-center gap-1"
                          >
                            Take Exam <ArrowRight className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
