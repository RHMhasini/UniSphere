import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { XCircle, HelpCircle, MessageSquare, LogOut } from 'lucide-react';

const RegisterRejected = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="dashboard-wrapper mesh-background min-h-screen flex items-center justify-center p-4">
      <div className="card-premium max-w-md w-full p-8 text-center space-y-6 border-t-4 border-t-rose-500">
        <div className="relative mx-auto w-20 h-20">
          <div className="absolute inset-0 bg-rose-100 dark:bg-rose-900/30 rounded-full" />
          <div className="relative flex items-center justify-center w-full h-full text-rose-500 dark:text-rose-400">
            <XCircle className="w-10 h-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Registration Rejected</h2>
          <p className="text-slate-600 dark:text-slate-400">
            Unfortunately, your registration request has not been approved by the IT Administrator.
          </p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-6 text-left space-y-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold block">What happens now?</span>
              Your account access has been restricted. You will not be able to access the dashboard or internal features.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <MessageSquare className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700 dark:text-slate-300">
              <span className="font-semibold block">Contact Administrator</span>
              If you believe this is a mistake, please reach out to the <span className="text-indigo-600 font-medium">IT Support Team</span> or your department head for clarification.
            </p>
          </div>
        </div>

        <div className="pt-4">
          <p className="text-xs text-slate-500 dark:text-slate-500 mb-6">
            For further assistance, please contact campus support.
          </p>
          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
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

export default RegisterRejected;
