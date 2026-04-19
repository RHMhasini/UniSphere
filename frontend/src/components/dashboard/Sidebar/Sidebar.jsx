import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Bell,
  Calendar,
  Building2,
  GraduationCap,
  Wrench,
  Package,
  LogOut,
  X,
  BarChart4,
} from 'lucide-react';

const navCls = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300',
    isActive
      ? 'bg-indigo-50/80 text-indigo-700 shadow-[inset_3px_0_0_0_#4f46e5] dark:bg-indigo-500/10 dark:text-indigo-300 dark:shadow-[inset_3px_0_0_0_#6366f1]'
      : 'text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-white',
  ].join(' ');

/**
 * @param {{ mobileOpen?: boolean, onCloseMobile?: () => void }} props
 */
const Sidebar = ({ mobileOpen = false, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const role = user?.role;

  const closeIfMobile = () => {
    onCloseMobile?.();
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
    <>
      <aside
        className={[
          'glass-panel fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r-0 shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:static lg:z-auto lg:w-64 lg:translate-x-0 lg:shadow-[2px_0_12px_rgba(0,0,0,0.03)] dark:lg:shadow-[2px_0_12px_rgba(0,0,0,0.2)]',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        ].join(' ')}
        aria-label="Main navigation"
      >
        <div className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-slate-200/50 px-4 dark:border-slate-700/50">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex items-center justify-center text-[28px] leading-none font-bold text-indigo-600 dark:text-indigo-500 mb-0.5">
              ◈
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                UniSphere
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                Smart Campus
              </p>
            </div>
          </div>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Overview
          </p>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/dashboard" end className={navCls} onClick={closeIfMobile}>
                <LayoutDashboard className="h-5 w-5 shrink-0 opacity-70 group-[.active]:opacity-100" />
                Dashboard
              </NavLink>
            </li>

            {role === 'ADMIN' && (
              <>
                <li>
                  <NavLink
                    to="/dashboard/notifications"
                    className={navCls}
                    onClick={closeIfMobile}
                  >
                    <Bell className="h-5 w-5 shrink-0 opacity-80" />
                    Notifications
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/users"
                    className={navCls}
                    onClick={closeIfMobile}
                  >
                    <Users className="h-5 w-5 shrink-0 opacity-80" />
                    User management
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/analytics"
                    className={navCls}
                    onClick={closeIfMobile}
                  >
                    <BarChart4 className="h-5 w-5 shrink-0 opacity-80" />
                    Analytics
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/simulator"
                    className={navCls}
                    onClick={closeIfMobile}
                  >
                    <Wrench className="h-5 w-5 shrink-0 opacity-80" />
                    Dev Simulator
                  </NavLink>
                </li>
              </>
            )}

            {role === 'STUDENT' && (
              <>
                <li>
                  <NavLink
                    to="/dashboard/bookings"
                    className={navCls}
                    onClick={closeIfMobile}
                  >
                    <Calendar className="h-5 w-5 shrink-0 opacity-80" />
                    My bookings
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/resources"
                    className={navCls}
                    onClick={closeIfMobile}
                  >
                    <Building2 className="h-5 w-5 shrink-0 opacity-80" />
                    Facilities
                  </NavLink>
                </li>
              </>
            )}

            {role === 'LECTURER' && (
              <>
                <li>
                  <NavLink
                    to="/dashboard/classes"
                    className={navCls}
                    onClick={closeIfMobile}
                  >
                    <GraduationCap className="h-5 w-5 shrink-0 opacity-80" />
                    My classes
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/bookings"
                    className={navCls}
                    onClick={closeIfMobile}
                  >
                    <Calendar className="h-5 w-5 shrink-0 opacity-80" />
                    Hall bookings
                  </NavLink>
                </li>
              </>
            )}

            {role === 'TECHNICIAN' && (
              <>
                <li>
                  <NavLink
                    to="/dashboard/tickets"
                    className={navCls}
                    onClick={closeIfMobile}
                  >
                    <Wrench className="h-5 w-5 shrink-0 opacity-80" />
                    Service tickets
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to="/dashboard/inventory"
                    className={navCls}
                    onClick={closeIfMobile}
                  >
                    <Package className="h-5 w-5 shrink-0 opacity-80" />
                    Asset inventory
                  </NavLink>
                </li>
              </>
            )}
          </ul>
        </nav>

        <div className="border-t border-slate-200/50 p-4 dark:border-slate-700/50">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50/50 border border-slate-200/50 px-3 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-white hover:shadow-md dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
