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

  if (loading) return <div className="flex justify-center p-12"><TractorLoader className="text-[var(--color-brand-green)]" size={48} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield className="text-[var(--color-brand-green)]" size={24} /> System Roles
        </h2>
        <button
          onClick={() => openModal()}
          className="spatial-button px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Plus size={16} /> Add Role
        </button>
      </div>

      {error && <div className="p-4 bg-red-500/10 text-red-500 rounded-xl font-bold">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {roles.map(role => (
          <div key={role.id} className="bg-foreground/5 border border-[var(--border-subtle)] p-5 rounded-2xl flex flex-col hover:border-[var(--color-brand-green)]/30 transition-all">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-black uppercase tracking-wider">{role.name}</h3>
              <div className="flex gap-2">
                <button onClick={() => openModal(role)} className="p-1.5 text-muted hover:text-blue-400 bg-foreground/5 rounded-lg"><Edit size={14} /></button>
                <button onClick={() => handleDelete(role.id)} className="p-1.5 text-muted hover:text-red-400 bg-foreground/5 rounded-lg"><Trash2 size={14} /></button>
              </div>
            </div>
            <p className="text-sm text-muted font-medium flex-1">{role.description || 'No description provided.'}</p>
            <div className="mt-4 text-xs font-bold text-muted opacity-60">ID: {role.id}</div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-2xl animate-fade-in relative">
            <h2 className="text-2xl font-black mb-6">{editingRole ? 'Edit Role' : 'Create New Role'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-bold text-muted mb-1">Role Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value.toUpperCase())}
                  required
                  className="w-full h-12 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 font-bold text-foreground focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)]/20 outline-none"
                  placeholder="e.g. MANAGER"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-muted mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full h-24 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl p-4 font-medium text-foreground focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)]/20 outline-none resize-none"
                  placeholder="Describe the purpose of this role..."
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold hover:bg-foreground/10 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="spatial-button px-6 py-2 rounded-xl text-sm font-bold flex items-center justify-center">
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
