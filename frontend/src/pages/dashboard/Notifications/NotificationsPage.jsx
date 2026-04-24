import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../../services/api';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Trash2,
  Check,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PAGE_SIZE = 15;

function emitNotificationsChanged() {
  window.dispatchEvent(new Event('unicampus-notifications-changed'));
}

function formatWhen(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return String(iso);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return String(iso);
  }
}

const NotificationsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [clearing, setClearing] = useState(false);

  const load = useCallback(async (p) => {
    setLoading(true);
    setError(null);
    try {
      const res = await notificationAPI.getNotifications(p, PAGE_SIZE);
      if (res?.success && res.data) {
        setData(res.data);
        setPage(p);
      } else {
        setError(res?.message || 'Failed to load notifications.');
        setData(null);
      }
    } catch (e) {
      console.error(e);
      setError('Failed to load notifications.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(0);
  }, [load]);

  const totalPages = data?.totalPages ?? 0;
  const items = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;

  const handleClearAll = async () => {
    if (totalElements === 0) return;
    if (
      !window.confirm(
        'Remove all notifications? This cannot be undone.'
      )
    ) {
      return;
    }
    setClearing(true);
    try {
      const res = await notificationAPI.deleteAllNotifications();
      if (res?.success) {
        emitNotificationsChanged();
        await load(0);
        toast.success("Notifications cleared!");
      } else {
        toast.error(res?.message || 'Could not clear notifications.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not clear notifications.');
    } finally {
      setClearing(false);
    }
  };

  const handleMarkRead = async (n) => {
    if (n.isRead) return;
    setBusyId(n.id);
    try {
      const res = await notificationAPI.markAsRead(n.id);
      if (res?.success) {
        emitNotificationsChanged();
        setData((prev) => {
          if (!prev?.content) return prev;
          return {
            ...prev,
            content: prev.content.map((x) =>
              x.id === n.id ? { ...x, isRead: true } : x
            ),
          };
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteOne = async (n) => {
    setBusyId(n.id);
    try {
      const res = await notificationAPI.deleteNotification(n.id);
      if (res?.success) {
        emitNotificationsChanged();
        const nextPage = items.length === 1 && page > 0 ? page - 1 : page;
        await load(nextPage);
      } else {
        toast.error(res?.message || 'Could not remove notification.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Could not remove notification.');
    } finally {
      setBusyId(null);
    }
  };

  const getNotificationLink = (n) => {
    if (n.type === 'REGISTRATION_ALERTS' || n.type === 'REGISTRATION_PENDING') {
      return { path: '/dashboard/users', label: 'Open user management' };
    }
    if (n.type === 'BOOKING_ALERTS') {
      return { path: '/dashboard/bookings/admin', label: 'View booking request' };
    }
    if (n.type === 'BOOKING_UPDATES') {
      return { path: '/dashboard/bookings', label: 'View my booking' };
    }
    if (n.type === 'TICKET_ALERTS' || n.type === 'TICKET_UPDATES') {
      return { path: '/dashboard/tickets', label: 'View ticket details' };
    }
    return null;
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 lg:px-0">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
            <Bell className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Notifications
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              All saved alerts for your account ({totalElements} total)
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleClearAll}
          disabled={clearing || totalElements === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-medium text-red-700 shadow-sm transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-900/50 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-950/30"
          title="Clear all notifications"
        >
          {clearing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          Clear all
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : null}

      {!loading && items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
          <Bell className="mx-auto mb-3 h-10 w-10 text-slate-300 dark:text-slate-600" />
          <p className="text-slate-600 dark:text-slate-400">
            No notifications yet.
          </p>
        </div>
      ) : null}

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((n) => (
            <li
              key={n.id}
              className={[
                'flex flex-col gap-3 rounded-xl border px-4 py-3 sm:flex-row sm:items-start sm:justify-between',
                n.isRead
                  ? 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  : 'border-indigo-200/80 bg-indigo-50/40 dark:border-indigo-900/40 dark:bg-indigo-950/20',
              ].join(' ')}
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {n.message}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-medium uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {(n.type || '').replace(/_/g, ' ') || 'Notice'}
                  </span>
                  <span>{formatWhen(n.createdAt)}</span>
                  {!n.isRead ? (
                    <span className="text-indigo-600 dark:text-indigo-400">
                      Unread
                    </span>
                  ) : null}
                </div>
                {(() => {
                  const link = getNotificationLink(n);
                  if (!link) return null;
                  return (
                    <button
                      type="button"
                      onClick={() => navigate(link.path)}
                      className="mt-2 text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                    >
                      {link.label} →
                    </button>
                  );
                })()}
              </div>
              <div className="flex shrink-0 items-center gap-1 sm:flex-col sm:items-end">
                {!n.isRead ? (
                  <button
                    type="button"
                    disabled={busyId === n.id}
                    onClick={() => handleMarkRead(n)}
                    className="inline-flex items-center gap-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    title="Mark as read"
                  >
                    <Check className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:text-xs">Read</span>
                  </button>
                ) : null}
                <button
                  type="button"
                  disabled={busyId === n.id}
                  onClick={() => handleDeleteOne(n)}
                  className="inline-flex items-center gap-1 rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                  title="Remove"
                >
                  {busyId === n.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span className="sr-only sm:not-sr-only sm:text-xs">Remove</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {totalPages > 1 ? (
        <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Page {(data?.page ?? 0) + 1} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 0 || loading}
              onClick={() => load(page - 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              type="button"
              disabled={page >= totalPages - 1 || loading}
              onClick={() => load(page + 1)}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default NotificationsPage;
