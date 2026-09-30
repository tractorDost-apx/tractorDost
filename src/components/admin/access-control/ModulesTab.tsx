'use client';

import React, { useState, useEffect } from 'react';
import { accessControlAPI, ModuleTreeNode, Module } from '@/lib/api/accessControl';
import { Plus, Edit, Trash2, LayoutGrid, ChevronRight, ChevronDown } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

const ModuleRow = ({
  node,
  level = 0,
  onEdit,
  onDelete,
}: {
  node: ModuleTreeNode;
  level?: number;
  onEdit: (m: Module) => void;
  onDelete: (id: number) => void;
}) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <div className="hover:bg-foreground/5 flex items-center justify-between border-b border-[var(--border-subtle)] p-3 transition-colors">
        <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
          {hasChildren ? (
            <button
              onClick={() => setExpanded(!expanded)}
              className="hover:bg-foreground/10 rounded p-1"
            >
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-6" /> // spacer
          )}
          <span className="font-bold">{node.name}</span>
          <span className="bg-foreground/10 text-muted rounded px-2 py-0.5 font-mono text-xs">
            {node.code}
          </span>
          {!node.isActive && (
            <span className="rounded bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 uppercase">
              Inactive
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted text-xs">Order: {node.sortOrder}</span>
          <button
            onClick={() => onEdit(node)}
            className="text-muted bg-foreground/5 ml-4 rounded-lg p-1.5 hover:text-blue-400"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={() => onDelete(node.id)}
            className="text-muted bg-foreground/5 rounded-lg p-1.5 hover:text-red-400"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {expanded &&
        hasChildren &&
        node.children.map((child) => (
          <ModuleRow
            key={child.id}
            node={child}
            level={level + 1}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
    </>
  );
};

export default function ModulesTab() {
  const [tree, setTree] = useState<ModuleTreeNode[]>([]);
  const [flatModules, setFlatModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parentId: '',
    sortOrder: '0',
    isActive: true,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [treeRes, listRes] = await Promise.all([
        accessControlAPI.getModuleTree(),
        accessControlAPI.listModules({ limit: 1000 }),
      ]);
      setTree(treeRes.data || []);
      setFlatModules(listRes.data?.data || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (module?: Module) => {
    if (module) {
      setEditingModule(module);
      setFormData({
        name: module.name,
        code: module.code,
        description: module.description || '',
        parentId: module.parentId ? module.parentId.toString() : '',
        sortOrder: module.sortOrder.toString(),
        isActive: module.isActive,
      });
    } else {
      setEditingModule(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        parentId: '',
        sortOrder: '0',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        sortOrder: parseInt(formData.sortOrder),
      };

      if (editingModule) {
        await accessControlAPI.updateModule(editingModule.id, payload);
      } else {
        await accessControlAPI.createModule(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving module');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this module? It cannot have children.')) return;
    try {
      await accessControlAPI.deleteModule(id);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting module');
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
          <LayoutGrid className="text-[var(--color-brand-green)]" size={24} /> System Modules
        </h2>
        <button
          onClick={() => openModal()}
          className="spatial-button flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold"
        >
          <Plus size={16} /> Add Module
        </button>
      </div>

      <div className="bg-foreground/5 overflow-hidden rounded-2xl border border-[var(--border-subtle)]">
        <div className="bg-foreground/5 flex items-center justify-between border-b border-[var(--border-subtle)] p-4">
          <span className="text-muted text-sm font-bold tracking-wider uppercase">
            Module Structure
          </span>
          <span className="text-muted text-sm font-bold tracking-wider uppercase">Actions</span>
        </div>
        <div className="flex flex-col">
          {tree.length === 0 ? (
            <div className="text-muted p-8 text-center font-bold">No modules found</div>
          ) : (
            tree.map((node) => (
              <ModuleRow key={node.id} node={node} onEdit={openModal} onDelete={handleDelete} />
            ))
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="glass-panel animate-fade-in relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl p-6">
            <h2 className="mb-6 text-2xl font-black">
              {editingModule ? 'Edit Module' : 'Create New Module'}
            </h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted mb-1 block text-sm font-bold">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="bg-foreground/5 h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 font-bold outline-none focus:border-[var(--color-brand-green)]"
                  />
                </div>
                <div>
                  <label className="text-muted mb-1 block text-sm font-bold">Code</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    className="bg-foreground/5 h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 font-bold outline-none focus:border-[var(--color-brand-green)]"
                    placeholder="e.g. USER_MANAGEMENT"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted mb-1 block text-sm font-bold">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-foreground/5 h-20 w-full resize-none rounded-xl border border-[var(--border-subtle)] p-4 font-medium outline-none focus:border-[var(--color-brand-green)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-muted mb-1 block text-sm font-bold">Parent Module</label>
                  <select
                    value={formData.parentId}
                    onChange={(e) => setFormData({ ...formData, parentId: e.target.value })}
                    className="bg-foreground/5 h-12 w-full appearance-none rounded-xl border border-[var(--border-subtle)] px-4 font-bold outline-none focus:border-[var(--color-brand-green)]"
                  >
                    <option value="">-- None (Root) --</option>
                    {flatModules
                      .filter((m) => m.id !== editingModule?.id)
                      .map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                  </select>
                </div>
                <div>
                  <label className="text-muted mb-1 block text-sm font-bold">Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })}
                    required
                    className="bg-foreground/5 h-12 w-full rounded-xl border border-[var(--border-subtle)] px-4 font-bold outline-none focus:border-[var(--color-brand-green)]"
                  />
                </div>
              </div>

              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 accent-[var(--color-brand-green)]"
                />
                <label htmlFor="isActive" className="text-sm font-bold">
                  Module is Active
                </label>
              </div>

              <div className="mt-6 flex justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
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
                  {submitting ? <TractorLoader size={20} /> : 'Save Module'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
