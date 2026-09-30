import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { BookOpen, Plus, Users, FileCheck2, FolderOpen, ArrowRight } from 'lucide-react';

export const TrainerCourses: React.FC = () => {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<any[]>('/trainer/courses')
      .then((data) => {
        setCourses(data);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-institutional-600" />
            Curriculum & Course Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Maintain your instructional programs, lecture materials, and competency targets.
          </p>
        </div>

        <Link
          to="/trainer/courses/create"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Course
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3.5 px-4">Course Title</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-center">Enrollments</th>
                <th className="py-3.5 px-4 text-center">Resources</th>
                <th className="py-3.5 px-4 text-center">Assessments</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.subject}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.category}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-800">{c.enrollments_count}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-800">{c.resources_count}</td>
                  <td className="py-3.5 px-4 text-center font-semibold text-slate-800">{c.assessments_count}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                      {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to="/trainer/resources"
                      className="text-xs font-semibold text-institutional-600 hover:underline"
                    >
                      Manage Resources
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
