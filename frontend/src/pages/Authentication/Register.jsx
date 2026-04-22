import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Wrench,
  CheckCircle2,
  MailWarning
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  { id: 'STUDENT', label: 'Student', icon: <GraduationCap className="h-5 w-5" />, desc: 'Book labs & rooms, report faults, track your requests' },
  { id: 'LECTURER', label: 'Lecturer', icon: <Briefcase className="h-5 w-5" />, desc: 'Reserve spaces, request equipment, coordinate work orders' },
  { id: 'TECHNICIAN', label: 'Technician', icon: <Wrench className="h-5 w-5" />, desc: 'Handle work orders, log assets, close maintenance tickets' }
];

const Register = () => {
  const { googleLogin } = useAuth();
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for error in URL params (e.g. from OAuth failure)
    const params = new URLSearchParams(window.location.search);
    const errorType = params.get('error');
    if (errorType === 'invalid_email') {
      setError('Please use your correct campus email to continue with Google (e.g. ITxxxx@my.sliit.lk, *lec@gmail.com, *tec@gmail.com)');
    }
  }, []);

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    localStorage.setItem('oauth_source', '/register');
    // Google OAuth triggers a redirect, we redirect to backend
    window.location.href = "http://localhost:8081/api/oauth2/authorization/google";
  };

  return (
    <div className="dashboard-wrapper min-h-screen mesh-background py-10">
      <div className="flex justify-center px-4 sm:px-6 lg:px-8">
        
        <div className="w-full max-w-4xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-2xl shadow-xl overflow-hidden flex flex-col md:flex-row">
           {/* Left Panel */}
          <div className="hidden md:flex md:w-[45%] bg-slate-900 px-8 py-12 flex-col justify-between text-white relative overflow-hidden">
             <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(99,102,241,0.35),transparent)]" />
             <div className="relative z-10">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center text-[28px] leading-none font-bold text-indigo-400 mb-0.5">
                    ◈
                  </span>
                  <div>
                    <p className="text-sm font-semibold tracking-wide text-slate-200">UniSphere</p>
                    <p className="text-xs text-slate-400">Smart Campus</p>
                  </div>
                </div>
                <h2 className="mt-12 text-3xl font-semibold leading-tight text-white">Let's get you set up.</h2>
                <p className="mt-4 text-sm text-slate-400 leading-relaxed">
                  Create your account in minutes. Once you're in, you can book spaces, report issues, and manage everything on campus without chasing anyone.
                </p>
                
                <div className="mt-10 space-y-5">
                  {ROLES.map((role) => (
                    <div key={role.id} className="flex gap-4 items-start">
                      <div className="mt-1 flex-shrink-0 text-indigo-400 bg-white/10 p-2 rounded-lg ring-1 ring-white/20">
                        {role.icon}
                      </div>
                      <div>
                        <h4 className="font-medium text-slate-200">{role.label}</h4>
                        <p className="text-xs text-slate-400 mt-1">{role.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
             
             <div className="relative z-10 mt-10">
               <ShieldCheck className="h-10 w-10 text-indigo-400 mb-3" />
               <p className="text-sm font-medium">Secured with Enterprise-Grade encryption.</p>
             </div>
          </div>

          {/* Right Panel */}
          <div className="flex flex-1 flex-col justify-center py-12 px-8 sm:px-12 bg-white/50 dark:bg-slate-900/50">
            <div className="mb-6">
               <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">Create Account</h2>
               <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Get started securely with your institutional email.</p>
            </div>

            {error && (
              <div className="mb-6 p-4 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}

            <div className="bg-indigo-50/50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 rounded-xl p-5 mb-8">
              <h3 className="text-sm font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-3">
                <MailWarning className="w-4 h-4" />
                Required Email Format
              </h3>
              <ul className="space-y-2 text-sm text-slate-700 dark:text-slate-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Students:</strong> Must use <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">@my.sliit.lk</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Lecturers:</strong> Must use <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">*lec@gmail.com</code></span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  <span><strong>Technicians:</strong> Must use <code className="bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded text-xs">*tec@gmail.com</code></span>
                </li>
              </ul>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-3 italic">
                * Note: Your role details will be collected automatically after a successful sign in.
              </p>
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={googleLoading}
              className="w-full relative group flex items-center justify-center gap-4 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 px-4 py-4 text-sm font-medium text-slate-700 dark:text-slate-200 shadow-sm transition-all hover:bg-slate-50 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-slate-100 dark:via-slate-700 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform -translate-x-full group-hover:translate-x-full" />
              <svg className="h-6 w-6 relative z-10" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="relative z-10 text-[15px]">
                {googleLoading ? 'Redirecting to Google...' : 'Continue with Google'}
              </span>
            </button>

            <div className="mt-10">
              <p className="text-center text-sm text-slate-600 dark:text-slate-400 relative">
                <span className="bg-white/50 dark:bg-slate-900/50 px-2 relative z-10">
                  Already have an account?{' '}
                  <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors hover:underline">
                    Sign in instead
                  </Link>
                </span>
                <span className="absolute left-0 top-1/2 -z-0 w-full h-px bg-slate-200 dark:bg-slate-700" />
              </p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
