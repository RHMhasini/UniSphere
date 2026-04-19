import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { notificationAPI } from '../../../services/api';
import {
  Bell,
  User,
  Settings,
  ChevronRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Loader2,
  BellRing,
  ArrowRight,
} from 'lucide-react';

/* ─── helpers ──────────────────────────────────────────────── */

function formatWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMs / 3600000);
    const diffDay = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay < 7) return `${diffDay}d ago`;
    return d.toLocaleDateString(undefined, { dateStyle: 'medium' });
  } catch {
    return String(iso);
  }
}

function roleBadgeStyle(role) {
  const map = {
    STUDENT: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
    LECTURER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    TECHNICIAN: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
    ADMIN: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300',
  };
  return map[role] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
}

function notificationIcon(type) {
  const t = (type || '').toUpperCase();
  if (t.includes('APPROVAL') || t.includes('APPROVED')) return '✅';
  if (t.includes('REJECT')) return '❌';
  if (t.includes('REGISTRATION') || t.includes('PENDING')) return '📋';
  if (t.includes('COMMENT')) return '💬';
  if (t.includes('TICKET')) return '🎫';
  if (t.includes('BOOKING')) return '📅';
  return '🔔';
}

/* ─── Quick Action Card ─────────────────────────────────────── */
const QuickAction = ({ icon: Icon, label, desc, to, accent = 'indigo' }) => {
  const navigate = useNavigate();
  const accents = {
    indigo: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/60',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/60',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900/60',
    slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700',
  };

  return (
    <button
      type="button"
      onClick={() => navigate(to)}
      className="group card-premium flex items-center gap-4 p-5 text-left w-full hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5"
    >
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors ${accents[accent]}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900 dark:text-white text-sm">{label}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
    </button>
  );
};

/* ─── Main Component ────────────────────────────────────────── */
const DashboardHome = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingNotif, setLoadingNotif] = useState(true);

  const loadData = useCallback(async () => {
    setLoadingNotif(true);
    try {
      const [notifRes, unreadRes] = await Promise.allSettled([
        notificationAPI.getNotifications(0, 5),
        notificationAPI.getUnreadCount(),
      ]);

      if (notifRes.status === 'fulfilled' && notifRes.value?.success) {
        setNotifications(notifRes.value.data?.content ?? []);
      }
      if (unreadRes.status === 'fulfilled' && unreadRes.value?.success) {
        setUnreadCount(unreadRes.value.data ?? 0);
      }
    } catch {
      // silently fail — dashboard should always load
    } finally {
      setLoadingNotif(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Refresh when notification actions happen elsewhere
    const handler = () => loadData();
    window.addEventListener('unicampus-notifications-changed', handler);
    return () => window.removeEventListener('unicampus-notifications-changed', handler);
  }, [loadData]);

  const role = user?.role;
  const status = user?.registrationStatus;
  const isActive = user?.isActive;

  const quickActions = [
    {
      icon: Bell,
      label: 'Notifications',
      desc: unreadCount > 0 ? `${unreadCount} unread message${unreadCount > 1 ? 's' : ''}` : 'No new messages',
      to: '/dashboard/notifications',
      accent: 'indigo',
    },
    {
      icon: User,
      label: 'My Profile',
      desc: 'View and update your details',
      to: '/dashboard/profile',
      accent: 'emerald',
    },
    {
      icon: Settings,
      label: 'Settings',
      desc: 'Notification preferences',
      to: '/dashboard/settings',
      accent: 'slate',
    },
    ...(role === 'ADMIN'
      ? [{
          icon: ShieldCheck,
          label: 'User Management',
          desc: 'Approve, reject and manage users',
          to: '/dashboard/users',
          accent: 'amber',
        }]
      : []),
  ];

  const statusConfig = {
    APPROVED: {
      icon: CheckCircle2,
      label: 'Active',
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/30',
      border: 'border-emerald-200 dark:border-emerald-900/50',
    },
    PENDING_APPROVAL: {
      icon: Clock,
      label: 'Pending Approval',
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/30',
      border: 'border-amber-200 dark:border-amber-900/50',
    },
    REJECTED: {
      icon: Clock,
      label: 'Rejected',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/30',
      border: 'border-red-200 dark:border-red-900/50',
    },
  };
  const statusInfo = statusConfig[status] || statusConfig.PENDING_APPROVAL;
  const StatusIcon = statusInfo.icon;

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* ── Welcome Banner ── */}
      <div className="card-premium overflow-hidden">
        <div className="flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.fullName}
                className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-4 ring-indigo-100 dark:ring-indigo-900/40"
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700 ring-4 ring-indigo-50 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-900/30">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
            )}

            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">{greeting},</p>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {user?.fullName || 'Welcome'}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeStyle(role)}`}>
                  {role}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusInfo.bg} ${statusInfo.border} ${statusInfo.color}`}>
                  <StatusIcon className="h-3 w-3" />
                  {statusInfo.label}
                </span>
              </div>
            </div>
          </div>

          {/* Unread pill */}
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => navigate('/dashboard/notifications')}
              className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 px-5 py-3.5 text-indigo-700 hover:bg-indigo-100 transition-colors dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
            >
              <BellRing className="h-5 w-5 shrink-0 animate-[wiggle_1s_ease-in-out_2]" />
              <div className="text-left">
                <p className="text-sm font-semibold">{unreadCount} unread</p>
                <p className="text-xs opacity-75">View all notifications</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          )}
        </div>

        {/* Profile info strip */}
        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 px-7 py-3">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>
              <span className="font-medium text-slate-700 dark:text-slate-300">Email: </span>
              {user?.email}
            </span>
            {user?.phone && (
              <span>
                <span className="font-medium text-slate-700 dark:text-slate-300">Phone: </span>
                {user.phone}
              </span>
            )}
            {user?.studentId && (
              <span>
                <span className="font-medium text-slate-700 dark:text-slate-300">Student ID: </span>
                {user.studentId}
              </span>
            )}
            {user?.staffId && (
              <span>
                <span className="font-medium text-slate-700 dark:text-slate-300">Staff ID: </span>
                {user.staffId}
              </span>
            )}
            {user?.faculty && (
              <span>
                <span className="font-medium text-slate-700 dark:text-slate-300">Faculty: </span>
                {user.faculty}
              </span>
            )}
            {user?.department && (
              <span>
                <span className="font-medium text-slate-700 dark:text-slate-300">Dept: </span>
                {user.department}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column grid ── */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-base font-semibold text-slate-900 dark:text-white">Quick Actions</h2>
          <div className="space-y-3">
            {quickActions.map((a) => (
              <QuickAction key={a.to} {...a} />
            ))}
          </div>
        </div>

        {/* Recent Notifications */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">
              Recent Notifications
            </h2>
            <button
              type="button"
              onClick={() => navigate('/dashboard/notifications')}
              className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
            >
              View all <ChevronRight className="h-3 w-3" />
            </button>
          </div>

          {loadingNotif ? (
            <div className="card-premium flex items-center justify-center py-14">
              <Loader2 className="h-7 w-7 animate-spin text-indigo-500" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="card-premium flex flex-col items-center justify-center gap-3 py-14 text-center">
              <Bell className="h-9 w-9 text-slate-300 dark:text-slate-600" />
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">All caught up!</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">No notifications yet.</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={[
                    'card-premium flex gap-3 p-4 transition-all',
                    !n.isRead
                      ? 'border-l-2 border-l-indigo-400 dark:border-l-indigo-500'
                      : '',
                  ].join(' ')}
                >
                  <span className="mt-0.5 shrink-0 text-lg leading-none">
                    {notificationIcon(n.type)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm leading-snug ${n.isRead ? 'text-slate-600 dark:text-slate-400' : 'font-medium text-slate-900 dark:text-white'}`}>
                      {n.message}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {(n.type || '').replace(/_/g, ' ') || 'Notice'}
                      </span>
                      <span>{formatWhen(n.createdAt)}</span>
                      {!n.isRead && (
                        <span className="font-semibold text-indigo-500 dark:text-indigo-400">
                          • New
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
