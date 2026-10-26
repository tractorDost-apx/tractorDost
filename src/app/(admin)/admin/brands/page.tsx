'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Award,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  XCircle,
  Star,
  Globe2,
  Calendar,
  X,
  Tractor,
} from 'lucide-react';
import { brandAPI, Brand } from '@/lib/api/brands';
import { TractorLoader } from '@/components/ui/TractorLoader';
import { toast } from '@/components/ui/toast';

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [name, setName] = useState('');
  const [country, setCountry] = useState('India');
  const [foundedYear, setFoundedYear] = useState<number>(1960);
  const [aboutBrand, setAboutBrand] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadBrands = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await brandAPI.getAllBrands({ limit: 100 });
      if (res.success && res.data) {
        const payload = res.data as any;
        const list = payload.brands || payload.data || (Array.isArray(res.data) ? res.data : []);
        setBrands(list);
      }
    } catch (err: any) {
      console.error('Failed to load brands:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to fetch brand list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBrands();
  }, []);

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setCountry('India');
    setFoundedYear(1960);
    setAboutBrand('');
    setIsFeatured(false);
    setIsActive(true);
    setLogoFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setCountry(b.country || 'India');
    setFoundedYear(b.foundedYear || 1960);
    setAboutBrand(b.aboutBrand || '');
    setIsFeatured(b.isFeatured);
    setIsActive(b.isActive);
    setLogoFile(null);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('country', country);
      formData.append('foundedYear', String(foundedYear));
      formData.append('aboutBrand', aboutBrand);
      formData.append('isFeatured', String(isFeatured));
      formData.append('isActive', String(isActive));

      if (logoFile) {
        formData.append('logo', logoFile);
      }

      if (editingBrand) {
        await brandAPI.updateBrand(editingBrand.id, formData);
        toast.success('Brand updated successfully');
      } else {
        await brandAPI.createBrand(formData);
        toast.success('Brand created successfully');
      }

      setIsModalOpen(false);
      await loadBrands();
    } catch (err: any) {
      console.error('Failed to save brand:', err);
      setFormError(err?.response?.data?.message || 'Failed to save brand.');
      toast.error(err?.response?.data?.message || 'Failed to save brand.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBrand = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this tractor brand?')) return;
    try {
      await brandAPI.deleteBrand(id);
      toast.success('Brand deleted successfully');
      await loadBrands();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete brand.');
    }
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
              <Award size={18} />
            </span>
            <h1 className="text-2xl font-black text-foreground">OEM Tractor Brand Directory</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Manage certified tractor manufacturers, logos, brand heritage, and active catalog statuses.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-black uppercase text-black hover:bg-lime-300 transition-all shadow-md"
        >
          <Plus size={16} /> Add Brand
        </button>
      </div>

      {/* Search and Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="relative min-w-[300px]">
          <Search size={16} className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search manufacturer brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card/60 border-border/50 text-foreground w-full rounded-full border py-2.5 pl-9 pr-4 text-xs font-medium focus:border-lime-400 focus:outline-none"
          />
        </div>

        <div className="text-xs font-bold text-muted-foreground">
          Total Brands: <span className="text-foreground font-black">{brands.length}</span>
        </div>
      </div>

      {errorMsg && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-semibold text-red-500">
          {errorMsg}
        </div>
      )}

      {/* Brands Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <TractorLoader size={48} />
          <p className="text-muted-foreground mt-3 text-xs font-bold">Loading brand directory...</p>
        </div>
      ) : filteredBrands.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border/60 bg-card/40 p-12 text-center">
          <Award size={48} className="mx-auto text-muted-foreground mb-3 opacity-60" />
          <h3 className="text-foreground text-base font-bold">No tractor brands found</h3>
          <p className="text-muted-foreground text-xs mt-1 mb-6">
            Get started by adding your first OEM brand partner.
          </p>
          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-full bg-lime-400 px-6 py-2.5 text-xs font-black uppercase text-black"
          >
            Add First Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {filteredBrands.map((b) => (
            <div
              key={b.id}
              className="group flex flex-col rounded-3xl border border-border/60 bg-card/60 p-5 shadow-sm transition-all hover:border-lime-400/50 hover:shadow-xl"
            >
              {/* Logo Box */}
              <div className="relative mb-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-2xl border border-border/40 bg-white/95 p-4 dark:bg-zinc-900">
                {b.logoUrl ? (
                  <img
                    src={b.logoUrl}
                    alt={b.name}
                    className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <span className="text-3xl font-black text-muted-foreground/40">{b.name.charAt(0)}</span>
                )}
                {b.isFeatured && (
                  <div className="absolute top-2 right-2 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-500 flex items-center gap-1">
                    <Star size={10} className="fill-amber-500" /> Featured
                  </div>
                )}
              </div>

              {/* Info */}
              <h3 className="text-foreground text-lg font-black">{b.name}</h3>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>{b.country || 'India'}</span>
                {b.foundedYear && <span>· Est. {b.foundedYear}</span>}
              </p>

              <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-3 text-xs">
                <span className="font-bold text-muted-foreground">
                  {b.totalModels || 0} Models
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    b.isActive ? 'bg-lime-400/15 text-lime-400' : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {b.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center justify-end gap-2 border-t border-border/30 pt-3">
                <button
                  type="button"
                  onClick={() => openEditModal(b)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-lime-400 hover:text-black transition-colors"
                  title="Edit Brand"
                >
                  <Edit size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteBrand(b.id)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  title="Delete Brand"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Create/Edit */}
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
              {editingBrand ? `Edit Brand: ${editingBrand.name}` : 'Add New Tractor Brand'}
            </h2>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveBrand} className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Brand Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Swaraj, Mahindra, John Deere"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Country
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. India"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    value={foundedYear}
                    onChange={(e) => setFoundedYear(Number(e.target.value))}
                    className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Brand Logo Image
                </label>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  className="text-xs text-muted-foreground file:mr-2 file:rounded-lg file:border-0 file:bg-lime-400 file:px-3 file:py-1 file:text-xs file:font-black file:text-black hover:file:bg-lime-300"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  About Brand / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Short background summary of the brand..."
                  value={aboutBrand}
                  onChange={(e) => setAboutBrand(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center gap-6 border-t border-border/40 pt-3 text-xs font-bold text-foreground">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded accent-lime-400"
                  />
                  <span>Active Brand</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded accent-amber-500"
                  />
                  <span>Featured Partner</span>
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-border/60 px-5 py-2.5 text-xs font-bold text-foreground hover:bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl bg-lime-400 px-6 py-2.5 text-xs font-black uppercase text-black hover:bg-lime-300 disabled:opacity-70 shadow-md"
                >
                  {submitting ? 'Saving...' : editingBrand ? 'Update Brand' : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
