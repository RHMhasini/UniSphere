import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, User, LogOut, Settings, Bell, Sun, Moon } from 'lucide-react';
import { notificationAPI } from '../../../services/api';

/**
 * @param {{ onOpenMobileNav?: () => void }} props
 */
const DashboardNavbar = ({ onOpenMobileNav, theme, toggleTheme }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [bellItems, setBellItems] = useState([]);
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const bellRef = useRef(null);

  const role = user?.role ?? 'STUDENT';

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
      if (bellRef.current && !bellRef.current.contains(e.target)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      const res = await notificationAPI.getUnreadCount();
      if (res?.success && res.data != null) {
        setUnreadCount(Number(res.data.count) || 0);
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const tick = async () => {
      if (cancelled) return;
      await refreshUnreadCount();
    };
    tick();
    const id = setInterval(tick, 60000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [role, refreshUnreadCount]);

  useEffect(() => {
    const onChange = () => {
      refreshUnreadCount();
    };
    window.addEventListener('unicampus-notifications-changed', onChange);
    return () => window.removeEventListener('unicampus-notifications-changed', onChange);
  }, [role, refreshUnreadCount]);

  const loadBellPanel = async () => {
    try {
      const [countRes, listRes] = await Promise.all([
        notificationAPI.getUnreadCount(),
        notificationAPI.getUnreadNotifications(),
      ]);
      if (countRes?.success && countRes.data != null) {
        setUnreadCount(Number(countRes.data.count) || 0);
      }
      if (listRes?.success && Array.isArray(listRes.data)) {
        setBellItems(listRes.data);
      }
    } catch {
      setBellItems([]);
    }
  };

  const toggleBell = () => {
    const next = !bellOpen;
    setBellOpen(next);
    if (next) loadBellPanel();
  };

  const handleNotificationClick = async (n) => {
    try {
      await notificationAPI.markAsRead(n.id);
      setUnreadCount((c) => Math.max(0, c - 1));
      setBellItems((list) => list.filter((x) => x.id !== n.id));
      window.dispatchEvent(new Event('unicampus-notifications-changed'));
      setBellOpen(false);
      if (n.type === 'REGISTRATION_PENDING') {
        navigate('/dashboard/users');
      } else if (n.type === 'ADMIN_ALERTS') {
        if (n.message && n.message.toLowerCase().includes('booking')) {
          navigate('/dashboard/bookings/admin');
        } else {
          navigate('/dashboard/users');
        }
      }
    } catch (err) {
      console.error('Mark read failed', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setBellItems([]);
      window.dispatchEvent(new Event('unicampus-notifications-changed'));
      setBellOpen(false);
    } catch (err) {
      console.error('Mark all read failed', err);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="glass-panel sticky top-0 z-30 flex h-16 shrink-0 items-center justify-between gap-4 border-b-0 px-4 transition-all duration-300 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          className="inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={onOpenMobileNav}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-slate-900 dark:text-white">
            Dashboard
          </h2>
          <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">
            Smart Campus Operations Hub
          </p>
        </div>
      </div>

      <div className="relative flex items-center gap-2">
          {toggleTheme && (
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
          )}

          <div className="relative" ref={bellRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleBell();
              }}
              className="relative inline-flex rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 ? (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              ) : null}
            </button>
            {bellOpen ? (
              <div
                className="absolute right-0 top-full z-50 mt-3 w-[min(100vw-2rem,22rem)] origin-top-right rounded-2xl border border-slate-200/60 bg-white/90 py-2 shadow-2xl backdrop-blur-xl transition-all dark:border-slate-700/60 dark:bg-slate-900/90"
                role="menu"
              >
                <div className="flex items-center justify-between border-b border-slate-100/50 px-4 pb-3 pt-1 dark:border-slate-800/50">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</span>
                  {bellItems.length > 0 ? (
                    <button
                      type="button"
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAllRead();
                      }}
                    >
                      Mark all read
                    </button>
                  ) : null}
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {bellItems.length === 0 ? (
                    <p className="px-3 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
                      No unread notifications
                    </p>
                  ) : (
                    bellItems.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        className="flex w-full flex-col gap-0.5 border-b border-slate-50 px-3 py-2.5 text-left text-sm last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/80"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(n);
                        }}
                      >
                        <span className="text-slate-800 dark:text-slate-100">{n.message}</span>
                        <span className="text-[10px] uppercase tracking-wide text-slate-400">
                          {n.type?.replace(/_/g, ' ') ?? ''}
                        </span>
                      </button>
                    ))
                  )}
                </div>
                <button
                  type="button"
                  className="mt-1 w-full border-t border-slate-100 px-3 py-2 text-center text-xs font-medium text-indigo-600 hover:bg-slate-50 dark:border-slate-800 dark:text-indigo-400 dark:hover:bg-slate-800"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBellOpen(false);
                    navigate('/dashboard/notifications');
                  }}
                >
                  View all notifications
                </button>
                {role === 'ADMIN' && (
                  <button
                    type="button"
                    className="w-full px-3 py-2 text-center text-xs font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800"
                    onClick={(e) => {
                      e.stopPropagation();
                      setBellOpen(false);
                      navigate('/dashboard/users');
                    }}
                  >
                    User management
                  </button>
                )}
              </div>
            ) : null}
          </div>

        <div className="relative flex items-center" ref={menuRef}>
        <button
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2.5 rounded-xl border border-slate-200/50 bg-white/80 py-1.5 pl-1.5 pr-3 text-left shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-md dark:border-slate-700/50 dark:bg-slate-900/80 dark:hover:bg-slate-800"
        >
          {user?.profilePictureUrl ? (
            <img
              src={user.profilePictureUrl}
              alt=""
              className="h-8 w-8 rounded-md object-cover"
            />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-indigo-100 text-sm font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              {user?.fullName?.charAt(0) ?? 'U'}
            </span>
          )}
          <span className="hidden max-w-[140px] truncate text-sm font-medium text-slate-800 sm:block dark:text-slate-200">
            {user?.fullName ?? 'User'}
          </span>
          <ChevronDown
            className={`hidden h-4 w-4 text-slate-400 sm:block ${dropdownOpen ? 'rotate-180' : ''} transition-transform`}
          />
        </button>

        {dropdownOpen ? (
          <div
            className="absolute right-0 top-full z-50 mt-3 w-56 origin-top-right rounded-2xl border border-slate-200/60 bg-white/95 py-1 shadow-2xl backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-900/95"
            role="menu"
          >
            <div className="border-b border-slate-100/50 px-4 py-3 dark:border-slate-800/50">
              <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                {user?.fullName ?? 'User'}
              </p>
              <p className="truncate text-xs text-slate-500">{user?.email ?? ''}</p>
              <span className="mt-1 inline-flex rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {role}
              </span>
            </div>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => {
                setDropdownOpen(false);
                navigate('/dashboard/profile');
              }}
            >
              <User className="h-4 w-4 opacity-70" />
              Profile
            </button>
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => {
                setDropdownOpen(false);
                navigate('/dashboard/settings');
              }}
            >
              <Settings className="h-4 w-4 opacity-70" />
              Settings
            </button>
            <hr className="my-1 border-slate-100 dark:border-slate-800" />
            <button
              type="button"
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        ) : null}
        </div>
      </div>
    </header>
  );
};

export default DashboardNavbar;
