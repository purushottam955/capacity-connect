import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../api/client';
import { Course } from '../../types';
import { BookOpen, Search, Filter, Clock, UserCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

export const TraineeCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState('');

  const fetchCourses = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (category) params.append('category', category);
    if (difficulty) params.append('difficulty', difficulty);

    api.get<Course[]>(`/courses?${params.toString()}`)
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourses();
  }, [category, difficulty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses();
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-institutional-600" />
            Accredited Course Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Institutional meteorological curriculum mapped directly to competency standards.
          </p>
        </div>

        <Link
          to="/trainee/my-learning"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          My Enrolled Courses ({courses.filter(c => c.enrolled).length})
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course title, subject, or atmospheric keywords..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white"
          />
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="">All Categories</option>
            <option value="Data & Computing">Data & Computing</option>
            <option value="Core Meteorology">Core Meteorology</option>
            <option value="Earth Observation">Earth Observation</option>
            <option value="Public & Institutional">Public & Institutional</option>
          </select>

          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-700"
          >
            <option value="">All Levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>

          <button
            onClick={fetchCourses}
            className="px-4 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Course Cards Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : courses.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          No courses match your active search filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {/* Category & Enrolled pill */}
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-semibold bg-slate-100 text-slate-700 uppercase tracking-wider">
                    {course.category}
                  </span>
                  {course.enrolled && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      Enrolled ({course.progress_percent || 0}%)
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900 line-clamp-2">
                    <Link to={`/trainee/courses/${course.id}`} className="hover:text-institutional-700">
                      {course.title}
                    </Link>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.description}</p>
                </div>

                {/* Competencies mapped */}
                {course.competencies && course.competencies.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {course.competencies.map((c) => (
                      <span
                        key={c.competency_id}
                        className="px-2 py-0.5 rounded-xs text-[10px] bg-teal-50 text-teal-800 border border-teal-200"
                      >
                        {c.competency_name} (Target Lvl {c.target_level})
                      </span>
                    ))}
                  </div>
                )}

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    {course.trainer_name}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {course.duration_hours} hrs
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-semibold capitalize text-slate-600">
                  Level: {course.difficulty}
                </span>

                <Link
                  to={`/trainee/courses/${course.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 bg-institutional-900 hover:bg-institutional-800 text-white rounded-md text-xs font-semibold transition-colors"
                >
                  {course.enrolled ? 'Resume' : 'View Details'} <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
