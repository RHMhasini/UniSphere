import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldOff, Mail } from 'lucide-react';

const InactiveDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center dashboard-wrapper mesh-background px-4">
      <div className="max-w-lg w-full">
        <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-10 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30 ring-4 ring-amber-200 dark:ring-amber-800">
            <ShieldOff className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Account Inactive
          </h1>

          {/* Message */}
          <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
            Your account has been temporarily deactivated by an administrator.
            You won't be able to access the platform until your account is restored.
          </p>

          {/* User info */}
          {user?.email && (
            <div className="mt-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-4 py-3 flex items-center gap-3 justify-center">
              <Mail className="h-4 w-4 text-slate-500 shrink-0" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                {user.email}
              </span>
            </div>
          )}

          {/* Contact admin */}
          <div className="mt-6 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4">
            <p className="text-sm font-medium text-indigo-900 dark:text-indigo-200">
              Need help?
            </p>
            <p className="mt-1 text-xs text-indigo-700 dark:text-indigo-400">
              Contact the system administrator at{' '}
              <a
                href="mailto:admin23unisphere@gmail.com"
                className="font-semibold underline hover:text-indigo-900 dark:hover:text-indigo-200"
              >
                admin23unisphere@gmail.com
              </a>{' '}
              to restore your access.
            </p>
          </div>

          {/* Logout */}
          <button
            onClick={logout}
            className="mt-8 w-full rounded-xl bg-slate-900 dark:bg-slate-100 px-4 py-3 text-sm font-semibold text-white dark:text-slate-900 shadow-sm transition hover:bg-slate-700 dark:hover:bg-white"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

export default InactiveDashboard;
