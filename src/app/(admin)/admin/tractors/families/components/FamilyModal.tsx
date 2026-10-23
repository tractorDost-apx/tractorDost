'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TractorFamily, tractorFamilyAPI } from '@/lib/api/tractorFamilies';
import { X, Upload, Check, AlertCircle, FileText, BarChart, Settings2 } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface FamilyModalProps {
  family: TractorFamily | null;
  brandId: number;
  onClose: () => void;
}

export default function FamilyModal({ family, brandId, onClose }: FamilyModalProps) {
  const isEditing = !!family;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    isActive: true,
    sortOrder: '0',
    seoTitle: '',
    seoDescription: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortOrderTouched, setSortOrderTouched] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateSortOrder = (value: string): string | null => {
    const trimmed = value.trim();
    if (trimmed === '') {
      return 'Sort order is required';
    }
    const num = Number(trimmed);
    if (isNaN(num)) {
      return 'Sort order must be a valid number';
    }
    if (!Number.isInteger(num)) {
      return 'Sort order must be an integer';
    }
    if (num < 0) {
      return 'Sort order must be 0 or greater';
    }
    return null;
  };

  const sortOrderError = validateSortOrder(formData.sortOrder);
  const isSortOrderInvalid = Boolean(
    sortOrderError && (sortOrderTouched || Number(formData.sortOrder) < 0 || formData.sortOrder.includes('-'))
  );

  useEffect(() => {
    if (family) {
      setFormData({
        name: family.name,
        slug: family.slug,
        description: family.description || '',
        isActive: family.isActive,
        sortOrder: family.sortOrder?.toString() || '0',
        seoTitle: family.seoTitle || '',
        seoDescription: family.seoDescription || '',
      });
      if (family.logoUrl) {
        setLogoPreview(family.logoUrl);
      }
    }
  }, [family]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSortOrderTouched(true);

    const sortOrderErr = validateSortOrder(formData.sortOrder);
    if (sortOrderErr) {
      setError(sortOrderErr);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('description', formData.description.trim());
      data.append('isActive', formData.isActive ? 'true' : 'false');
      data.append('sortOrder', parseInt(formData.sortOrder.trim(), 10).toString());
      data.append('seoTitle', formData.seoTitle.trim());
      data.append('seoDescription', formData.seoDescription.trim());

      if (logoFile) {
        data.append('logo', logoFile);
      }

      if (isEditing && family) {
        await tractorFamilyAPI.updateFamily(family.id, data);
      } else {
        // brandId is only sent on create
        data.append('brandId', brandId.toString());
        await tractorFamilyAPI.createFamily(data);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      const apiError = err?.response?.data;
      const zodMessage = Array.isArray(apiError?.error)
        ? apiError.error.map((e: any) => e.message).join(', ')
        : null;
      setError(zodMessage || apiError?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="text-foreground border-[var(--border-subtle)] mb-4 flex items-center gap-2 border-b pb-2">
      <Icon size={18} className="text-[var(--color-brand-green)]" />
      <h3 className="text-sm font-black tracking-wider uppercase">{title}</h3>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm sm:p-6 dark:bg-black/75">
      <div
        className="animate-fade-in border border-zinc-200 dark:border-white/10 flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl dark:bg-[#121814]"
      >
        {/* Sticky Header */}
        <div className="border-b border-zinc-100 bg-white z-10 flex shrink-0 items-center justify-between px-6 py-5 dark:border-white/10 dark:bg-[#121814]">
          <h2 className="text-foreground text-2xl font-black tracking-tight">
            {isEditing ? 'Edit Tractor Family' : 'Create New Tractor Family'}
          </h2>
          <button
            onClick={onClose}
            className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex h-10 w-10 items-center justify-center rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-red-500">
              <AlertCircle size={20} className="mt-0.5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <form id="familyForm" onSubmit={handleSubmit} className="flex flex-col gap-10">
            {/* SECTION 1: Identity */}
            <section>
              <SectionTitle icon={FileText} title="Family Identity" />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                {/* Logo Upload */}
                <div className="flex flex-col gap-2 md:col-span-4">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Family Logo / Icon
                  </label>
                  <div
                    className="border-[var(--border-brand)] bg-foreground/5 group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition-colors hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {logoPreview ? (
                      <>
                        <img
                          src={logoPreview}
                          alt="Preview"
                          className="h-full w-full bg-white object-contain p-4"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Upload size={24} className="mb-2 text-white" />
                          <span className="text-xs font-bold text-white">Change Logo</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted flex flex-col items-center gap-3 p-6 text-center transition-colors group-hover:text-[var(--color-brand-green)]">
                        <Upload size={32} />
                        <span className="text-xs leading-relaxed font-bold">
                          Click to upload transparent PNG
                        </span>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </div>

                {/* Identity Fields */}
                <div className="flex flex-col gap-4 md:col-span-8">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted text-xs font-bold tracking-wider uppercase">
                        Family Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                        placeholder="e.g. XP Plus"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-muted text-xs font-bold tracking-wider uppercase">
                        URL Slug *
                      </label>
                      <input
                        type="text"
                        name="slug"
                        value={formData.slug}
                        onChange={handleChange}
                        required
                        className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                        placeholder="e.g. xp-plus"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-muted text-xs font-bold tracking-wider uppercase">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="bg-foreground/5 text-foreground focus:bg-background w-full resize-none rounded-xl border border-transparent px-4 py-3 text-sm font-medium transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                      placeholder="Write a rich description about this tractor series or family..."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: SEO */}
            <section>
              <SectionTitle icon={BarChart} title="SEO & Discovery" />
              <div className="bg-foreground/[0.02] border-foreground/5 grid grid-cols-1 gap-6 rounded-2xl border p-6 md:grid-cols-2">
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    SEO Title (Max 60 chars)
                  </label>
                  <input
                    type="text"
                    name="seoTitle"
                    value={formData.seoTitle}
                    onChange={handleChange}
                    maxLength={60}
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full rounded-xl border px-4 py-3 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                    placeholder="e.g. Mahindra XP Plus Tractor Series - Specs & Price"
                  />
                  <div className="text-muted mt-1 text-right text-[10px] font-bold">
                    {formData.seoTitle.length}/60
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    SEO Description (Max 160 chars)
                  </label>
                  <textarea
                    name="seoDescription"
                    value={formData.seoDescription}
                    onChange={handleChange}
                    maxLength={160}
                    rows={2}
                    className="bg-background border-[var(--border-subtle)] text-foreground w-full resize-none rounded-xl border px-4 py-3 text-sm font-medium transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                    placeholder="Compare and discover specs, engines, and features of Mahindra XP Plus tractor models..."
                  />
                  <div className="text-muted mt-1 text-right text-[10px] font-bold">
                    {formData.seoDescription.length}/160
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: Settings */}
            <section>
              <SectionTitle icon={Settings2} title="Visibility & Settings" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Sort Order (Priority)
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    min="0"
                    step="1"
                    value={formData.sortOrder}
                    onChange={handleChange}
                    onBlur={() => setSortOrderTouched(true)}
                    onKeyDown={(e) => {
                      if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '.') {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasteData = e.clipboardData.getData('text');
                      if (pasteData && (pasteData.includes('-') || pasteData.includes('.'))) {
                        e.preventDefault();
                        const sanitized = pasteData.replace(/[^0-9]/g, '');
                        if (sanitized !== '') {
                          setFormData((prev) => ({ ...prev, sortOrder: sanitized }));
                        }
                      }
                    }}
                    className={`w-full rounded-xl border px-4 py-3 text-sm font-bold transition-all focus:outline-none ${
                      isSortOrderInvalid
                        ? 'border-red-500/50 bg-red-500/5 text-foreground focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'bg-foreground/5 text-foreground focus:bg-background border-transparent focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20'
                    }`}
                    placeholder="0"
                  />
                  {isSortOrderInvalid && sortOrderError ? (
                    <p className="animate-fade-in flex items-center gap-1 text-[11px] font-bold text-red-500">
                      <AlertCircle size={12} className="shrink-0" />
                      {sortOrderError}
                    </p>
                  ) : (
                    <p className="text-muted text-[10px] font-medium">
                      Non-negative integer (0 or greater). Lower numbers appear first.
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <label className="bg-foreground/5 mt-5 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent p-4 transition-colors hover:border-[var(--color-brand-green)]/30">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="border-[var(--border-brand)] flex h-6 w-6 items-center justify-center rounded-md border-2 transition-all peer-checked:border-[var(--color-brand-green)] peer-checked:bg-[var(--color-brand-green)]">
                        <Check
                          size={14}
                          className="scale-50 text-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100"
                          strokeWidth={4}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-bold">Active Status</span>
                      <span className="text-muted text-[10px]">Visible on frontend</span>
                    </div>
                  </label>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="border-[var(--border-subtle)] bg-background z-10 flex shrink-0 justify-end gap-3 border-t px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-foreground bg-foreground/5 hover:bg-foreground/10 rounded-xl px-6 py-2.5 font-bold transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="familyForm"
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-8 py-2.5 font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(29,191,115,0.3)] disabled:transform-none disabled:opacity-50 disabled:shadow-none"
          >
            {loading ? (
              <>
                <TractorLoader size={16} className="text-white" />
                Saving...
              </>
            ) : (
              <>
                <Check size={18} />
                {isEditing ? 'Save Changes' : 'Create Family'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
