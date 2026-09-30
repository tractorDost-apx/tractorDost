'use client';

import React, { useState, useEffect } from 'react';
import { accessControlAPI, Role } from '@/lib/api/accessControl';
import { Plus, Edit, Trash2, Shield } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function RolesTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await accessControlAPI.getAllRoles();
      setRoles(res.data?.roles || []);
    } catch (err: any) {
      setError('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (role?: Role) => {
    if (role) {
      setEditingRole(role);
      setName(role.name);
      setDescription(role.description || '');
    } else {
      setEditingRole(null);
      setName('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingRole) {
        await accessControlAPI.updateRole(editingRole.id, { name, description });
      } else {
        await accessControlAPI.createRole({ name, description });
      }
      setIsModalOpen(false);
      fetchRoles();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Error saving role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    try {
      await accessControlAPI.deleteRole(id);
      fetchRoles();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting role');
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <TractorLoader className="text-[var(--color-brand-green)]" size={48} />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <Shield className="text-[var(--color-brand-green)]" size={24} /> System Roles
        </h2>
        <button
          onClick={() => openModal()}
          className="spatial-button flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold"
        >
          <Plus size={16} /> Add Role
        </button>
      </div>

      {error && <div className="rounded-xl bg-red-500/10 p-4 font-bold text-red-500">{error}</div>}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role) => (
          <div
            key={role.id}
            className="bg-foreground/5 flex flex-col rounded-2xl border border-[var(--border-subtle)] p-5 transition-all hover:border-[var(--color-brand-green)]/30"
          >
            <div className="mb-2 flex items-start justify-between">
              <h3 className="text-lg font-black tracking-wider uppercase">{role.name}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => openModal(role)}
                  className="text-muted bg-foreground/5 rounded-lg p-1.5 hover:text-blue-400"
                >
                  <Edit size={14} />
                </button>
                <button
                  onClick={() => handleDelete(role.id)}
                  className="text-muted bg-foreground/5 rounded-lg p-1.5 hover:text-red-400"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            <p className="text-muted flex-1 text-sm font-medium">
              {role.description || 'No description provided.'}
            </p>
            <div className="text-muted mt-4 text-xs font-bold opacity-60">ID: {role.id}</div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-panel animate-fade-in relative w-full max-w-md rounded-2xl p-6">
            <h2 className="mb-6 text-2xl font-black">
              {editingRole ? 'Edit Role' : 'Create New Role'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-muted mb-1 block text-sm font-bold">Role Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value.toUpperCase())}
                  required
                  className="bg-foreground/5 text-foreground h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 font-bold outline-none focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)]/20"
                  placeholder="e.g. MANAGER"
                />
              </div>
              <div>
                <label className="text-muted mb-1 block text-sm font-bold">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-foreground/5 text-foreground h-24 w-full resize-none rounded-xl border border-[var(--border-subtle)] p-4 font-medium outline-none focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)]/20"
                  placeholder="Describe the purpose of this role..."
                />
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="hover:bg-foreground/10 rounded-xl px-4 py-2 text-sm font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="spatial-button flex items-center justify-center rounded-xl px-6 py-2 text-sm font-bold"
                >
                  {submitting ? <TractorLoader size={20} /> : 'Save Role'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
