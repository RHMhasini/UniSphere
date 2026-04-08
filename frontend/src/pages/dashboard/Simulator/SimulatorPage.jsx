import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { notificationAPI } from '../../../services/api';
import { Settings, CheckCircle, MessageSquare, AlertTriangle, Send, Loader2 } from 'lucide-react';

function emitNotificationsChanged() {
  window.dispatchEvent(new Event('unicampus-notifications-changed'));
}

const SimulatorPage = () => {
  const { user } = useAuth();
  const [loadingType, setLoadingType] = useState(null);

  const simulateNotification = async (type, message) => {
    setLoadingType(type);
    try {
      const payload = {
        userId: user?.email, // Using email as the primary notification identifier
        type: type,
        message: message,
      };
      
      const res = await notificationAPI.createTestNotification(payload);
      if (res) {
        emitNotificationsChanged();
      }
    } catch (error) {
      console.error('Simulation event failed:', error);
      alert('Simulation failed. Target endpoint might not be active.');
    } finally {
      setLoadingType(null);
    }
  };

  const notificationScenarios = [
    {
      id: 'BOOKING_APPROVED',
      icon: <CheckCircle className="h-6 w-6 text-emerald-500" />,
      title: 'Booking Approved',
      description: 'Simulates Module B approving a booking request.',
      message: 'Your resource booking request (REQ-992) has been approved by the admin.',
      color: 'bg-emerald-50 dark:bg-emerald-950/30'
    },
    {
      id: 'TICKET_COMMENT',
      icon: <MessageSquare className="h-6 w-6 text-blue-500" />,
      title: 'New Ticket Comment',
      description: 'Simulates Module C triggering a new assignment or comment.',
      message: 'A technician commented on your incident ticket (TX-404): "We are looking into this projector issue now."',
      color: 'bg-blue-50 dark:bg-blue-950/30'
    },
    {
      id: 'SYSTEM_ALERT',
      icon: <AlertTriangle className="h-6 w-6 text-amber-500" />,
      title: 'System Alert',
      description: 'Simulates a generic broadcast or system warning.',
      message: 'Campus Main Server will undergo maintenance from 02:00 AM to 04:00 AM.',
      color: 'bg-amber-50 dark:bg-amber-950/30'
    }
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 lg:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <span className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </span>
            Module D: Developer Simulator
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            This panel triggers the core backend services associated with external modules (B and C). Use these simulators to demonstrate the real-time functionality of the Notification Engine.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
        {notificationScenarios.map((scenario) => (
          <div key={scenario.id} className="card-premium flex flex-col p-6 space-y-4">
            <div className={`p-3 rounded-2xl w-max ${scenario.color}`}>
              {scenario.icon}
            </div>
            
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                {scenario.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {scenario.description}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
              <p className="text-xs font-mono text-slate-600 dark:text-slate-300 line-clamp-3">
                "{scenario.message}"
              </p>
            </div>

            <button
              onClick={() => simulateNotification(scenario.id, scenario.message)}
              disabled={loadingType === scenario.id}
              className="mt-auto flex items-center justify-center gap-2 w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm text-sm font-semibold transition-all disabled:opacity-70"
            >
              {loadingType === scenario.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Trigger Event
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SimulatorPage;
