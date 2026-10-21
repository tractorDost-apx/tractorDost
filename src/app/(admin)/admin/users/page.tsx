'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Filter,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  ShieldCheck,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Activity,
  Mail,
  Phone,
  Clock,
  MapPin,
  Globe,
  BadgeCheck,
  Building2,
  RotateCcw,
  Loader2,
  X,
} from 'lucide-react';
import { usersAPI } from '@/lib/api/users';
import { apiClient } from '@/lib/api/axios/axios';
import { User } from '@/types/models/user';
import { UserEditModal } from './components/UserEditModal';
import { UserCreateModal } from './components/UserCreateModal';
import Pagination from '@/components/shared/Pagination';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all');
  const [kycFilter, setKycFilter] = useState('');
  const [rolesList, setRolesList] = useState<{ id: number; name: string }[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [userToToggle, setUserToToggle] = useState<{ user: User; willDeactivate: boolean } | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteModalError, setDeleteModalError] = useState<string | null>(null);

  useEffect(() => {
    // Load available roles from backend
    apiClient
      .get('/roles/getAll')
      .then((res) => {
        if (res.data?.data?.roles) {
          setRolesList(res.data.data.roles);
        }
      })
      .catch((err) => console.error('Failed to load roles list:', err));
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await usersAPI.getAllUsers({
        page,
        limit,
        search: search || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter === 'all' ? undefined : statusFilter,
        kycStatus: (kycFilter as any) || undefined,
      });
      if (res.success) {
        setUsers(res.data.data);
        setTotalCount(res.data.meta.total);
        setTotalPages(res.data.meta.totalPages);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err?.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page, limit, roleFilter, statusFilter, kycFilter]);

  const handleToggleActiveClick = (targetUser: User, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (togglingId === targetUser.id) return;
    setUserToToggle({ user: targetUser, willDeactivate: Boolean(targetUser.isActive) });
  };

  const executeToggleActive = async (targetUser: User, willDeactivate: boolean) => {
    if (togglingId) return; // Prevent race conditions & rapid double clicks
    const id = targetUser.id;
    const actionLabel = willDeactivate ? 'deactivate' : 'activate';

    try {
      setTogglingId(id);
      setError(null);
      let newActiveState = !willDeactivate;

      // Method 1: Try dedicated toggleUserActive endpoint (clears sessions in backend if deactivating)
      try {
        const res = await usersAPI.toggleUserActive(id);
        if (res?.success && res?.data && typeof res.data.isActive === 'boolean') {
          newActiveState = res.data.isActive;
        }
      } catch (toggleErr: any) {
        console.warn('Dedicated toggleUserActive endpoint failed, attempting updateUserById fallback...', toggleErr);
        // Method 2: Resilient fallback to updateUserById with explicit boolean
        const fallbackRes = await usersAPI.updateUserById(id, { isActive: !willDeactivate });
        if (fallbackRes?.success && fallbackRes?.data && typeof fallbackRes.data.isActive === 'boolean') {
          newActiveState = fallbackRes.data.isActive;
        } else {
          throw toggleErr;
        }
      }

      // Optimistic update of local user list
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: newActiveState } : u))
      );

      if (selectedUser?.id === id) {
        setSelectedUser((prev) => (prev ? { ...prev, isActive: newActiveState } : null));
      }

      setActionSuccess(
        `User ${targetUser.fullName ? `"${targetUser.fullName}"` : `#${id}`} has been ${
          newActiveState ? 'activated' : 'deactivated'
        } successfully.`
      );
      setTimeout(() => setActionSuccess(null), 5000);

      // Close confirmation modal
      setUserToToggle(null);

      // Refresh list to keep pagination and counters in sync
      fetchUsers();
    } catch (err: any) {
      console.error('Failed to toggle active status:', err);
      const msg =
        err?.response?.data?.message ||
        (Array.isArray(err?.response?.data?.error)
          ? err.response.data.error.map((i: any) => i.message).join(', ')
          : null) ||
        `Failed to ${actionLabel} user account. Please check permissions.`;
      setError(msg);
      setUserToToggle(null);
    } finally {
      setTogglingId(null);
    }
  };

  const handleDeleteClick = (targetUser: User, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (deletingId === targetUser.id) return;
    setDeleteModalError(null);
    setUserToDelete(targetUser);
  };

  const executeDelete = async (targetUser: User) => {
    if (deletingId) return;
    const id = targetUser.id;

    try {
      setDeletingId(id);
      setDeleteModalError(null);
      setError(null);

      const res = await usersAPI.deleteUserById(id);
      if (res?.success) {
        // Optimistic UI update: instantly remove from state
        setUsers((prev) => prev.filter((u) => u.id !== id));
        setTotalCount((prev) => Math.max(0, prev - 1));
        if (selectedUser?.id === id) setSelectedUser(null);
        if (expandedId === id) setExpandedId(null);

        setActionSuccess(
          `User ${targetUser.fullName ? `"${targetUser.fullName}"` : `#${id}`} has been deleted successfully.`
        );
        setTimeout(() => setActionSuccess(null), 5000);

        // Close delete modal
        setUserToDelete(null);

        // Refresh list in background to sync pagination
        fetchUsers();
      } else {
        throw new Error(res?.message || 'Failed to delete user');
      }
    } catch (err: any) {
      console.warn('Delete user operation warning:', err?.message || err);
      const statusCode = err?.response?.status;
      const apiMessage = err?.response?.data?.message;

      if (statusCode === 403 || apiMessage === 'Unauthorized') {
        setDeleteModalError(
          'Permanent deletion requires administrative privileges. You can deactivate this account instead to immediately revoke login and platform access.'
        );
      } else {
        const errorMsg =
          apiMessage ||
          (Array.isArray(err?.response?.data?.error)
            ? err.response.data.error.map((i: any) => i.message).join(', ')
            : null) ||
          'Failed to delete user account. Please check permissions.';
        setDeleteModalError(errorMsg);
      }
    } finally {
      setDeletingId(null);
    }
  };

  const openEditModal = (user: User, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const resetFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('all');
    setKycFilter('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(search || roleFilter || statusFilter !== 'all' || kycFilter);

  const getRoleBadgeStyle = (roleName?: string) => {
    const name = roleName?.toUpperCase() || '';
    if (name.includes('ADMIN')) {
      return 'bg-purple-100 dark:bg-purple-950/40 text-purple-900 dark:text-purple-300 border-purple-300 dark:border-purple-800/50';
    }
    if (name.includes('AGENT')) {
      return 'bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border-amber-300 dark:border-amber-800/50';
    }
    if (name.includes('DEALER')) {
      return 'bg-blue-100 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300 border-blue-300 dark:border-blue-800/50';
    }
    return 'bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-300 border-slate-300 dark:border-slate-700';
  };

  const getKycBadge = (status?: string) => {
    switch (status) {
      case 'VERIFIED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-emerald-300 dark:border-emerald-800/50 bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-[10px] font-bold text-emerald-900 dark:text-emerald-300">
            <CheckCircle size={10} className="text-emerald-700 dark:text-emerald-400" />
            Verified
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-rose-300 dark:border-rose-800/50 bg-rose-100 dark:bg-rose-950/40 px-2 py-0.5 text-[10px] font-bold text-rose-900 dark:text-rose-300">
            <XCircle size={10} className="text-rose-700 dark:text-rose-400" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-md border border-amber-300 dark:border-amber-800/50 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 text-[10px] font-bold text-amber-900 dark:text-amber-300">
            <Clock size={10} className="text-amber-800 dark:text-amber-400" />
            Pending
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
      {/* Header section with Create User action */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-foreground text-2xl sm:text-3xl font-black tracking-tight">
              User Management
            </h1>
            <span className="rounded-lg bg-[var(--color-brand-green)]/10 px-2.5 py-0.5 text-xs font-black text-[var(--color-brand-green)]">
              User Master
            </span>
          </div>
          <p className="text-muted mt-1 text-xs sm:text-sm font-semibold">
            Create, configure, and audit master profiles, permissions, roles, and platform users.
          </p>
        </div>

        {/* CREATE USER MASTER BUTTON */}
        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:bg-[var(--color-brand-green-dark)] hover:scale-[1.02] active:scale-[0.98] cursor-pointer shrink-0"
        >
          <Plus size={16} />
          <span>+ Create User Master</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-bold text-red-600 dark:text-red-400">
          <AlertCircle size={18} className="shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {actionSuccess && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
            <p>{actionSuccess}</p>
          </div>
          <button
            type="button"
            onClick={() => setActionSuccess(null)}
            className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-300 cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* Filter and Search Panel */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5 items-center">
          {/* Search box */}
          <div className="group relative lg:col-span-2">
            <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
              <Search size={15} />
            </div>
            <input
              type="text"
              placeholder="Search by full name, 10-digit mobile, or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-medium text-foreground placeholder:text-muted transition-all focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none"
            />
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer"
            >
              <option value="">All Roles</option>
              {rolesList.map((r) => (
                <option key={r.id} value={r.name}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as any);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="true">Active Only</option>
              <option value="false">Inactive Only</option>
            </select>
          </div>

          {/* KYC Filter */}
          <div>
            <select
              value={kycFilter}
              onChange={(e) => {
                setKycFilter(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer"
            >
              <option value="">All KYC Status</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {/* Counter and Reset Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)] text-xs font-bold text-muted">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-foreground">
              <Users size={14} className="text-[var(--color-brand-green)]" />
              Total Users: <strong>{totalCount}</strong>
            </span>
            {hasActiveFilters && (
              <span className="text-[11px] text-[var(--color-brand-green)] font-semibold">
                (Filtered view)
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-foreground/5 text-muted text-[11px] font-black tracking-wider uppercase border-b border-[var(--border-subtle)]">
              <tr>
                <th className="w-10 px-4 py-3.5"></th>
                <th className="px-4 py-3.5 min-w-[180px]">User Details</th>
                <th className="px-4 py-3.5 min-w-[190px]">Contact Details</th>
                <th className="px-4 py-3.5 min-w-[110px]">Role</th>
                <th className="px-4 py-3.5 min-w-[110px]">KYC</th>
                <th className="px-4 py-3.5 min-w-[110px]">Status</th>
                <th className="px-4 py-3.5 text-right min-w-[310px]">Master Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-muted px-6 py-12 text-center font-bold">
                    Loading users list...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-muted px-6 py-12 text-center font-bold">
                    No users found matching your search or filters.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr
                      className={`hover:bg-foreground/5 cursor-pointer transition-colors ${
                        expandedId === user.id ? 'bg-foreground/5' : ''
                      }`}
                      onClick={() => toggleExpand(user.id)}
                    >
                      <td className="text-muted px-4 py-3.5">
                        {expandedId === user.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </td>

                      {/* User Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-[var(--color-brand-green)]/10 text-sm font-black text-[var(--color-brand-green)] uppercase">
                            {user.fullName ? user.fullName.charAt(0) : 'U'}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-foreground text-xs font-black tracking-tight">
                              {user.fullName || 'Unnamed User'}
                            </span>
                            <span className="text-muted text-[10px] font-mono font-semibold">
                              ID: #{user.id}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="px-4 py-3.5">
                        <div className="flex flex-col gap-0.5 text-xs">
                          <span className="text-foreground font-mono font-bold flex items-center gap-1.5">
                            <Phone size={11} className="text-muted shrink-0" />
                            {user.mobile ? `+91 ${user.mobile}` : 'No mobile'}
                          </span>
                          <span className="text-muted text-[11px] flex items-center gap-1.5 font-medium">
                            <Mail size={11} className="shrink-0" />
                            {user.email || 'No email specified'}
                          </span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-black uppercase tracking-wide ${getRoleBadgeStyle(
                            user.role?.name
                          )}`}
                        >
                          {user.role?.name || 'CUSTOMER'}
                        </span>
                      </td>

                      {/* KYC Status */}
                      <td className="px-4 py-3.5">{getKycBadge(user.kycStatus)}</td>

                      {/* Active Status */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                            user.isActive
                              ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50'
                              : 'bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800/50'
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              user.isActive ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-rose-600 dark:bg-rose-400'
                            }`}
                          />
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2 shrink-0">
                          {/* EDIT USER MASTER BUTTON */}
                          <button
                            type="button"
                            onClick={(e) => openEditModal(user, e)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-300 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 text-[11px] font-bold text-blue-900 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all cursor-pointer shadow-sm whitespace-nowrap shrink-0"
                            title="Edit User Master Record"
                          >
                            <Edit2 size={12} />
                            <span>Edit Master</span>
                          </button>

                          {/* DEACTIVATE / ACTIVATE BUTTON WITH SPINNER */}
                          <button
                            type="button"
                            disabled={togglingId === user.id || (user.isActive && user.role?.name === 'SUPER_ADMIN')}
                            onClick={(e) => handleToggleActiveClick(user, e)}
                            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                              user.isActive
                                ? 'border-amber-300 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/40'
                                : 'border-emerald-300 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40'
                            }`}
                            title={
                              user.isActive && user.role?.name === 'SUPER_ADMIN'
                                ? 'SUPER_ADMIN cannot be deactivated'
                                : user.isActive
                                ? 'Deactivate User Account'
                                : 'Activate User Account'
                            }
                          >
                            {togglingId === user.id ? (
                              <>
                                <Loader2 size={12} className="animate-spin text-foreground" />
                                <span>Updating...</span>
                              </>
                            ) : user.isActive ? (
                              <>
                                <XCircle size={12} className="text-amber-600 dark:text-amber-400" />
                                <span>Deactivate</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle size={12} className="text-emerald-600 dark:text-emerald-400" />
                                <span>Activate</span>
                              </>
                            )}
                          </button>

                          {/* DELETE USER BUTTON */}
                          <button
                            type="button"
                            disabled={deletingId === user.id || user.role?.name === 'SUPER_ADMIN'}
                            onClick={(e) => handleDeleteClick(user, e)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800/60 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-[11px] font-bold text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                            title={
                              user.role?.name === 'SUPER_ADMIN'
                                ? 'SUPER_ADMIN cannot be deleted'
                                : 'Delete User Account'
                            }
                          >
                            {deletingId === user.id ? (
                              <>
                                <Loader2 size={12} className="animate-spin text-rose-600 dark:text-rose-400" />
                                <span>Deleting...</span>
                              </>
                            ) : (
                              <>
                                <Trash2 size={12} className="text-rose-600 dark:text-rose-400" />
                                <span>Delete</span>
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED DEEP USER MASTER VIEW */}
                    {expandedId === user.id && (
                      <tr>
                        <td colSpan={7} className="bg-foreground/[0.02] px-0 py-0 border-b border-[var(--border-subtle)]">
                          <div className="animate-fade-in flex flex-col gap-4 border-l-4 border-[var(--color-brand-green)] p-5 md:p-6 bg-foreground/[0.01]">
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--border-subtle)] pb-3">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-black uppercase tracking-wider text-foreground">
                                  User Master Record — #{user.id} ({user.fullName || 'N/A'})
                                </span>
                                <span
                                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                                    user.isActive
                                      ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50'
                                      : 'bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border border-rose-300 dark:border-rose-800/50'
                                  }`}
                                >
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      user.isActive ? 'bg-emerald-600 dark:bg-emerald-400' : 'bg-rose-600 dark:bg-rose-400'
                                    }`}
                                  />
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {/* Drawer Activate/Deactivate Button */}
                                <button
                                  type="button"
                                  disabled={togglingId === user.id || (user.isActive && user.role?.name === 'SUPER_ADMIN')}
                                  onClick={(e) => handleToggleActiveClick(user, e)}
                                  className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed ${
                                    user.isActive
                                      ? 'border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-300 hover:bg-amber-100'
                                      : 'border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-300 hover:bg-emerald-100'
                                  }`}
                                >
                                  {togglingId === user.id ? (
                                    <>
                                      <Loader2 size={13} className="animate-spin" />
                                      <span>Updating Status...</span>
                                    </>
                                  ) : user.isActive ? (
                                    <>
                                      <XCircle size={13} className="text-amber-600 dark:text-amber-400" />
                                      <span>Deactivate Account</span>
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle size={13} className="text-emerald-600 dark:text-emerald-400" />
                                      <span>Activate Account</span>
                                    </>
                                  )}
                                </button>

                                {/* Drawer Delete Button */}
                                <button
                                  type="button"
                                  disabled={deletingId === user.id || user.role?.name === 'SUPER_ADMIN'}
                                  onClick={(e) => handleDeleteClick(user, e)}
                                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/50 px-3 py-1.5 text-xs font-bold text-rose-800 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
                                  title={
                                    user.role?.name === 'SUPER_ADMIN'
                                      ? 'SUPER_ADMIN cannot be deleted'
                                      : 'Delete User Account'
                                  }
                                >
                                  <Trash2 size={13} className="text-rose-600 dark:text-rose-400" />
                                  <span>Delete User</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={(e) => openEditModal(user, e)}
                                  className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-4 py-1.5 text-xs font-black text-white hover:bg-[var(--color-brand-green-dark)] transition-all shadow-sm cursor-pointer whitespace-nowrap shrink-0"
                                >
                                  <Edit2 size={12} />
                                  <span>Edit User Master</span>
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 text-xs">
                              {/* Location */}
                              <div className="flex flex-col gap-1 rounded-xl border border-[var(--border-subtle)] bg-background p-3">
                                <span className="text-[10px] font-bold text-muted uppercase flex items-center gap-1">
                                  <MapPin size={11} className="text-[var(--color-brand-green)]" /> Location
                                </span>
                                <p className="font-bold text-foreground">
                                  {[user.villageCity, user.district, user.state].filter(Boolean).join(', ') || 'Not specified'}
                                </p>
                                {user.pincode && (
                                  <span className="text-[10px] text-muted">PIN: {user.pincode}</span>
                                )}
                              </div>

                              {/* Classification */}
                              <div className="flex flex-col gap-1 rounded-xl border border-[var(--border-subtle)] bg-background p-3">
                                <span className="text-[10px] font-bold text-muted uppercase flex items-center gap-1">
                                  <Building2 size={11} className="text-blue-500" /> Classification
                                </span>
                                <p className="font-bold text-foreground capitalize">
                                  {user.sellerType ? `${user.sellerType} account` : 'Individual Buyer / Farmer'}
                                </p>
                                <span className="text-[10px] text-muted">
                                  Active Listing Limit: {user.activeListingLimit ?? 3}
                                </span>
                              </div>

                              {/* Preferences */}
                              <div className="flex flex-col gap-1 rounded-xl border border-[var(--border-subtle)] bg-background p-3">
                                <span className="text-[10px] font-bold text-muted uppercase flex items-center gap-1">
                                  <Globe size={11} className="text-amber-500" /> Preferences
                                </span>
                                <p className="font-bold text-foreground">
                                  Language: {user.preferredLanguage || 'HI'}
                                </p>
                                <span className="text-[10px] text-muted">
                                  Brand: {user.preferredBrand || 'None specified'}
                                </span>
                              </div>

                              {/* Security / Verification */}
                              <div className="flex flex-col gap-1 rounded-xl border border-[var(--border-subtle)] bg-background p-3">
                                <span className="text-[10px] font-bold text-muted uppercase flex items-center gap-1">
                                  <ShieldCheck size={11} className="text-purple-500" /> Verification
                                </span>
                                <p className="font-bold text-foreground">
                                  KYC: {user.kycStatus || 'PENDING'}
                                </p>
                                <span className="text-[10px] text-muted">
                                  Mobile Verified: {user.isMobileVerified ? 'Yes' : 'No'} | Email Verified: {user.isEmailVerified ? 'Yes' : 'No'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={page}
          limit={limit}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={setPage}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </div>

      {/* CREATE USER MASTER MODAL */}
      {isCreateModalOpen && (
        <UserCreateModal
          onClose={() => setIsCreateModalOpen(false)}
          onSaved={() => {
            setIsCreateModalOpen(false);
            fetchUsers();
          }}
        />
      )}

      {/* EDIT USER MASTER MODAL */}
      {isEditModalOpen && selectedUser && (
        <UserEditModal
          user={selectedUser}
          onClose={() => setIsEditModalOpen(false)}
          onSaved={() => {
            setIsEditModalOpen(false);
            fetchUsers();
          }}
        />
      )}

      {/* CONFIRM TOGGLE ACTIVE / DEACTIVATE MODAL */}
      {userToToggle && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6 animate-fade-in">
          <div className="border border-[var(--border-subtle)] flex w-full max-w-md flex-col overflow-hidden rounded-3xl bg-background shadow-2xl">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
                    userToToggle.willDeactivate
                      ? 'bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400'
                      : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'
                  }`}
                >
                  {userToToggle.willDeactivate ? <XCircle size={26} /> : <CheckCircle size={26} />}
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-foreground text-base font-black">
                    {userToToggle.willDeactivate ? 'Deactivate User Account?' : 'Activate User Account?'}
                  </h3>
                  <p className="text-muted text-xs font-semibold leading-relaxed">
                    {userToToggle.willDeactivate ? (
                      <>
                        Are you sure you want to deactivate{' '}
                        <strong className="text-foreground">
                          {userToToggle.user.fullName || `User #${userToToggle.user.id}`}
                        </strong>
                        ? The user will be immediately logged out, active sessions will be terminated, and they will not be able to log in until reactivated.
                      </>
                    ) : (
                      <>
                        Are you sure you want to activate{' '}
                        <strong className="text-foreground">
                          {userToToggle.user.fullName || `User #${userToToggle.user.id}`}
                        </strong>
                        ? The user will be granted normal access and will be able to log in to the platform.
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* User preview card inside modal */}
              <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    {userToToggle.user.fullName || 'Unnamed'} (ID: #{userToToggle.user.id})
                  </span>
                  <span className="font-mono text-muted text-[11px]">
                    {userToToggle.user.mobile ? `+91 ${userToToggle.user.mobile}` : 'No phone'}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted font-medium">
                  <span>Role: {userToToggle.user.role?.name || 'USER'}</span>
                  <span>•</span>
                  <span>Status: {userToToggle.user.isActive ? 'Currently Active' : 'Currently Inactive'}</span>
                </div>
              </div>
            </div>

            <div className="border-t border-[var(--border-subtle)] bg-foreground/[0.02] flex items-center justify-end gap-2.5 px-6 py-4">
              <button
                type="button"
                disabled={Boolean(togglingId)}
                onClick={() => setUserToToggle(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-muted hover:bg-foreground/5 hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(togglingId)}
                onClick={() => executeToggleActive(userToToggle.user, userToToggle.willDeactivate)}
                className={`inline-flex items-center gap-2 rounded-xl px-5 py-2 text-xs font-black text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
                  userToToggle.willDeactivate
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                }`}
              >
                {togglingId ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Updating...</span>
                  </>
                ) : userToToggle.willDeactivate ? (
                  <>
                    <XCircle size={14} />
                    <span>Yes, Deactivate Account</span>
                  </>
                ) : (
                  <>
                    <CheckCircle size={14} />
                    <span>Yes, Activate Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-subtle)] bg-background shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 shadow-inner">
                  <Trash2 size={24} />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="text-foreground text-base font-black">
                    Delete User Account?
                  </h3>
                  <p className="text-muted text-xs font-semibold leading-relaxed">
                    Are you sure you want to permanently delete{' '}
                    <strong className="text-foreground">
                      {userToDelete.fullName || `User #${userToDelete.id}`}
                    </strong>
                    ? This will mark the user record as soft-deleted and permanently invalidate all active sessions.
                  </p>
                </div>
              </div>

              {/* User preview card inside modal */}
              <div className="mt-4 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">
                    {userToDelete.fullName || 'Unnamed User'} (ID: #{userToDelete.id})
                  </span>
                  <span className="font-mono text-muted text-[11px]">
                    {userToDelete.mobile ? `+91 ${userToDelete.mobile}` : 'No phone'}
                  </span>
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted font-medium">
                  <span>Role: {userToDelete.role?.name || 'CUSTOMER'}</span>
                  <span>•</span>
                  <span>Status: {userToDelete.isActive ? 'Active' : 'Inactive'}</span>
                  {userToDelete.email && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">{userToDelete.email}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Error or Permission Advisory */}
              {deleteModalError && (
                <div className="mt-4 flex flex-col gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                    <p className="font-semibold leading-relaxed">{deleteModalError}</p>
                  </div>
                  {deleteModalError.includes('SUPER_ADMIN') && (
                    <div className="mt-1 pt-2 border-t border-rose-500/20 flex flex-col gap-2">
                      <p className="text-[11px] text-muted">
                        You can immediately deactivate this account instead. Deactivation revokes login access and terminates all sessions instantly:
                      </p>
                      <button
                        type="button"
                        onClick={async () => {
                          const target = userToDelete;
                          setUserToDelete(null);
                          setDeleteModalError(null);
                          await executeToggleActive(target, true);
                        }}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 text-xs font-black shadow-md transition-all cursor-pointer"
                      >
                        <XCircle size={14} />
                        <span>Deactivate Account Instead</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="border-t border-[var(--border-subtle)] bg-foreground/[0.02] flex items-center justify-end gap-2.5 px-6 py-4">
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => {
                  setUserToDelete(null);
                  setDeleteModalError(null);
                }}
                className="rounded-xl px-4 py-2 text-xs font-bold text-muted hover:bg-foreground/5 hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={Boolean(deletingId)}
                onClick={() => executeDelete(userToDelete)}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-5 py-2 text-xs font-black text-white shadow-md shadow-rose-600/20 transition-all hover:bg-rose-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
              >
                {deletingId ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    <span>Deleting User...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    <span>Yes, Delete User</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
