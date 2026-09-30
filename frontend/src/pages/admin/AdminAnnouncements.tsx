import React, { useState, useEffect } from 'react';
import { api } from '../../api/client';
import { AnnouncementItem } from '../../types';
import { Bell, Plus, Send, CheckCircle2, Megaphone } from 'lucide-react';

export const AdminAnnouncements: React.FC = () => {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [targetRole, setTargetRole] = useState('all');
  const [priority, setPriority] = useState('normal');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const fetchAnnouncements = () => {
    setLoading(true);
    api.get<AnnouncementItem[]>('/announcements')
      .then((data) => {
        setAnnouncements(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    setSubmitting(true);
    setSuccess(false);

    try {
      await api.post('/announcements', {
        title,
        content,
        target_role: targetRole,
        priority
      });
      setTitle('');
      setContent('');
      setSuccess(true);
      fetchAnnouncements();
    } catch {
      alert('Broadcast error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-5xl mx-auto">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
          <Megaphone className="w-6 h-6 text-institutional-600" />
          Broadcast Institutional Announcements
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Publish department-wide training directives, monsoon capacity notices, and system bulletins.
        </p>
      </div>

      {/* Broadcast Form */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Plus className="w-4 h-4 text-institutional-600" />
          Create New Institutional Directive
        </h3>

        {success && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Announcement broadcast live to all specified recipient dashboards.</span>
          </div>
        )}

        <form onSubmit={handleBroadcast} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Mandatory Pre-Monsoon NWP Ingest Protocol Training"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Audience</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="all">All Personnel (Trainees & Trainers)</option>
                <option value="trainee">Operational Trainees Only</option>
                <option value="trainer">Faculty & Trainers Only</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Broadcast Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
              >
                <option value="normal">Normal Priority</option>
                <option value="high">High Priority (Urgent Directives)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Directive Details & Content *</label>
            <textarea
              rows={3}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter comprehensive announcement content..."
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="px-5 py-2.5 bg-institutional-900 hover:bg-institutional-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            {submitting ? 'Publishing Directive...' : 'Broadcast Announcement'}
          </button>
        </form>
      </div>

      {/* Historical Announcements Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs space-y-4 p-6">
        <h3 className="text-sm font-bold text-slate-900">
          Historical Broadcast Log ({announcements.length})
        </h3>

        {announcements.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No announcements published yet.</p>
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{a.title}</span>
                  <div className="flex items-center gap-2">
                    <span className="uppercase text-[10px] px-2 py-0.5 rounded-sm bg-white border border-slate-200 text-slate-600 font-semibold">
                      Target: {a.target_role}
                    </span>
                    {a.priority === 'high' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-rose-50 text-rose-700 border border-rose-200">
                        HIGH PRIORITY
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-slate-600 leading-relaxed">{a.content}</p>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Author: {a.author_name}</span>
                  <span>{new Date(a.created_at).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
