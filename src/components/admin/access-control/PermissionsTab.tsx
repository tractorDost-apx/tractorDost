'use client';

import React, { useState, useEffect } from 'react';
import { accessControlAPI, Role, Module, RolePermission } from '@/lib/api/accessControl';
import { Loader2, Key, Save, CheckSquare, Square } from 'lucide-react';

export default function PermissionsTab() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [permissions, setPermissions] = useState<Record<number, Partial<RolePermission>>>({});
  const [fetchingPermissions, setFetchingPermissions] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [rolesRes, modulesRes] = await Promise.all([
        accessControlAPI.getAllRoles(),
        accessControlAPI.listModules({ limit: 1000 })
      ]);
      setRoles(rolesRes.data?.roles || []);
      setModules(modulesRes.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedRoleId) {
      fetchRolePermissions(selectedRoleId);
    } else {
      setPermissions({});
    }
  }, [selectedRoleId]);

  const fetchRolePermissions = async (roleId: number) => {
    setFetchingPermissions(true);
    try {
      const res = await accessControlAPI.getRolePermissions(roleId);
      const permsArray: RolePermission[] = res.data || [];
      const permMap: Record<number, Partial<RolePermission>> = {};

      permsArray.forEach(p => {
        permMap[p.moduleId] = { ...p };
      });
      setPermissions(permMap);
    } catch (err) {
      console.error(err);
      alert('Failed to fetch role permissions');
    } finally {
      setFetchingPermissions(false);
    }
  };

  const handleToggle = (moduleId: number, field: keyof RolePermission) => {
    setPermissions(prev => {
      const current = prev[moduleId] || {
        moduleId,
        roleId: selectedRoleId!,
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        canExport: false
      };

      return {
        ...prev,
        [moduleId]: {
          ...current,
          [field]: !current[field]
        }
      };
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const permsToSave = Object.values(permissions).map(p => ({
        moduleId: p.moduleId,
        canCreate: p.canCreate || false,
        canRead: p.canRead || false,
        canUpdate: p.canUpdate || false,
        canDelete: p.canDelete || false,
        canApprove: p.canApprove || false,
        canExport: p.canExport || false,
      }));

      await accessControlAPI.assignRolePermissions(selectedRoleId, permsToSave as any);
      alert('Permissions saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving permissions');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[var(--color-brand-green)]" size={32} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-foreground/5 p-4 rounded-2xl border border-[var(--border-subtle)]">
        <div className="flex items-center gap-4">
          <Key className="text-[var(--color-brand-green)]" size={24} />
          <div>
            <h2 className="text-xl font-bold">Permissions Matrix</h2>
            <p className="text-sm text-muted">Select a role to view and edit its permissions</p>
          </div>
        </div>

        <select
          className="h-12 bg-background border border-[var(--border-subtle)] rounded-xl px-4 font-bold outline-none focus:border-[var(--color-brand-green)] min-w-[200px]"
          value={selectedRoleId || ''}
          onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">-- Select a Role --</option>
          {roles.map(r => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
      </div>

      {!selectedRoleId ? (
        <div className="p-12 text-center border-2 border-dashed border-[var(--border-subtle)] rounded-2xl text-muted font-bold">
          Please select a role from the dropdown above to manage its permissions.
        </div>
      ) : fetchingPermissions ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-muted" size={24} /></div>
      ) : (
        <div className="bg-foreground/5 border border-[var(--border-subtle)] rounded-2xl overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-foreground/10 border-b border-[var(--border-subtle)]">
                  <th className="p-4 font-black uppercase text-xs tracking-wider">Module</th>
                  <th className="p-4 font-black uppercase text-xs tracking-wider text-center">Create</th>
                  <th className="p-4 font-black uppercase text-xs tracking-wider text-center">Read</th>
                  <th className="p-4 font-black uppercase text-xs tracking-wider text-center">Update</th>
                  <th className="p-4 font-black uppercase text-xs tracking-wider text-center">Delete</th>
                  <th className="p-4 font-black uppercase text-xs tracking-wider text-center">Approve</th>
                  <th className="p-4 font-black uppercase text-xs tracking-wider text-center">Export</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod, idx) => {
                  const perm = permissions[mod.id] || {};
                  return (
                    <tr key={mod.id} className={`border-b border-[var(--border-subtle)] hover:bg-foreground/5 transition-colors ${idx % 2 === 0 ? 'bg-background/20' : ''}`}>
                      <td className="p-4">
                        <div className="font-bold">{mod.name}</div>
                        <div className="text-xs text-muted font-mono">{mod.code}</div>
                      </td>
                      {(['canCreate', 'canRead', 'canUpdate', 'canDelete', 'canApprove', 'canExport'] as const).map(action => (
                        <td key={action} className="p-4 text-center">
                          <button
                            onClick={() => handleToggle(mod.id, action)}
                            className={`p-1.5 rounded transition-all ${perm[action] ? 'text-[var(--color-brand-green)]' : 'text-muted hover:bg-foreground/10'}`}
                          >
                            {perm[action] ? <CheckSquare size={20} /> : <Square size={20} />}
                          </button>
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-[var(--border-subtle)] flex justify-end bg-background/50">
            <button
              onClick={handleSave}
              disabled={saving}
              className="spatial-button px-6 py-2.5 rounded-xl font-bold flex items-center gap-2"
            >
              {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              Save Permissions Matrix
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
