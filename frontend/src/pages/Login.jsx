import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleGoogleLogin = () => {
    setGoogleLoading(true);
    googleLogin();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const resp = await login({
        email: formData.email,
        password: formData.password
      });

      const status = resp.registrationStatus;
      
      if (status === 'PENDING_DETAILS') {
        navigate('/register/details', { replace: true });
      } else if (status === 'PENDING_APPROVAL') {
        navigate('/register/pending', { replace: true });
      } else if (status === 'REJECTED') {
        navigate('/register/rejected', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to login');
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper min-h-screen mesh-background">
      <div className="flex min-h-screen">
        {/* Left panel — enterprise accent (hidden on small screens) */}
        <div className="relative hidden w-0 flex-1 flex-col justify-between bg-slate-900 px-10 py-12 text-white lg:flex lg:w-[42%] lg:max-w-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_20%_0%,rgba(99,102,241,0.35),transparent)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
                <Building2 className="h-6 w-6 text-indigo-200" />
              </span>
              <div>
                <p className="text-sm font-semibold tracking-wide text-slate-200">
                  UniSphere
                </p>
                <p className="text-xs text-slate-400">Smart Campus</p>
              </div>
            </div>
            <h1 className="mt-16 text-3xl font-semibold leading-tight tracking-tight lg:text-4xl">
              One place for facilities, access, and campus operations.
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Secure sign-in with your institution account. Role-aware dashboards
              for students, faculty, technicians, and administrators.
            </p>
          </div>
          <div className="relative flex items-start gap-3 text-sm text-slate-400">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-indigo-400" />
            <p>
              Protected with OAuth 2.0 and institutional-grade session controls.
            </p>
          </div>
        </div>

        {/* Right panel — sign in */}
        <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-8 lg:px-16 bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl">
          <div className="mx-auto w-full max-w-md space-y-8">
            <div className="lg:hidden">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-sm font-bold text-white">
                  U
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">
                    UniSphere
                  </p>
                  <p className="text-xs text-slate-500">Smart Campus</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                Sign in
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Enter your credentials to access your account.
              </p>
            </div>

            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/50">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="email"
                      type="email"
                      required
                      autoComplete="off"
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      name="password"
                      type="password"
                      required
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-800"
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-700 dark:text-slate-300">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                    Forgot password?
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Log in'}
              </button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={googleLoading}
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md disabled:opacity-60 dark:border-slate-700/80 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {googleLoading ? 'Redirecting…' : 'Google'}
                </button>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-slate-600 dark:text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
