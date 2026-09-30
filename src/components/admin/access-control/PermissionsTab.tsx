'use client';

import React, { useState, useEffect } from 'react';
import { accessControlAPI, Role, Module, RolePermission } from '@/lib/api/accessControl';
import { Key, Save, CheckSquare, Square } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

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
        accessControlAPI.listModules({ limit: 1000 }),
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

      permsArray.forEach((p) => {
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
    setPermissions((prev) => {
      const current = prev[moduleId] || {
        moduleId,
        roleId: selectedRoleId!,
        canCreate: false,
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canApprove: false,
        canExport: false,
      };

      return {
        ...prev,
        [moduleId]: {
          ...current,
          [field]: !current[field],
        },
      };
    });
  };

  const handleSave = async () => {
    if (!selectedRoleId) return;
    setSaving(true);
    try {
      const permsToSave = Object.values(permissions).map((p) => ({
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
          <Key className="text-[var(--color-brand-green)]" size={24} />
          <div>
            <h2 className="text-xl font-bold">Permissions Matrix</h2>
            <p className="text-muted text-sm">Select a role to view and edit its permissions</p>
          </div>
        </div>

        <select
          className="bg-background h-12 min-w-[200px] rounded-xl border border-[var(--border-subtle)] px-4 font-bold outline-none focus:border-[var(--color-brand-green)]"
          value={selectedRoleId || ''}
          onChange={(e) => setSelectedRoleId(e.target.value ? Number(e.target.value) : null)}
        >
          <option value="">-- Select a Role --</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedRoleId ? (
        <div className="text-muted rounded-2xl border-2 border-dashed border-[var(--border-subtle)] p-12 text-center font-bold">
          Please select a role from the dropdown above to manage its permissions.
        </div>
      ) : fetchingPermissions ? (
        <div className="flex justify-center p-12">
          <TractorLoader className="text-muted" size={32} />
        </div>
      ) : (
        <div className="bg-foreground/5 flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-foreground/10 border-b border-[var(--border-subtle)]">
                  <th className="p-4 text-xs font-black tracking-wider uppercase">Module</th>
                  <th className="p-4 text-center text-xs font-black tracking-wider uppercase">
                    Create
                  </th>
                  <th className="p-4 text-center text-xs font-black tracking-wider uppercase">
                    Read
                  </th>
                  <th className="p-4 text-center text-xs font-black tracking-wider uppercase">
                    Update
                  </th>
                  <th className="p-4 text-center text-xs font-black tracking-wider uppercase">
                    Delete
                  </th>
                  <th className="p-4 text-center text-xs font-black tracking-wider uppercase">
                    Approve
                  </th>
                  <th className="p-4 text-center text-xs font-black tracking-wider uppercase">
                    Export
                  </th>
                </tr>
              </thead>
              <tbody>
                {modules.map((mod, idx) => {
                  const perm = permissions[mod.id] || {};
                  return (
                    <tr
                      key={mod.id}
                      className={`hover:bg-foreground/5 border-b border-[var(--border-subtle)] transition-colors ${idx % 2 === 0 ? 'bg-background/20' : ''}`}
                    >
                      <td className="p-4">
                        <div className="font-bold">{mod.name}</div>
                        <div className="text-muted font-mono text-xs">{mod.code}</div>
                      </td>
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
                        <td key={action} className="p-4 text-center">
                          <button
                            onClick={() => handleToggle(mod.id, action)}
                            className={`rounded p-1.5 transition-all ${perm[action] ? 'text-[var(--color-brand-green)]' : 'text-muted hover:bg-foreground/10'}`}
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

          <div className="bg-background/50 flex justify-end border-t border-[var(--border-subtle)] p-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="spatial-button flex items-center gap-2 rounded-xl px-6 py-2.5 font-bold"
            >
              {saving ? <TractorLoader size={20} /> : <Save size={18} />}
              Save Permissions Matrix
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
