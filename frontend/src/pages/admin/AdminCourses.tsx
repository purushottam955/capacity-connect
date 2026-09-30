import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Course } from '../../types';
import { BookOpen, UserCheck, Clock, ExternalLink } from 'lucide-react';

export const AdminCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<Course[]>('/courses')
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
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-institutional-600" />
          Course Catalog Governance
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Review all accredited courses offered across India Meteorological Department training divisions.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3.5 px-4">Course Title</th>
                <th className="py-3.5 px-4">Subject</th>
                <th className="py-3.5 px-4">Curriculum Category</th>
                <th className="py-3.5 px-4">Assigned Faculty</th>
                <th className="py-3.5 px-4 text-center">Duration</th>
                <th className="py-3.5 px-4 text-center">Difficulty</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {courses.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{c.title}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.subject}</td>
                  <td className="py-3.5 px-4 text-slate-600">{c.category}</td>
                  <td className="py-3.5 px-4 text-slate-800 font-medium">{c.trainer_name}</td>
                  <td className="py-3.5 px-4 text-center font-mono">{c.duration_hours} hrs</td>
                  <td className="py-3.5 px-4 text-center capitalize">{c.difficulty}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-sm text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                      {c.status}
                    </span>
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
