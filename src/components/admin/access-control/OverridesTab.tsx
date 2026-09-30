'use client';

import React, { useState, useEffect } from 'react';
import { accessControlAPI, Module, UserPermissionOverride } from '@/lib/api/accessControl';
import { apiClient } from '@/lib/api/axios/axios';
import { UserPlus, Trash2, Plus, Check, X, ShieldAlert } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function OverridesTab() {
  const [users, setUsers] = useState<any[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [overrides, setOverrides] = useState<UserPermissionOverride[]>([]);
  const [fetchingOverrides, setFetchingOverrides] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    moduleId: '',
    isGrant: true,
    reason: '',
    canCreate: false,
    canRead: true,
    canUpdate: false,
    canDelete: false,
    canApprove: false,
    canExport: false,
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [usersRes, modulesRes] = await Promise.all([
        apiClient.get('/users/getAllUsers'),
        accessControlAPI.listModules({ limit: 1000 }),
      ]);
      setUsers(usersRes.data?.data?.users || []);
      setModules(modulesRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedUserId) {
      fetchOverrides(selectedUserId);
    } else {
      setOverrides([]);
    }
  }, [selectedUserId]);

  const fetchOverrides = async (userId: number) => {
    setFetchingOverrides(true);
    try {
      const res = await accessControlAPI.getUserOverrides(userId);
      setOverrides(res.data || []);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch user overrides');
    } finally {
      setFetchingOverrides(false);
    }
  };

  const handleRevoke = async (overrideId: number) => {
    if (!confirm('Are you sure you want to revoke this override?')) return;
    try {
      await accessControlAPI.revokeOverride(overrideId);
      if (selectedUserId) fetchOverrides(selectedUserId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error revoking override');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    if (!formData.moduleId) return alert('Select a module');

    setSubmitting(true);
    try {
      await accessControlAPI.createOverride(selectedUserId, {
        moduleId: Number(formData.moduleId),
        isGrant: formData.isGrant,
        reason: formData.reason,
        canCreate: formData.canCreate,
        canRead: formData.canRead,
        canUpdate: formData.canUpdate,
        canDelete: formData.canDelete,
        canApprove: formData.canApprove,
        canExport: formData.canExport,
      });
      setIsModalOpen(false);
      fetchOverrides(selectedUserId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving override');
    } finally {
      setSubmitting(false);
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
      <div className="bg-foreground/5 flex items-center justify-between rounded-2xl border border-[var(--border-subtle)] p-4">
        <div className="flex items-center gap-4">
          <ShieldAlert className="text-[var(--color-brand-green)]" size={24} />
          <div>
            <h2 className="text-xl font-bold">User Permission Overrides</h2>
            <p className="text-muted text-sm">
              Grant or deny specific module access to individual users
            </p>
          </div>
        </div>

        <select
          className="bg-background h-12 min-w-[250px] rounded-xl border border-[var(--border-subtle)] px-4 font-bold outline-none focus:border-[var(--color-brand-green)]"
          value={selectedUserId || ''}
          onChange={(e) => setSelectedUserId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">-- Select a User --</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>
              {u.fullName || u.email} (ID: {u.id})
            </option>
          ))}
        </select>
      </div>

      {!selectedUserId ? (
        <div className="text-muted rounded-2xl border-2 border-dashed border-[var(--border-subtle)] p-12 text-center font-bold">
          Please select a user to view and manage their permission overrides.
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Current Overrides</h3>
            <button
              onClick={() => {
                setFormData({
                  moduleId: '',
                  isGrant: true,
                  reason: '',
                  canCreate: false,
                  canRead: true,
                  canUpdate: false,
                  canDelete: false,
                  canApprove: false,
                  canExport: false,
                });
                setIsModalOpen(true);
              }}
              className="spatial-button flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold"
            >
              <Plus size={16} /> Add Override
            </button>
          </div>

          {fetchingOverrides ? (
            <div className="flex justify-center p-8">
              <TractorLoader className="text-muted" size={32} />
            </div>
          ) : overrides.length === 0 ? (
            <div className="text-muted bg-foreground/5 rounded-2xl border border-[var(--border-subtle)] p-8 text-center font-medium">
              No overrides found for this user.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {overrides.map((override) => {
                const mod = modules.find((m) => m.id === override.moduleId);
                return (
                  <div
                    key={override.id}
                    className={`rounded-2xl border p-5 ${override.isGrant ? 'border-lime-500/20 bg-lime-500/5' : 'border-red-500/20 bg-red-500/5'}`}
                  >
                    <div className="mb-3 flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-black">{mod?.name || 'Unknown Module'}</h4>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-black uppercase ${override.isGrant ? 'bg-lime-500/20 text-lime-600' : 'bg-red-500/20 text-red-600'}`}
                        >
                          {override.isGrant ? 'Granted' : 'Denied'}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRevoke(override.id!)}
                        className="bg-foreground/5 text-muted rounded-lg p-1.5 transition-colors hover:bg-red-500/10 hover:text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    {override.reason && (
                      <p className="text-muted mb-3 text-sm font-medium italic">
                        "{override.reason}"
                      </p>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs font-bold">
                      <div className="flex items-center gap-1">
                        {override.canCreate ? (
                          <Check size={14} className="text-lime-500" />
                        ) : (
                          <X size={14} className="text-muted" />
                        )}{' '}
                        Create
                      </div>
                      <div className="flex items-center gap-1">
                        {override.canRead ? (
                          <Check size={14} className="text-lime-500" />
                        ) : (
                          <X size={14} className="text-muted" />
                        )}{' '}
                        Read
                      </div>
                      <div className="flex items-center gap-1">
                        {override.canUpdate ? (
                          <Check size={14} className="text-lime-500" />
                        ) : (
                          <X size={14} className="text-muted" />
                        )}{' '}
                        Update
                      </div>
                      <div className="flex items-center gap-1">
                        {override.canDelete ? (
                          <Check size={14} className="text-lime-500" />
                        ) : (
                          <X size={14} className="text-muted" />
                        )}{' '}
                        Delete
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-panel animate-fade-in relative w-full max-w-md rounded-2xl p-6">
            <h2 className="mb-6 text-2xl font-black">Add Permission Override</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="text-muted mb-1 block text-sm font-bold">Module</label>
                <select
                  required
                  value={formData.moduleId}
                  onChange={(e) => setFormData({ ...formData, moduleId: e.target.value })}
                  className="bg-foreground/5 h-12 w-full appearance-none rounded-xl border border-[var(--border-subtle)] px-4 font-bold outline-none focus:border-[var(--color-brand-green)]"
                >
                  <option value="">-- Select Module --</option>
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-muted mb-1 block text-sm font-bold">Override Type</label>
                <div className="flex gap-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="isGrant"
                      checked={formData.isGrant}
                      onChange={() => setFormData({ ...formData, isGrant: true })}
                      className="accent-[var(--color-brand-green)]"
                    />
                    <span className="text-sm font-bold">Grant Access</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="isGrant"
                      checked={!formData.isGrant}
                      onChange={() => setFormData({ ...formData, isGrant: false })}
                      className="accent-red-500"
                    />
                    <span className="text-sm font-bold">Deny Access</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-muted mb-2 block text-sm font-bold">
                  Specific Permissions
                </label>
                <div className="grid grid-cols-2 gap-y-2">
                  {(
                    [
                      'canCreate',
                      'canRead',
                      'canUpdate',
                      'canDelete',
                      'canApprove',
                      'canExport',
                    ] as const
                  ).map((action) => (
                    <label key={action} className="flex cursor-pointer items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData[action]}
                        onChange={(e) => setFormData({ ...formData, [action]: e.target.checked })}
                        className="rounded accent-[var(--color-brand-green)]"
                      />
                      <span className="text-muted text-sm font-bold capitalize">
                        {action.replace('can', '')}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-muted mb-1 block text-sm font-bold">Reason (Optional)</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  className="bg-foreground/5 h-10 w-full rounded-xl border border-[var(--border-subtle)] px-4 text-sm font-medium outline-none focus:border-[var(--color-brand-green)]"
                  placeholder="e.g. Temporary access for audit"
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
                  {submitting ? <TractorLoader size={20} /> : 'Save Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
