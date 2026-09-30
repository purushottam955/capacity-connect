import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Bell, LogOut, User as UserIcon, Shield, ChevronDown, Check, Compass, BookOpen, Layers } from 'lucide-react';
import { api } from '../api/client';
import { NotificationItem } from '../types';

export const Navbar: React.FC = () => {
  const { user, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  useEffect(() => {
    if (user) {
      api.get<NotificationItem[]>('/notifications')
        .then(data => setNotifications(data))
        .catch(() => {});
    }
  }, [user]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch {}
  };

  const handleRoleSwitch = async (role: 'trainee' | 'trainer' | 'admin') => {
    setShowRoleMenu(false);
    await switchRole(role);
    if (role === 'trainee') navigate('/trainee/dashboard');
    else if (role === 'trainer') navigate('/trainer/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <header className="sticky top-0 z-40 bg-institutional-900 border-b border-institutional-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <Link to={user ? (user.role === 'trainee' ? '/trainee/dashboard' : user.role === 'trainer' ? '/trainer/dashboard' : '/admin/dashboard') : '/landing'} className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center font-bold text-lg text-white shadow-xs">
                CC
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight leading-none text-white flex items-center gap-1.5">
                  CAPACITY CONNECT
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-xs">
                    SIH 26075
                  </span>
                </span>
                <span className="text-[11px] text-slate-300 tracking-wide font-normal">
                  Ministry of Earth Sciences • IMD
                </span>
              </div>
            </Link>
          </div>

          {/* Quick Demo Role Switcher & User Menu */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Judge / Evaluator Instant Role Switcher */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-institutional-800/90 hover:bg-institutional-700 border border-institutional-700 text-slate-200 transition-colors cursor-pointer"
                  title="Switch Role for Evaluation"
                >
                  <Shield className="w-3.5 h-3.5 text-amber-400" />
                  <span className="capitalize">{user.role} View</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-50 text-slate-800">
                    <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                      Demo Persona Switcher
                    </div>
                    <button
                      onClick={() => handleRoleSwitch('trainee')}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${user.role === 'trainee' ? 'font-semibold text-institutional-700 bg-institutional-50/50' : 'text-slate-700'}`}
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-institutional-600" />
                        <div>
                          <p>Trainee Portal</p>
                          <p className="text-[10px] text-slate-400 font-normal">Dr. Rajesh Sharma (Met-I)</p>
                        </div>
                      </div>
                      {user.role === 'trainee' && <Check className="w-3.5 h-3.5 text-institutional-600" />}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('trainer')}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${user.role === 'trainer' ? 'font-semibold text-institutional-700 bg-institutional-50/50' : 'text-slate-700'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Compass className="w-4 h-4 text-institutional-600" />
                        <div>
                          <p>Trainer Portal</p>
                          <p className="text-[10px] text-slate-400 font-normal">Prof. Ananya Sen (NWP Lead)</p>
                        </div>
                      </div>
                      {user.role === 'trainer' && <Check className="w-3.5 h-3.5 text-institutional-600" />}
                    </button>
                    <button
                      onClick={() => handleRoleSwitch('admin')}
                      className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-slate-50 ${user.role === 'admin' ? 'font-semibold text-institutional-700 bg-institutional-50/50' : 'text-slate-700'}`}
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-4 h-4 text-institutional-600" />
                        <div>
                          <p>Admin Portal</p>
                          <p className="text-[10px] text-slate-400 font-normal">Dr. K.V. Ramanathan (Director)</p>
                        </div>
                      </div>
                      {user.role === 'admin' && <Check className="w-3.5 h-3.5 text-institutional-600" />}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-institutional-800 transition-colors cursor-pointer"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-institutional-900" />
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 text-slate-800">
                    <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100">
                      <span className="text-xs font-semibold text-slate-700">Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllRead}
                          className="text-[11px] text-institutional-600 hover:underline cursor-pointer"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>
                    <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 p-4 text-center">No notifications</p>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div key={n.id} className={`p-3 text-xs ${!n.is_read ? 'bg-institutional-50/40' : ''}`}>
                            <p className="font-semibold text-slate-800 leading-snug">{n.title}</p>
                            <p className="text-slate-500 mt-0.5 text-[11px] line-clamp-2">{n.message}</p>
                            <span className="text-[10px] text-slate-400 mt-1 block">
                              {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Info & Logout */}
            {user ? (
              <div className="flex items-center gap-2.5 pl-2 border-l border-institutional-800">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-medium text-white leading-tight">{user.full_name}</span>
                  <span className="text-[10px] text-slate-400 leading-tight">{user.designation || user.role}</span>
                </div>
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-300 hover:text-rose-400 rounded-md hover:bg-institutional-800 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/sign-in"
                  className="px-3 py-1.5 text-xs font-medium text-white hover:text-teal-200 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="px-3 py-1.5 text-xs font-semibold rounded-md bg-teal-600 hover:bg-teal-700 text-white transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
