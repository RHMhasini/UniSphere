import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import StatsGrid, {
  Users,
  Building2,
  Ticket,
  CalendarDays,
} from '../../../components/dashboard/StatsGrid';
import EnterpriseDataTable from '../../../components/dashboard/EnterpriseDataTable';

/** Demo rows — replace with API data */
const DEMO_ROWS = [
  {
    id: '1',
    name: 'North Campus HVAC',
    category: 'Facilities',
    updated: 'Apr 2, 2026',
    status: 'active',
  },
  {
    id: '2',
    name: 'Lab 204 booking',
    category: 'Resources',
    updated: 'Apr 1, 2026',
    status: 'pending',
  },
  {
    id: '3',
    name: 'Wi-Fi outage — Block B',
    category: 'Network',
    updated: 'Mar 31, 2026',
    status: 'failed',
  },
  {
    id: '4',
    name: 'Parking gate repair',
    category: 'Maintenance',
    updated: 'Mar 30, 2026',
    status: 'completed',
  },
];

const TABLE_COLUMNS = [
  { key: 'name', header: 'Item' },
  { key: 'category', header: 'Category' },
  { key: 'updated', header: 'Last updated' },
];

const DashboardHome = () => {
  const { user } = useAuth();
  const role = user?.role;

  const statsItems = [
    {
      label: 'Active users',
      value: '2,847',
      sub: '+12.4% vs last month',
      icon: Users,
      accent: 'indigo',
    },
    {
      label: 'Facilities online',
      value: '186',
      sub: 'Across 4 campuses',
      icon: Building2,
      accent: 'slate',
    },
    {
      label: 'Open tickets',
      value: '23',
      sub: '4 high priority',
      icon: Ticket,
      accent: 'amber',
    },
    {
      label: 'Bookings today',
      value: '412',
      sub: 'Peak 10:00–12:00',
      icon: CalendarDays,
      accent: 'emerald',
    },
  ];

  const roleBlurb = {
    ADMIN: 'Organization-wide visibility and administration.',
    STUDENT: 'Your classes, bookings, and campus services.',
    TEACHER: 'Classes, halls, and teaching resources.',
    TECHNICIAN: 'Maintenance workflows and asset health.',
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Welcome back, {user?.fullName || 'there'}
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-400">
          {roleBlurb[role] ??
            'Here is a snapshot of campus operations. Connect these widgets to your backend when ready.'}
        </p>
      </div>

      <StatsGrid items={statsItems} />

      <section className="space-y-4">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Recent activity
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Latest operational signals (sample data for layout preview)
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          >
            View all
          </button>
        </div>

        <EnterpriseDataTable columns={TABLE_COLUMNS} rows={DEMO_ROWS} />
      </section>
    </div>
  );
};

export default DashboardHome;
