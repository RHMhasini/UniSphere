import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  Wrench,
  CheckCircle,
  XCircle,
  Clock,
  ToggleLeft,
  ToggleRight,
  Calendar,
  BadgeCheck,
  Building,
  BookOpen,
  FlaskConical,
  MapPin,
} from 'lucide-react';
import { authAPI } from '../../../services/api';

/* ─── helpers ─────────────────────────────────────────────────── */
const roleBadge = (role) => {
  const map = {
    STUDENT: 'bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300',
    LECTURER: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
    TECHNICIAN: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
    ADMIN: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300',
  };
  return map[role] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
};

const statusConfig = {
  APPROVED: { label: 'Approved', icon: CheckCircle, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-900/50' },
  PENDING_APPROVAL: { label: 'Pending Approval', icon: Clock, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-900/50' },
  REJECTED: { label: 'Rejected', icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-950/30', border: 'border-red-200 dark:border-red-900/50' },
  PENDING_DETAILS: { label: 'Pending Details', icon: Clock, color: 'text-slate-600 dark:text-slate-400', bg: 'bg-slate-50 dark:bg-slate-900/30', border: 'border-slate-200 dark:border-slate-700' },
};

const Detail = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
        <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      </span>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-400 dark:text-slate-500">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-slate-900 dark:text-white">{value}</p>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────── */
const UserDetailPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = React.useState(state?.user || null);
  const [loading, setLoading] = React.useState(false);

  // If navigated without state, redirect back
  if (!user) {
    navigate('/dashboard/users');
    return null;
  }

  const reg = statusConfig[user.registrationStatus] || statusConfig.PENDING_DETAILS;
  const RegIcon = reg.icon;

  const handleApprove = async () => {
    if (!window.confirm('Approve this user?')) return;
    setLoading(true);
    try {
      const res = await authAPI.adminApproveUser(user.id);
      if (res.success) setUser((u) => ({ ...u, registrationStatus: 'APPROVED', isActive: true }));
      else alert(res.message || 'Failed to approve');
    } catch { alert('Failed to approve user.'); }
    finally { setLoading(false); }
  };

  const handleReject = async () => {
    if (!window.confirm('Reject this user?')) return;
    setLoading(true);
    try {
      const res = await authAPI.adminRejectUser(user.id);
      if (res.success) setUser((u) => ({ ...u, registrationStatus: 'REJECTED', isActive: false }));
      else alert(res.message || 'Failed to reject');
    } catch { alert('Failed to reject user.'); }
    finally { setLoading(false); }
  };

  const handleToggleActive = async () => {
    const label = user.isActive ? 'deactivate' : 'activate';
    if (!window.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} this user?`)) return;
    setLoading(true);
    try {
      const res = await authAPI.adminUpdateStatus(user.id, !user.isActive);
      if (res.success) setUser((u) => ({ ...u, isActive: !u.isActive }));
      else alert(res.message || 'Failed to update');
    } catch { alert('Failed to update status.'); }
    finally { setLoading(false); }
  };

  const roleIcon = { STUDENT: GraduationCap, LECTURER: Briefcase, TECHNICIAN: Wrench, ADMIN: ShieldCheck }[user.role] || User;
  const RoleIcon = roleIcon;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/dashboard/users')}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition-colors dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            User Details
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Full profile and account information</p>
        </div>
      </div>

      {/* Profile Card */}
      <div className="card-premium overflow-hidden">
        {/* Top banner */}
        <div className="flex flex-col gap-5 p-7 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            {user.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.fullName}
                className="h-20 w-20 shrink-0 rounded-2xl object-cover ring-4 ring-indigo-100 dark:ring-indigo-900/40"
              />
            ) : (
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-indigo-100 text-3xl font-bold text-indigo-700 ring-4 ring-indigo-50 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-900/30">
                {user.fullName?.charAt(0) || 'U'}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.fullName}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadge(user.role)}`}>
                  <RoleIcon className="h-3 w-3" />
                  {user.role}
                </span>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${reg.bg} ${reg.border} ${reg.color}`}>
                  <RegIcon className="h-3 w-3" />
                  {reg.label}
                </span>
                {user.registrationStatus === 'APPROVED' && (
                  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    user.isActive
                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {user.isActive ? '● Active' : '○ Inactive'}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {user.registrationStatus === 'PENDING_APPROVAL' && (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleApprove}
                  className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  <CheckCircle className="h-4 w-4" />
                  Approve
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleReject}
                  className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-60"
                >
                  <XCircle className="h-4 w-4" />
                  Reject
                </button>
              </>
            )}
            {user.registrationStatus === 'APPROVED' && (
              <button
                type="button"
                disabled={loading}
                onClick={handleToggleActive}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition disabled:opacity-60 ${
                  user.isActive
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {user.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                {user.isActive ? 'Deactivate' : 'Activate'}
              </button>
            )}
          </div>
        </div>

        {/* Divider strip */}
        <div className="border-t border-slate-100 px-7 py-3 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-6 gap-y-1">
          <span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Joined: </span>
            {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : '—'}
          </span>
          <span>
            <span className="font-medium text-slate-700 dark:text-slate-300">Last updated: </span>
            {user.updatedAt ? new Date(user.updatedAt).toLocaleDateString(undefined, { dateStyle: 'long' }) : '—'}
          </span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Personal Info */}
        <div className="card-premium space-y-5 p-7">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <User className="h-5 w-5 text-indigo-500" />
            Personal Information
          </h3>
          <div className="space-y-4">
            <Detail icon={User} label="Full Name" value={user.fullName} />
            <Detail icon={Mail} label="Email" value={user.email} />
            <Detail icon={Phone} label="Phone" value={user.phone} />
            <Detail icon={Calendar} label="Date Joined" value={user.createdAt ? new Date(user.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : null} />
          </div>
        </div>

        {/* Role-specific Info */}
        <div className="card-premium space-y-5 p-7">
          <h3 className="flex items-center gap-2 text-base font-semibold text-slate-900 dark:text-white">
            <RoleIcon className="h-5 w-5 text-indigo-500" />
            {user.role === 'STUDENT' ? 'Academic Details' : user.role === 'LECTURER' ? 'Professional Details' : user.role === 'TECHNICIAN' ? 'Technical Details' : 'Admin Details'}
          </h3>
          <div className="space-y-4">
            {user.role === 'STUDENT' && (
              <>
                <Detail icon={BadgeCheck} label="Student ID" value={user.studentId} />
                <Detail icon={Building} label="Faculty" value={user.faculty} />
                <Detail icon={BookOpen} label="Degree Program" value={user.degreeProgram} />
                <Detail icon={Calendar} label="Year / Semester" value={[user.year, user.semester].filter(Boolean).join(' · ')} />
              </>
            )}
            {user.role === 'LECTURER' && (
              <>
                <Detail icon={BadgeCheck} label="Staff ID" value={user.staffId} />
                <Detail icon={Building} label="Faculty" value={user.faculty} />
                <Detail icon={Building} label="Department" value={user.department} />
                <Detail icon={Briefcase} label="Designation" value={user.designation} />
              </>
            )}
            {user.role === 'TECHNICIAN' && (
              <>
                <Detail icon={BadgeCheck} label="Staff ID" value={user.staffId} />
                <Detail icon={Building} label="Department" value={user.department} />
                <Detail icon={FlaskConical} label="Specialization" value={user.specialization} />
                <Detail icon={MapPin} label="Assigned Lab" value={user.assignedLab} />
                <Detail icon={Briefcase} label="Designation" value={user.designation} />
              </>
            )}
            {user.role === 'ADMIN' && (
              <Detail icon={ShieldCheck} label="Role" value="System Administrator" />
            )}
            {(!user.studentId && !user.staffId && user.role !== 'ADMIN') && (
              <p className="text-sm text-slate-500 dark:text-slate-400 italic">No role-specific details recorded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailPage;
