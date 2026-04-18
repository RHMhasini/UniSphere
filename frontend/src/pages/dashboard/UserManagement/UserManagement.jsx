import React, { useState, useEffect } from 'react';
import { authAPI } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import { Loader2, AlertTriangle, Users, CheckCircle, XCircle, ShieldOff, ShieldCheck } from 'lucide-react';

const roleBadgeClass = (role) => {
  const r = (role || '').toLowerCase();
  const map = {
    student: 'bg-sky-50 text-sky-800 ring-sky-600/15 dark:bg-sky-950/40 dark:text-sky-300',
    lecturer: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300',
    technician: 'bg-amber-50 text-amber-900 ring-amber-600/15 dark:bg-amber-950/40 dark:text-amber-200',
    admin: 'bg-indigo-50 text-indigo-800 ring-indigo-600/15 dark:bg-indigo-950/40 dark:text-indigo-300',
  };
  return (
    map[r] ||
    'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300'
  );
};

const statusBadgeClass = (status) => {
  const s = (status || '').toUpperCase();
  const map = {
    PENDING_DETAILS: 'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300',
    PENDING_APPROVAL: 'bg-amber-50 text-amber-900 ring-amber-600/15 dark:bg-amber-950/40 dark:text-amber-200',
    APPROVED: 'bg-emerald-50 text-emerald-800 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300',
    REJECTED: 'bg-red-50 text-red-800 ring-red-600/15 dark:bg-red-950/40 dark:text-red-300',
  };
  return map[s] || 'bg-slate-100 text-slate-700 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-300';
};

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user: adminUser } = useAuth();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await authAPI.adminGetAllUsers();
        if (response.success) {
          setUsers(response.data || []);
        } else {
          setError(response.message || 'Failed to fetch users.');
        }
      } catch (err) {
        console.error('Error fetching users:', err);
        setError(
          'Failed to fetch users. Please ensure you are logged in as an ADMIN.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleStatusToggle = async (userId, currentIsActive) => {
    const newStatus = !currentIsActive;
    const label = newStatus ? 'activate' : 'deactivate';
    if (window.confirm(`Are you sure you want to ${label} this user?`)) {
      try {
        const response = await authAPI.adminUpdateStatus(userId, newStatus);
        if (response.success) {
          setUsers(users.map((u) => (u.id === userId ? { ...u, isActive: newStatus } : u)));
        } else {
          alert('Failed to update status: ' + response.message);
        }
      } catch (err) {
        console.error('Error toggling status:', err);
        alert('Failed to update status.');
      }
    }
  };

  const handleApprove = async (userId) => {
    if (window.confirm('Are you sure you want to approve this user?')) {
      try {
        const response = await authAPI.adminApproveUser(userId);
        if (response.success) {
          setUsers(users.map((u) => (u.id === userId ? { ...u, registrationStatus: 'APPROVED' } : u)));
          alert('User approved successfully!');
        } else {
          alert('Failed to approve user: ' + response.message);
        }
      } catch (err) {
        console.error('Error approving user:', err);
        alert('Failed to approve user.');
      }
    }
  };

  const handleReject = async (userId) => {
    if (window.confirm('Are you sure you want to reject this user?')) {
      try {
        const response = await authAPI.adminRejectUser(userId);
        if (response.success) {
          setUsers(users.map((u) => (u.id === userId ? { ...u, registrationStatus: 'REJECTED' } : u)));
          alert('User rejected successfully!');
        } else {
          alert('Failed to reject user: ' + response.message);
        }
      } catch (err) {
        console.error('Error rejecting user:', err);
        alert('Failed to reject user.');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to permanently delete this user?')) {
      try {
        const response = await authAPI.adminDeleteUser(userId);
        if (response.success) {
          setUsers(users.filter((u) => u.id !== userId));
          alert('User deleted successfully!');
        } else {
          alert('Failed to delete user: ' + response.message);
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        alert('Failed to delete user.');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white py-16 dark:border-slate-800 dark:bg-slate-900">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600 dark:text-indigo-400" />
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Loading users…
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-200 bg-red-50/80 p-8 text-center dark:border-red-900/50 dark:bg-red-950/30">
        <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
        <p className="text-sm font-medium text-red-900 dark:text-red-200">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-6 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            User management
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            View accounts, assign roles, and remove users.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Users className="h-4 w-4" />
          <span>{users.length} user{users.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      <div className="card-premium overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-800/50">
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  User
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Role
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Status
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Joined
                </th>
                <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm italic text-slate-500 dark:text-slate-400"
                  >
                    No users found in the system.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {user.profilePictureUrl ? (
                          <img
                            src={user.profilePictureUrl}
                            alt=""
                            className="h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700 ring-2 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-800">
                            {user.fullName?.charAt(0) || 'U'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium text-slate-900 dark:text-white">
                            {user.fullName}
                          </p>
                          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${roleBadgeClass(user.role)}`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusBadgeClass(user.registrationStatus)}`}
                        >
                          {user.registrationStatus?.replace('_', ' ')}
                        </span>
                        {user.registrationStatus === 'APPROVED' && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${
                              user.isActive
                                ? 'bg-emerald-50 text-emerald-800 ring-emerald-600/15 dark:bg-emerald-950/40 dark:text-emerald-300'
                                : 'bg-slate-100 text-slate-600 ring-slate-600/10 dark:bg-slate-800 dark:text-slate-400'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-slate-700 dark:text-slate-300">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : '—'}
                    </td>
                    <td className="px-4 py-4">
                      {user.id !== adminUser?.id ? (
                        <div className="flex flex-wrap items-center gap-2">
                          {user.registrationStatus === 'PENDING_APPROVAL' && (
                            <div className="flex items-center gap-2 mr-2 pr-2 border-r border-slate-200 dark:border-slate-700">
                              <button
                                type="button"
                                className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600"
                                onClick={() => handleApprove(user.id)}
                              >
                                <CheckCircle className="h-3.5 w-3.5" />
                                Approve
                              </button>
                              <button
                                type="button"
                                className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 dark:bg-rose-500 dark:hover:bg-rose-600"
                                onClick={() => handleReject(user.id)}
                              >
                                <XCircle className="h-3.5 w-3.5" />
                                Reject
                              </button>
                            </div>
                          )}
                          {user.registrationStatus === 'APPROVED' && (
                            <button
                              type="button"
                              title={user.isActive ? 'Deactivate user' : 'Activate user'}
                              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition ${
                                user.isActive
                                  ? 'bg-amber-500 hover:bg-amber-600'
                                  : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600'
                              }`}
                              onClick={() => handleStatusToggle(user.id, user.isActive)}
                            >
                              {user.isActive
                                ? <><ShieldOff className="h-3.5 w-3.5" /> Deactivate</>
                                : <><ShieldCheck className="h-3.5 w-3.5" /> Activate</>}
                            </button>
                          )}
                          <button
                            type="button"
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
