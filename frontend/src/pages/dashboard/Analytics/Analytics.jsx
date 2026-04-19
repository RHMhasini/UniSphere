import React, { useState, useEffect, useMemo } from 'react';
import { authAPI } from '../../../services/api';
import { 
  Users, 
  UserCheck, 
  UserX, 
  Clock, 
  BarChart4, 
  PieChart as PieChartIcon, 
  LineChart as LineChartIcon,
  Loader2,
  TrendingUp,
  ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format, parseISO, subDays, isAfter } from 'date-fns';

const COLORS = {
  primary: '#4f46e5', // indigo-600
  success: '#10b981', // emerald-500
  warning: '#f59e0b', // amber-500
  danger: '#ef4444',  // red-500
  info: '#0ea5e9',    // sky-500
  secondary: '#8b5cf6', // violet-500
  gray: '#94a3b8'     // slate-400
};

const ROLE_COLORS = {
  STUDENT: COLORS.primary,
  LECTURER: COLORS.success,
  TECHNICIAN: COLORS.warning,
  ADMIN: COLORS.gray
};

const STATUS_COLORS = {
  APPROVED: COLORS.success,
  PENDING_APPROVAL: COLORS.warning,
  PENDING_DETAILS: COLORS.info,
  REJECTED: COLORS.danger
};

const Analytics = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const res = await authAPI.adminGetAllUsers();
        // Unwrap API Response
        setUsers(res.data || []);
      } catch (err) {
        setError('Failed to load user data for analytics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Compute Metrics 
  const metrics = useMemo(() => {
    if (!users.length) return null;

    const total = users.length;
    const active = users.filter(u => u.isActive).length;
    const inactive = total - active;
    const pending = users.filter(u => u.registrationStatus === 'PENDING_APPROVAL').length;
    
    // Role Distribution (Exclude Admin for cleaner visualization of users)
    const roleStats = { STUDENT: 0, LECTURER: 0, TECHNICIAN: 0 };
    users.forEach(u => {
      if (roleStats[u.role] !== undefined) {
        roleStats[u.role]++;
      }
    });

    const roleData = Object.keys(roleStats).map(key => ({
      name: key.charAt(0) + key.slice(1).toLowerCase(),
      value: roleStats[key],
      color: ROLE_COLORS[key]
    })).filter(item => item.value > 0);

    // Status Distribution
    const statusStats = { APPROVED: 0, PENDING_APPROVAL: 0, PENDING_DETAILS: 0, REJECTED: 0 };
    users.forEach(u => {
      if (statusStats[u.registrationStatus] !== undefined) {
        statusStats[u.registrationStatus]++;
      }
    });

    const statusData = Object.keys(statusStats).map(key => ({
      name: key.replace('_', ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase()),
      value: statusStats[key],
      color: STATUS_COLORS[key]
    })).filter(item => item.value > 0);

    // Growth Chart (Last 30 days)
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    
    // Create map for the last 30 days
    const dailyRegistrations = {};
    for (let i = 29; i >= 0; i--) {
      const d = subDays(today, i);
      dailyRegistrations[format(d, 'MMM dd')] = 0;
    }

    users.forEach(u => {
      if (u.createdAt) {
        const date = parseISO(u.createdAt);
        if (isAfter(date, thirtyDaysAgo)) {
          const dateStr = format(date, 'MMM dd');
          if (dailyRegistrations[dateStr] !== undefined) {
            dailyRegistrations[dateStr]++;
          }
        }
      }
    });

    const growthData = Object.keys(dailyRegistrations).map(key => ({
      date: key,
      users: dailyRegistrations[key]
    }));

    return {
      total,
      active,
      inactive,
      pending,
      roleData,
      statusData,
      growthData
    };
  }, [users]);

  // UI States
  if (loading) {
    return (
      <div className="flex h-full min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center text-red-500">
          <p className="text-lg font-semibold">{error}</p>
          <p className="text-sm">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <p className="text-slate-500">No users found to generate analytics.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <button
          onClick={() => navigate('/dashboard/users')}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to User Management
        </button>
      </div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Admin Analytics</h1>
        <div className="flex items-center gap-2 rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
          <TrendingUp className="h-4 w-4" />
          Real-time insights
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: metrics.total, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/40' },
          { label: 'Active Users', value: metrics.active, icon: UserCheck, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/40' },
          { label: 'Pending Approval', value: metrics.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/40' },
          { label: 'Inactive Users', value: metrics.inactive, icon: UserX, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/40' },
        ].map((stat, i) => (
          <div key={i} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`rounded-xl p-3 ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Growth Chart */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="mb-4 flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Registration Timeline (Last 30 Days)</h3>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metrics.growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} className="text-slate-500 dark:text-slate-400" />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} allowDecimals={false} className="text-slate-500 dark:text-slate-400" />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Area type="monotone" dataKey="users" stroke={COLORS.primary} strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Role Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <PieChartIcon className="h-5 w-5 text-emerald-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Users by Role</h3>
          </div>
          <div className="flex h-64 items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={metrics.roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {metrics.roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: '#0f172a', fontWeight: '500' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="mb-4 flex items-center gap-2">
            <BarChart4 className="h-5 w-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Registration Status</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics.statusData} layout="vertical" margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis type="number" axisLine={false} tickLine={false} allowDecimals={false} className="text-slate-500" />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} className="text-slate-500 text-xs" />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                  {metrics.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Analytics;
