import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Clock, ShieldCheck, Mail, LogOut } from 'lucide-react';

const RegisterPending = () => {
  const { user, logout } = useAuth();

  return (
    <div className="dashboard-wrapper mesh-background min-h-screen flex items-center justify-center p-4">
      <div className="card-premium max-w-md w-full p-8 text-center space-y-6">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-indigo-100 dark:bg-indigo-900/30 rounded-full animate-pulse" />
          <div className="relative flex items-center justify-center w-full h-full text-indigo-600 dark:text-indigo-400">
            <Clock className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Registration Pending</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Your registration details have been submitted successfully.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 text-left space-y-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold block">Admin Review Required</span>
              Our administrators are currently reviewing your profile. This usually takes 24-48 hours.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Mail className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold block">Email Notification</span>
              We'll send an email to <span className="text-indigo-600 font-medium">{user?.email}</span> once your account is approved.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-6">
            If you have any questions, please contact campus support.
          </p>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all font-medium"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterPending;
