'use client';

import React, { useState, useEffect } from 'react';
import { accessControlAPI, ModuleTreeNode, Module } from '@/lib/api/accessControl';
import { Plus, Edit, Trash2, LayoutGrid, ChevronRight, ChevronDown } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

const ModuleRow = ({ node, level = 0, onEdit, onDelete }: { node: ModuleTreeNode, level?: number, onEdit: (m: Module) => void, onDelete: (id: number) => void }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <>
      <div className="flex items-center justify-between p-3 border-b border-[var(--border-subtle)] hover:bg-foreground/5 transition-colors">
        <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 24}px` }}>
          {hasChildren ? (
            <button onClick={() => setExpanded(!expanded)} className="p-1 hover:bg-foreground/10 rounded">
              {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          ) : (
            <div className="w-6" /> // spacer
          )}
          <span className="font-bold">{node.name}</span>
          <span className="text-xs font-mono bg-foreground/10 px-2 py-0.5 rounded text-muted">{node.code}</span>
          {!node.isActive && <span className="text-[10px] uppercase font-bold bg-red-500/10 text-red-500 px-2 py-0.5 rounded">Inactive</span>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">Order: {node.sortOrder}</span>
          <button onClick={() => onEdit(node)} className="p-1.5 text-muted hover:text-blue-400 bg-foreground/5 rounded-lg ml-4"><Edit size={14} /></button>
          <button onClick={() => onDelete(node.id)} className="p-1.5 text-muted hover:text-red-400 bg-foreground/5 rounded-lg"><Trash2 size={14} /></button>
        </div>
      </div>
      {expanded && hasChildren && node.children.map(child => (
        <ModuleRow key={child.id} node={child} level={level + 1} onEdit={onEdit} onDelete={onDelete} />
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
    isActive: true
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
        accessControlAPI.listModules({ limit: 1000 })
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
        isActive: module.isActive
      });
    } else {
      setEditingModule(null);
      setFormData({ name: '', code: '', description: '', parentId: '', sortOrder: '0', isActive: true });
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
        sortOrder: parseInt(formData.sortOrder)
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

  if (loading) return <div className="flex justify-center p-12"><TractorLoader className="text-[var(--color-brand-green)]" size={48} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <LayoutGrid className="text-[var(--color-brand-green)]" size={24} /> System Modules
        </h2>
        <button
          onClick={() => openModal()}
          className="spatial-button px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2"
        >
          <Plus size={16} /> Add Module
        </button>
      </div>

      <div className="bg-foreground/5 border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-foreground/5 border-b border-[var(--border-subtle)]">
          <span className="text-sm font-bold text-muted uppercase tracking-wider">Module Structure</span>
          <span className="text-sm font-bold text-muted uppercase tracking-wider">Actions</span>
        </div>
        <div className="flex flex-col">
          {tree.length === 0 ? (
            <div className="p-8 text-center text-muted font-bold">No modules found</div>
          ) : (
            tree.map(node => <ModuleRow key={node.id} node={node} onEdit={openModal} onDelete={handleDelete} />)
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-2xl animate-fade-in relative max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-black mb-6">{editingModule ? 'Edit Module' : 'Create New Module'}</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">Name</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required className="w-full h-12 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 font-bold focus:border-[var(--color-brand-green)] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">Code</label>
                  <input type="text" value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value })} required className="w-full h-12 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 font-bold focus:border-[var(--color-brand-green)] outline-none" placeholder="e.g. USER_MANAGEMENT" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-muted mb-1">Description</label>
                <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full h-20 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl p-4 font-medium focus:border-[var(--color-brand-green)] outline-none resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">Parent Module</label>
                  <select
                    value={formData.parentId}
                    onChange={e => setFormData({ ...formData, parentId: e.target.value })}
                    className="w-full h-12 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 font-bold focus:border-[var(--color-brand-green)] outline-none appearance-none"
                  >
                    <option value="">-- None (Root) --</option>
                    {flatModules.filter(m => m.id !== editingModule?.id).map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-muted mb-1">Sort Order</label>
                  <input type="number" value={formData.sortOrder} onChange={e => setFormData({ ...formData, sortOrder: e.target.value })} required className="w-full h-12 bg-foreground/5 border border-[var(--border-subtle)] rounded-xl px-4 font-bold focus:border-[var(--color-brand-green)] outline-none" />
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="w-4 h-4 accent-[var(--color-brand-green)]" />
                <label htmlFor="isActive" className="text-sm font-bold">Module is Active</label>
              </div>

              <div className="flex justify-end gap-3 mt-6 border-t border-[var(--border-subtle)] pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-bold hover:bg-foreground/10 transition-colors">Cancel</button>
                <button type="submit" disabled={submitting} className="spatial-button px-6 py-2 rounded-xl text-sm font-bold flex items-center justify-center">
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
