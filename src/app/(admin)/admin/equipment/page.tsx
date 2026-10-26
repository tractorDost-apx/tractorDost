'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Wrench,
  Plus,
  Trash2,
  Edit,
  Search,
  Filter,
  CheckCircle2,
  Layers,
  X,
  Wheat,
} from 'lucide-react';
import { implementAPI, Implement } from '@/lib/api/implements';
import { TractorLoader } from '@/components/ui/TractorLoader';
import { toast } from '@/components/ui/toast';

export default function AdminEquipmentPage() {
  const [implementsList, setImplementsList] = useState<Implement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Implement | null>(null);

  // Form Fields
  const [modelName, setModelName] = useState('');
  const [slug, setSlug] = useState('');
  const [workingWidthFt, setWorkingWidthFt] = useState<number>(6);
  const [compatibleHpMin, setCompatibleHpMin] = useState<number>(40);
  const [compatibleHpMax, setCompatibleHpMax] = useState<number>(55);
  const [priceMin, setPriceMin] = useState<number>(85000);
  const [priceMax, setPriceMax] = useState<number>(115000);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadImplements = async () => {
    try {
      setLoading(true);
      const res = await implementAPI.getAllImplements({ limit: 50 });
      if (res.data?.data) {
        setImplementsList(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load implements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImplements();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setModelName('');
    setSlug('');
    setWorkingWidthFt(6);
    setCompatibleHpMin(40);
    setCompatibleHpMax(55);
    setPriceMin(85000);
    setPriceMax(115000);
    setDescription('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (item: Implement) => {
    setEditingItem(item);
    setModelName(item.modelName);
    setSlug(item.slug);
    setWorkingWidthFt(item.workingWidthFt || 6);
    setCompatibleHpMin(item.compatibleHpMin || 40);
    setCompatibleHpMax(item.compatibleHpMax || 55);
    setPriceMin(item.priceMin || 85000);
    setPriceMax(item.priceMax || 115000);
    setDescription(item.description || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const formData = new FormData();
      formData.append('modelName', modelName);
      formData.append(
        'slug',
        slug || modelName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
      );
      formData.append('workingWidthFt', String(workingWidthFt));
      formData.append('compatibleHpMin', String(compatibleHpMin));
      formData.append('compatibleHpMax', String(compatibleHpMax));
      formData.append('priceMin', String(priceMin));
      formData.append('priceMax', String(priceMax));
      formData.append('description', description);
      formData.append('categoryId', '1'); // Default farm implement category

      if (editingItem) {
        await implementAPI.updateImplement(editingItem.id, formData);
      } else {
        await implementAPI.createImplement(formData);
      }

      setIsModalOpen(false);
      await loadImplements();
    } catch (err: any) {
      console.error('Failed to save implement:', err);
      setFormError(err?.response?.data?.message || 'Failed to save farm equipment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this farm equipment?')) return;
    try {
      await implementAPI.deleteImplement(id);
      toast.success('Equipment deleted successfully');
      await loadImplements();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete equipment.');
    }
  };

  const filtered = implementsList.filter((imp) =>
    imp.modelName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
              <Wheat size={18} />
            </span>
            <h1 className="text-2xl font-black text-foreground">Farm Implements & Machinery</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage rotavators, seeders, combine harvesters, laser levelers, and power tillers catalog.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-black uppercase text-black hover:bg-lime-300 transition-all shadow-md"
        >
          <Plus size={16} /> Add Equipment
        </button>
      </div>

      {/* Filter and Stats */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative min-w-[280px]">
          <Search size={16} className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search equipment model..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card/60 border-border/50 text-foreground w-full rounded-full border py-2.5 pl-9 pr-4 text-xs font-medium focus:border-lime-400 focus:outline-none"
          />
        </div>
        <div className="text-xs font-bold text-muted-foreground">
          Total Implements: <span className="text-foreground font-black">{implementsList.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <TractorLoader size={40} />
            <p className="text-muted-foreground mt-3 text-xs font-bold">Loading equipment...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No implements found. Click "+ Add Equipment" to add a new machinery specification.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/40 text-muted-foreground uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3 font-bold">Model Name</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold">Brand</th>
                  <th className="pb-3 font-bold">Compatible HP</th>
                  <th className="pb-3 font-bold">Price Range</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-foreground">
                      {item.modelName}
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground">
                      {item.category?.name || 'Tillage'}
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground font-semibold">
                      {item.brand?.name || 'OEM'}
                    </td>
                    <td className="py-3.5 pr-4 text-lime-400 font-bold">
                      {item.compatibleHpMin || 35} - {item.compatibleHpMax || 55} HP
                    </td>
                    <td className="py-3.5 pr-4 font-extrabold text-foreground">
                      {item.priceMin ? `₹ ${item.priceMin.toLocaleString('en-IN')}` : 'Contact Dealer'}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-lime-400 hover:text-black transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl border border-border/60 bg-card p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-black text-foreground mb-4">
              {editingItem ? 'Edit Farm Equipment' : 'Add New Farm Equipment'}
            </h2>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                {formError}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Equipment Model Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shaktiman Semi-Champion Rotavator 6 Feet"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Min Tractor HP
                  </label>
                  <input
                    type="number"
                    value={compatibleHpMin}
                    onChange={(e) => setCompatibleHpMin(Number(e.target.value))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Max Tractor HP
                  </label>
                  <input
                    type="number"
                    value={compatibleHpMax}
                    onChange={(e) => setCompatibleHpMax(Number(e.target.value))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Price Min (₹)
                  </label>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Price Max (₹)
                  </label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Description & Specifications
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border/60 px-5 py-2 text-xs font-bold text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-lime-400 px-6 py-2 text-xs font-black uppercase text-black hover:bg-lime-300 disabled:opacity-70 shadow-md"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Update' : 'Add Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
