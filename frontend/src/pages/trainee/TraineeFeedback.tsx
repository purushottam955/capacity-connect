import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Course } from '../../types';
import { MessageSquare, Star, CheckCircle2 } from 'lucide-react';

export const TraineeFeedback: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | ''>('');
  const [rating, setRating] = useState(5);
  const [contentRating, setContentRating] = useState(5);
  const [trainerRating, setTrainerRating] = useState(5);
  const [comments, setComments] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get<Course[]>('/courses')
      .then((data) => {
        setCourses(data);
        if (data.length > 0) setSelectedCourseId(data[0].id);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return;
    setSubmitting(true);
    try {
      await api.post(`/courses/${selectedCourseId}/feedback`, {
        course_id: Number(selectedCourseId),
        rating,
        content_quality_rating: contentRating,
        trainer_rating: trainerRating,
        comments
      });
      setSubmitted(true);
    } catch {
      alert('Feedback error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-3xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <MessageSquare className="w-6 h-6 text-institutional-600" />
          Course & Faculty Feedback
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Your feedback directly drives curriculum updates and trainer evaluation standards.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs">
        {submitted ? (
          <div className="text-center py-8 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">Feedback Recorded</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Thank you for contributing to institutional capacity enhancement at IMD and Ministry of Earth Sciences.
            </p>
            <button
              onClick={() => {
                setSubmitted(false);
                setComments('');
              }}
              className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Submit Another Review
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Select Course / Program
              </label>
              <select
                value={selectedCourseId}
                onChange={(e) => setSelectedCourseId(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title} (Faculty: {c.trainer_name})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Overall Experience
                </label>
                <select
                  value={rating}
                  onChange={(e) => setRating(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value={5}>5 - Excellent</option>
                  <option value={4}>4 - Very Good</option>
                  <option value={3}>3 - Satisfactory</option>
                  <option value={2}>2 - Fair</option>
                  <option value={1}>1 - Poor</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Curriculum Quality
                </label>
                <select
                  value={contentRating}
                  onChange={(e) => setContentRating(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value={5}>5 - High Rigor</option>
                  <option value={4}>4 - Practical</option>
                  <option value={3}>3 - Adequate</option>
                  <option value={2}>2 - Basic</option>
                  <option value={1}>1 - Needs Update</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trainer Effectiveness
                </label>
                <select
                  value={trainerRating}
                  onChange={(e) => setTrainerRating(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                >
                  <option value={5}>5 - Master Instructor</option>
                  <option value={4}>4 - Very Knowledgeable</option>
                  <option value={3}>3 - Good Delivery</option>
                  <option value={2}>2 - Needs More Q&A</option>
                  <option value={1}>1 - Unsatisfactory</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Constructive Remarks & Recommendations
              </label>
              <textarea
                rows={4}
                required
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share specific observations regarding hands-on exercises, NetCDF datasets, or lecture presentations..."
                className="w-full p-3 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {submitting ? 'Submitting...' : 'Submit Institutional Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
