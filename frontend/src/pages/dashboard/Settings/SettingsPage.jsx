import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { authAPI } from '../../../services/api';
import { Settings, Bell, Calendar, Wrench, Shield, Loader2 } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    SYSTEM: true,
    BOOKING_APPROVED: true,
    TICKET_COMMENT: true,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user?.notificationPreferences) {
      setPreferences({
        SYSTEM: user.notificationPreferences.SYSTEM ?? true,
        BOOKING_APPROVED: user.notificationPreferences.BOOKING_APPROVED ?? true,
        TICKET_COMMENT: user.notificationPreferences.TICKET_COMMENT ?? true,
      });
    }
  }, [user]);

  const handleToggle = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await authAPI.updatePreferences(preferences);
      if (res.success) {
        setMessage('Preferences updated successfully.');
        // We could also manually update the local AuthContext here if needed
      }
    } catch (error) {
      console.error(error);
      setMessage('Failed to update preferences.');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const categories = [
    {
      id: 'SYSTEM',
      title: 'System Alerts & Maintenance',
      description: 'Receive notifications about campus-wide issues and application updates.',
      icon: <Shield className="w-5 h-5 text-indigo-500" />
    },
    {
      id: 'BOOKING_APPROVED',
      title: 'Booking Approvals',
      description: 'Receive notifications when your facilities or hall bookings are approved.',
      icon: <Calendar className="w-5 h-5 text-emerald-500" />
    },
    {
      id: 'TICKET_COMMENT',
      title: 'Service Ticket Updates',
      description: 'Receive notifications when a technician responds to your service requests.',
      icon: <Wrench className="w-5 h-5 text-blue-500" />
    }
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 lg:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
              <Settings className="w-6 h-6" />
            </span>
            Account Settings
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Manage your personal preferences and notification rules across the Smart Campus platform.
          </p>
        </div>
      </div>

      <div className="card-premium p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
          <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Notification Preferences</h2>
        </div>
        
        <div className="space-y-6">
          {categories.map((category) => (
            <div key={category.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-700 rounded-lg shrink-0">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-base font-medium text-slate-900 dark:text-gray-100">
                    {category.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                    {category.description}
                  </p>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => handleToggle(category.id)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 ${
                  preferences[category.id] ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={preferences[category.id]}
              >
                <span className="sr-only">Toggle {category.title}</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    preferences[category.id] ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-end border-t border-slate-200 dark:border-slate-800 pt-6">
          {message && (
            <span className="mr-4 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {message}
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 transition-all"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
