import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { Course, CourseResourceItem } from '../../types';
import { FolderOpen, Upload, FileText, Video, Download, Plus, CheckCircle2, X } from 'lucide-react';

export const TrainerResources: React.FC = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload Form
  const [courseId, setCourseId] = useState<number | ''>('');
  const [title, setTitle] = useState('');
  const [resourceType, setResourceType] = useState('pdf');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchResources = () => {
    setLoading(true);
    api.get<any[]>('/trainer/resources')
      .then((data) => {
        setResources(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    api.get<Course[]>('/trainer/courses')
      .then((data) => {
        setCourses(data);
        if (data.length > 0) setCourseId(data[0].id);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId || !title || !file) {
      alert('Please fill out all required fields and choose a file.');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('course_id', String(courseId));
      formData.append('title', title);
      formData.append('resource_type', resourceType);
      formData.append('description', description);
      formData.append('file', file);

      await api.post('/trainer/resources/upload', formData);
      setShowUploadModal(false);
      setTitle('');
      setDescription('');
      setFile(null);
      fetchResources();
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const backendHost = import.meta.env.VITE_API_BASE_URL?.replace('/api', '') || 'http://localhost:8000';

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-institutional-600" />
            Trainer Resource Library
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Upload lecture presentations, NetCDF manipulation notebooks, PDFs, and training videos.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          Upload New Resource
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="w-8 h-8 border-3 border-institutional-600 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : resources.length === 0 ? (
        <div className="p-12 bg-white rounded-xl border border-slate-200 text-center text-slate-500 text-xs">
          No resources uploaded yet. Click "Upload New Resource" to add materials.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                  <th className="py-3.5 px-4">Resource Title</th>
                  <th className="py-3.5 px-4">Course</th>
                  <th className="py-3.5 px-4">Type</th>
                  <th className="py-3.5 px-4">File Size</th>
                  <th className="py-3.5 px-4">Uploaded</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {resources.map((r) => {
                  const fileLink = r.file_url.startsWith('http')
                    ? r.file_url
                    : `${backendHost}${r.file_url}`;

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/80">
                      <td className="py-3.5 px-4 font-bold text-slate-900 flex items-center gap-2">
                        {r.resource_type === 'video' ? <Video className="w-4 h-4 text-slate-500" /> : <FileText className="w-4 h-4 text-slate-500" />}
                        <span>{r.title}</span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">{r.course_title || 'General'}</td>
                      <td className="py-3.5 px-4">
                        <span className="uppercase text-[10px] font-mono px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700">
                          {r.resource_type}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {r.file_size_kb ? `${r.file_size_kb} KB` : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <a
                          href={fileLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-institutional-600 hover:underline"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-institutional-600" />
                Upload Curriculum Resource
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Course *</label>
                <select
                  value={courseId}
                  onChange={(e) => setCourseId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document / Resource Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. INSAT-3DR Multispectral Band Interpretation Guide"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Resource Type</label>
                  <select
                    value={resourceType}
                    onChange={(e) => setResourceType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="pptx">PowerPoint Presentation</option>
                    <option value="video">Lecture Video (MP4)</option>
                    <option value="notes">Notes / Script</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Choose File *</label>
                  <input
                    type="file"
                    required
                    onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
                    className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summary of contents, exercises, or references..."
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {uploading ? 'Uploading...' : 'Save to Library'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
