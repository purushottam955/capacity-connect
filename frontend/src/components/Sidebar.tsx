import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Target,
  Sparkles,
  BookOpen,
  GraduationCap,
  FileCheck2,
  Award,
  MessageSquare,
  UserCheck,
  FolderOpen,
  Bot,
  BarChart3,
  GitPullRequest,
  Users,
  Settings,
  Bell,
  Cpu
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const traineeLinks = [
    { to: '/trainee/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/trainee/competencies', label: 'Competency Matrix', icon: Target },
    { to: '/trainee/skill-gaps', label: 'Skill Gap Analysis', icon: BarChart3 },
    { to: '/trainee/recommendations', label: 'Personalized Learning', icon: Sparkles },
    { to: '/trainee/courses', label: 'Course Catalog', icon: BookOpen },
    { to: '/trainee/my-learning', label: 'My Enrolled Courses', icon: GraduationCap },
    { to: '/trainee/assessments', label: 'Assessments', icon: FileCheck2 },
    { to: '/trainee/results', label: 'Exam Results', icon: BarChart3 },
    { to: '/trainee/certificates', label: 'My Certificates', icon: Award },
    { to: '/trainee/feedback', label: 'Course Feedback', icon: MessageSquare },
    { to: '/trainee/profile', label: 'Professional Profile', icon: UserCheck }
  ];

  const trainerLinks = [
    { to: '/trainer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/trainer/courses', label: 'Course Management', icon: BookOpen },
    { to: '/trainer/courses/create', label: 'Create New Course', icon: BookOpen },
    { to: '/trainer/resources', label: 'Resource Library', icon: FolderOpen },
    { to: '/trainer/ai-quiz', label: 'AI Quiz Generator', icon: Bot },
    { to: '/trainer/assessments', label: 'Assessments & Tests', icon: FileCheck2 },
    { to: '/trainer/performance', label: 'Trainee Analytics', icon: BarChart3 },
    { to: '/trainer/training-requests', label: 'Training Requirements', icon: GitPullRequest },
    { to: '/trainer/profile', label: 'Trainer Credentials', icon: UserCheck }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory & Roles', icon: Users },
    { to: '/admin/courses', label: 'Course Catalog Governance', icon: BookOpen },
    { to: '/admin/competency-framework', label: 'Competency Framework', icon: Target },
    { to: '/admin/training-requirements', label: 'Training Requirements', icon: GitPullRequest },
    { to: '/admin/trainer-matching', label: 'Trainer Matching Engine', icon: Cpu },
    { to: '/admin/analytics', label: 'Organizational Analytics', icon: BarChart3 },
    { to: '/admin/announcements', label: 'Announcements', icon: Bell },
    { to: '/admin/settings', label: 'Platform Settings', icon: Settings }
  ];

  const links = user.role === 'trainee' ? traineeLinks : user.role === 'trainer' ? trainerLinks : adminLinks;

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div>
        <div className="px-3 py-2 mb-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {user.role} workspace
          </p>
          <p className="text-xs font-semibold text-slate-800 truncate">
            {user.designation || 'Ministry Officer'}
          </p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-institutional-50 text-institutional-800 font-semibold border-l-3 border-institutional-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0 text-slate-500" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-100 px-3 text-[11px] text-slate-400">
        <p className="font-semibold text-slate-600">CAPACITY CONNECT v1.0</p>
        <p>MoES • IMD Digital Ecosystem</p>
      </div>
    </aside>
  );
};
