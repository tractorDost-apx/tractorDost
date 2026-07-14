'use client';

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Edit2, Trash2, CheckCircle, XCircle, ShieldCheck, AlertCircle, ChevronDown, ChevronUp, Users, Activity, Mail, Phone, Clock } from 'lucide-react';
import { usersAPI } from '@/lib/api/users';
import { User } from '@/types/models/user';
import { UserEditModal } from './components/UserEditModal';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
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
        setUsers(users.map(u => u.id === id ? { ...u, isActive: res.data.isActive } : u));
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to toggle active status');
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
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
    <div className="w-full h-full flex flex-col gap-6 animate-fade-in pb-12">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">User Management</h1>
          <p className="text-sm font-bold text-muted mt-1">Deep analysis & master view of platform users and roles.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm font-bold">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Stats and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl">
        <div className="flex items-center gap-4 text-sm font-bold w-full md:w-auto">
          <div className="flex items-center gap-2 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] px-4 py-2 rounded-xl">
            <Users size={18} />
            Total Users: {totalCount}
          </div>
        </div>

        <div className="relative w-full md:w-80 group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted group-focus-within:text-[var(--color-brand-green)] transition-colors">
            <Search size={16} />
          </div>
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-foreground/5 border border-transparent rounded-full py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-foreground/5 text-muted uppercase text-[11px] font-black tracking-wider">
              <tr>
                <th className="px-6 py-4 w-10"></th>
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
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    Loading deep user insights...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted font-bold">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <React.Fragment key={user.id}>
                    <tr 
                      className={`hover:bg-foreground/5 transition-colors cursor-pointer ${expandedId === user.id ? 'bg-foreground/5' : ''}`}
                      onClick={() => toggleExpand(user.id)}
                    >
                      <td className="px-6 py-4 text-muted">
                        {expandedId === user.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center p-1.5 border border-[var(--border-subtle)] shrink-0 shadow-sm text-lg font-black text-[var(--color-brand-green)] uppercase">
                            {user.fullName ? user.fullName.charAt(0) : 'U'}
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <div className="font-black text-foreground text-base tracking-tight">{user.fullName || 'N/A'}</div>
                            <div className="text-[10px] font-bold text-muted/70 uppercase tracking-wider">ID: #{user.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex flex-col gap-1 text-xs">
                          <span className="font-bold text-foreground/80 flex items-center gap-1.5">
                            <Mail size={12} className="text-muted"/> {user.email || 'No email'}
                          </span>
                          <span className="text-muted font-medium flex items-center gap-1.5">
                            <Phone size={12} /> {user.mobile || 'No mobile'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black tracking-wide bg-blue-500/10 text-blue-500 transition-colors">
                          {user.role?.name || 'UNKNOWN'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2 items-center">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${user.isActive ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]' : 'bg-red-500/10 text-red-500'}`}>
                            {user.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) => handleToggleActive(user.id, e)}
                            className={`p-2 rounded-xl transition-colors ${
                              user.isActive 
                                ? 'text-[var(--color-brand-orange)] hover:bg-[var(--color-brand-orange)]/10' 
                                : 'text-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/10'
                            }`}
                            title={user.isActive ? "Deactivate User" : "Activate User"}
                          >
                            {user.isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                          </button>
                          <button 
                            onClick={(e) => openEditModal(user, e)}
                            className="p-2 rounded-xl text-foreground/70 hover:text-blue-500 hover:bg-blue-500/10 transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={(e) => handleDelete(user.id, e)}
                            className="p-2 rounded-xl text-foreground/70 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* EXPANDED DEEP ANALYSIS VIEW */}
                    {expandedId === user.id && (
                      <tr>
                        <td colSpan={6} className="px-0 py-0 bg-foreground/[0.02]">
                          <div className="p-6 md:p-8 flex flex-col gap-6 animate-fade-in border-b-2 border-[var(--color-brand-green)]">
                            <div className="flex justify-end pt-2">
                               <button 
                                  onClick={(e) => openEditModal(user, e)}
                                  className="px-6 py-2.5 bg-[var(--color-brand-green)] text-white font-black text-sm uppercase tracking-wider rounded-xl hover:bg-[var(--color-brand-orange)] transition-colors shadow-lg shadow-[var(--color-brand-green)]/20 flex items-center gap-2"
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
        {!loading && totalPages > 1 && (
          <div className="mt-auto p-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Previous
            </button>
            <span className="text-sm font-bold text-muted">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-4 py-2 text-sm font-bold rounded-xl bg-foreground/5 hover:bg-foreground/10 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              Next
            </button>
          </div>
        )}
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
