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
} from 'lucide-react';
import { usersAPI } from '@/lib/api/users';
import { User } from '@/types/models/user';
import { UserEditModal } from './components/UserEditModal';
import Pagination from '@/components/shared/Pagination';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await usersAPI.getAllUsers({
        page,
        limit,
        search: search || undefined,
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
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search, page]);

  const handleToggleActive = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await usersAPI.toggleUserActive(id);
      if (res.success) {
        setUsers(users.map((u) => (u.id === id ? { ...u, isActive: res.data.isActive } : u)));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to toggle active status');
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.'))
      return;
    try {
      const res = await usersAPI.deleteUserById(id);
      if (res.success) {
        fetchUsers();
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete user');
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

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-12">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight">User Management</h1>
          <p className="text-muted mt-1 text-sm font-bold">
            Deep analysis & master view of platform users and roles.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm font-bold text-red-500">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Stats and Search */}
      <div className="glass-panel flex flex-col items-center justify-between gap-4 rounded-2xl p-4 md:flex-row">
        <div className="flex w-full items-center gap-4 text-sm font-bold md:w-auto">
          <div className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)]/10 px-4 py-2 text-[var(--color-brand-green)]">
            <Users size={18} />
            Total Users: {totalCount}
          </div>
        </div>

        <div className="group relative w-full md:w-80">
          <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 transition-colors group-focus-within:text-[var(--color-brand-green)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-full border border-transparent py-2.5 pr-4 pl-10 text-sm font-medium transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-foreground/5 text-muted text-[11px] font-black tracking-wider uppercase">
              <tr>
                <th className="w-10 px-6 py-4"></th>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    Loading deep user insights...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-muted px-6 py-12 text-center font-bold">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr
                      className={`hover:bg-foreground/5 cursor-pointer transition-colors ${expandedId === user.id ? 'bg-foreground/5' : ''}`}
                      onClick={() => toggleExpand(user.id)}
                    >
                      <td className="text-muted px-6 py-4">
                        {expandedId === user.id ? (
                          <ChevronUp size={18} />
                        ) : (
                          <ChevronDown size={18} />
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white p-1.5 text-lg font-black text-[var(--color-brand-green)] uppercase shadow-sm">
                            {user.fullName ? user.fullName.charAt(0) : 'U'}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="text-foreground text-base font-black tracking-tight">
                              {user.fullName || 'N/A'}
                            </div>
                            <div className="text-muted/70 text-[10px] font-bold tracking-wider uppercase">
                              ID: #{user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1 text-xs">
                          <span className="text-foreground/80 flex items-center gap-1.5 font-bold">
                            <Mail size={12} className="text-muted" /> {user.email || 'No email'}
                          </span>
                          <span className="text-muted flex items-center gap-1.5 font-medium">
                            <Phone size={12} /> {user.mobile || 'No mobile'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-black tracking-wide text-blue-500 transition-colors">
                          {user.role?.name || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${user.isActive ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-red-500/10 text-red-500'}`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleToggleActive(user.id, e)}
                            className={`rounded-xl p-2 transition-colors ${
                              user.isActive
                                ? 'text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10'
                                : 'text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/10'
                            }`}
                            title={user.isActive ? 'Deactivate User' : 'Activate User'}
                          >
                            {user.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button
                            onClick={(e) => openEditModal(user, e)}
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-blue-500/10 hover:text-blue-500"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={(e) => handleDelete(user.id, e)}
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* EXPANDED DEEP ANALYSIS VIEW */}
                    {expandedId === user.id && (
                      <tr>
                        <td colSpan={6} className="bg-foreground/[0.02] px-0 py-0">
                          <div className="animate-fade-in flex flex-col gap-6 border-b-2 border-[var(--color-brand-green)] p-6 md:p-8">
                            <div className="flex justify-end pt-2">
                              <button
                                onClick={(e) => openEditModal(user, e)}
                                className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-sm font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-colors hover:bg-[var(--color-brand-orange)]"
                              >
                                <Activity size={16} /> View Full Stats & Edit
                              </button>
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
    </div>
  );
}
