'use client';

import React, { useState, useEffect } from 'react';
import {
  ImplementFamily,
  implementFamilyAPI,
  CreateImplementFamilyInput,
  UpdateImplementFamilyInput,
} from '@/lib/api/implementFamilies';
import { EquipmentBrand } from '@/lib/api/equipmentBrands';
import {
  X,
  AlertCircle,
  FileText,
  Settings2,
  Maximize2,
  Minimize2,
  FolderOpen,
  Link as LinkIcon,
  Search,
  Sparkles,
} from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';
import { toast } from '@/components/ui/toast';

interface ImplementFamilyModalProps {
  family: ImplementFamily | null;
  initialBrandId: number | null;
  brands: EquipmentBrand[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function ImplementFamilyModal({
  family,
  initialBrandId,
  brands,
  onClose,
  onSuccess,
}: ImplementFamilyModalProps) {
  const isEditing = !!family;

  const [formData, setFormData] = useState({
    brandId: family?.brandId
      ? String(family.brandId)
      : initialBrandId
        ? String(initialBrandId)
        : brands.length > 0
          ? String(brands[0].id)
          : '',
    name: family?.name || '',
    slug: family?.slug || '',
    description: family?.description || '',
    logoUrl: family?.logoUrl || '',
    isActive: family ? family.isActive : true,
    sortOrder: family?.sortOrder !== undefined ? String(family.sortOrder) : '0',
    seoTitle: family?.seoTitle || '',
    seoDescription: family?.seoDescription || '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrderTouched, setSortOrderTouched] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Keyboard shortcut: Escape exits fullscreen first, or closes modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isFullScreen) {
          setIsFullScreen(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullScreen, onClose]);

  // Sync state when family prop changes
  useEffect(() => {
    if (family) {
      setFormData({
        brandId: String(family.brandId),
        name: family.name,
        slug: family.slug,
        description: family.description || '',
        logoUrl: family.logoUrl || '',
        isActive: family.isActive,
        sortOrder: String(family.sortOrder ?? 0),
        seoTitle: family.seoTitle || '',
        seoDescription: family.seoDescription || '',
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        brandId: initialBrandId
          ? String(initialBrandId)
          : brands.length > 0
            ? String(brands[0].id)
            : '',
      }));
    }
  }, [family, initialBrandId, brands]);

  // Auto-generate slug from name if not editing
  useEffect(() => {
    if (!isEditing && formData.name) {
      setFormData((prev) => ({
        ...prev,
        slug: formData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, ''),
      }));
    }
  }, [formData.name, isEditing]);

  const validateSortOrder = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed === '') return 'Sort order is required';
    const num = Number(trimmed);
    if (isNaN(num)) return 'Sort order must be a valid number';
    if (!Number.isInteger(num)) return 'Sort order must be an integer';
    if (num < 0) return 'Sort order must be 0 or greater';
    return null;
  };

  const sortOrderError = validateSortOrder(formData.sortOrder);
  const isSortOrderInvalid = Boolean(
    sortOrderError &&
      (sortOrderTouched ||
        Number(formData.sortOrder) < 0 ||
        formData.sortOrder.includes('-'))
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      if (name === 'sortOrder') {
        setSortOrderTouched(true);
      }
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSortOrderTouched(true);

    const sortErr = validateSortOrder(formData.sortOrder);
    if (sortErr) {
      setError(sortErr);
      return;
    }

    const brandIdNum = Number(formData.brandId);
    if (!brandIdNum || brandIdNum <= 0) {
      setError('Please select an equipment brand');
      return;
    }

    if (!formData.name.trim()) {
      setError('Family name is required');
      return;
    }

    if (formData.seoTitle && formData.seoTitle.length > 60) {
      setError('SEO Title must not exceed 60 characters');
      return;
    }

    if (formData.seoDescription && formData.seoDescription.length > 160) {
      setError('SEO Description must not exceed 160 characters');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (isEditing && family) {
        const payload: UpdateImplementFamilyInput = {
          brandId: brandIdNum,
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          logoUrl: formData.logoUrl.trim() || undefined,
          sortOrder: parseInt(formData.sortOrder.trim(), 10) || 0,
          isActive: formData.isActive,
          seoTitle: formData.seoTitle.trim() || undefined,
          seoDescription: formData.seoDescription.trim() || undefined,
        };
        const res = await implementFamilyAPI.updateImplementFamily(
          family.id,
          payload
        );
        if (res.success) {
          toast.success('Implement family updated successfully');
          onSuccess();
        }
      } else {
        const payload: CreateImplementFamilyInput = {
          brandId: brandIdNum,
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          logoUrl: formData.logoUrl.trim() || undefined,
          sortOrder: parseInt(formData.sortOrder.trim(), 10) || 0,
          seoTitle: formData.seoTitle.trim() || undefined,
          seoDescription: formData.seoDescription.trim() || undefined,
        };
        const res = await implementFamilyAPI.createImplementFamily(payload);
        if (res.success) {
          toast.success('Implement family created successfully');
          onSuccess();
        }
      }
    } catch (err: any) {
      console.error('ImplementFamily error:', err);
      const apiError = err?.response?.data;
      const issues = apiError?.error;
      let msg = apiError?.message || 'Failed to save implement family';
      if (Array.isArray(issues) && issues.length > 0) {
        msg = issues.map((i: any) => i.message || i).join(', ');
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
      <div className="fixed inset-0 -z-10" onClick={onClose} />

      <div
        className={`relative flex w-full flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl transition-all duration-300 animate-scale-up ${
          isFullScreen
            ? 'h-[98vh] max-h-[98vh] max-w-[96vw]'
            : 'max-h-[92vh] max-w-3xl'
        }`}
      >
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/[0.02] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <FolderOpen size={24} />
            </div>
            <div>
              <h2 className="text-foreground text-xl font-black tracking-tight sm:text-2xl">
                {isEditing
                  ? 'Edit Implement Family'
                  : 'Create Implement Family'}
              </h2>
              <p className="text-muted text-xs font-semibold">
                {isEditing
                  ? `Update configuration for ${family?.name}`
                  : 'Add a new implement product family under an equipment brand'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="hover:bg-foreground/10 text-muted hover:text-foreground flex h-9 w-9 items-center justify-center rounded-xl transition-colors cursor-pointer"
              title={
                isFullScreen
                  ? 'Exit Full Screen (Esc)'
                  : 'Expand to Full Screen'
              }
            >
              {isFullScreen ? (
                <Minimize2 size={16} />
              ) : (
                <Maximize2 size={16} />
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="hover:bg-foreground/10 text-muted hover:text-foreground flex h-9 w-9 items-center justify-center rounded-xl transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-500 animate-shake">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <div className="text-xs sm:text-sm font-bold">{error}</div>
            </div>
          )}

          <form id="implementFamilyForm" onSubmit={handleSubmit} className="space-y-6">
            {/* SECTION 1: Brand & Basic Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-[var(--color-brand-green)] font-black text-xs tracking-wider uppercase">
                <FileText size={16} />
                <span>Family Details</span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Equipment Brand Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Equipment Brand <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="brandId"
                    value={formData.brandId}
                    onChange={handleChange}
                    required
                    className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-sm font-bold shadow-sm transition-all focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-background text-foreground">
                      -- Select Equipment Brand --
                    </option>
                    {brands.map((b) => (
                      <option
                        key={b.id}
                        value={b.id}
                        className="bg-background text-foreground"
                      >
                        {b.name} {!b.isActive ? '(Inactive)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Family Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Family Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Shaktiman Regular Series"
                    className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-sm font-bold shadow-sm transition-all focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                  />
                </div>

                {/* URL Slug */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="shaktiman-regular-series"
                    className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-sm font-medium font-mono shadow-sm transition-all focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                  />
                  <span className="text-muted text-[11px]">
                    Auto-generated from name if left blank
                  </span>
                </div>

                {/* Sort Order */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    min="0"
                    step="1"
                    value={formData.sortOrder}
                    onChange={handleChange}
                    className={`bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border px-4 py-3 text-sm font-bold shadow-sm transition-all focus:ring-2 focus:outline-none ${
                      isSortOrderInvalid
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                        : 'border-[var(--border-subtle)] focus:border-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]/20'
                    }`}
                  />
                  {isSortOrderInvalid && (
                    <span className="text-xs font-bold text-red-500">
                      {sortOrderError}
                    </span>
                  )}
                </div>
              </div>

              {/* Logo URL with Live Preview */}
              <div className="flex flex-col gap-1.5">
                <label className="text-muted text-xs font-bold tracking-wider uppercase flex items-center justify-between">
                  <span>Logo / Banner Image URL</span>
                  <span className="text-[11px] normal-case text-muted">
                    Direct image link (HTTPS)
                  </span>
                </label>
                <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                  <div className="relative flex-1 w-full">
                    <LinkIcon
                      size={16}
                      className="text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
                    />
                    <input
                      type="url"
                      name="logoUrl"
                      value={formData.logoUrl}
                      onChange={handleChange}
                      placeholder="https://example.com/images/family-logo.png"
                      className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-[var(--border-subtle)] py-3 pr-4 pl-10 text-sm font-medium shadow-sm transition-all focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                    />
                  </div>

                  {/* Logo Preview Box */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[var(--border-subtle)] bg-white p-1 shadow-sm">
                    {formData.logoUrl ? (
                      <img
                        src={formData.logoUrl}
                        alt="Preview"
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <FolderOpen size={20} className="text-muted/60" />
                    )}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1.5">
                <label className="text-muted text-xs font-bold tracking-wider uppercase">
                  Description / Overview
                </label>
                <textarea
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description of this implement family, compatibility, features, and applications..."
                  className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-[var(--border-subtle)] p-4 text-sm font-medium shadow-sm transition-all focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none resize-none"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 pt-1">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-foreground/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--color-brand-green)]"></div>
                  <span className="ml-3 text-sm font-bold text-foreground">
                    Active & Published
                  </span>
                </label>
                <span className="text-muted text-xs">
                  (Inactive families won&apos;t appear in public filters)
                </span>
              </div>
            </div>

            {/* SECTION 2: SEO Optimization */}
            <div className="space-y-4 pt-2 border-t border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-[var(--color-brand-green)] font-black text-xs tracking-wider uppercase">
                <Sparkles size={16} />
                <span>Search Engine Optimization (SEO)</span>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-muted text-xs font-bold tracking-wider uppercase">
                      SEO Title
                    </label>
                    <span
                      className={`text-[11px] font-bold ${
                        formData.seoTitle.length > 60
                          ? 'text-red-500'
                          : 'text-muted'
                      }`}
                    >
                      {formData.seoTitle.length}/60
                    </span>
                  </div>
                  <input
                    type="text"
                    name="seoTitle"
                    maxLength={60}
                    value={formData.seoTitle}
                    onChange={handleChange}
                    placeholder="e.g. Shaktiman Regular Rotavator Series | TractorDost"
                    className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-sm font-medium shadow-sm transition-all focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-muted text-xs font-bold tracking-wider uppercase">
                      SEO Meta Description
                    </label>
                    <span
                      className={`text-[11px] font-bold ${
                        formData.seoDescription.length > 160
                          ? 'text-red-500'
                          : 'text-muted'
                      }`}
                    >
                      {formData.seoDescription.length}/160
                    </span>
                  </div>
                  <textarea
                    name="seoDescription"
                    maxLength={160}
                    rows={2}
                    value={formData.seoDescription}
                    onChange={handleChange}
                    placeholder="Explore specifications, tractor compatibility, and dealer prices for this implement family..."
                    className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-[var(--border-subtle)] p-3 text-sm font-medium shadow-sm transition-all focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none resize-none"
                  />
                </div>
              </div>
            </div>
          </form>
        </div>

        {/* Footer Actions */}
        <div className="flex shrink-0 items-center justify-end gap-3 border-t border-[var(--border-subtle)] bg-foreground/[0.02] p-4 sm:p-5">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="hover:bg-foreground/10 text-foreground rounded-full px-5 py-2.5 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            form="implementFamilyForm"
            disabled={loading || isSortOrderInvalid}
            className="spatial-button flex items-center gap-2 rounded-full px-6 py-2.5 text-xs font-black shadow-lg disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <>
                <TractorLoader size={16} />
                <span>Saving...</span>
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Create Family'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

