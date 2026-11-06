'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ImplementFamily,
  implementFamilyAPI,
  CreateImplementFamilyInput,
  UpdateImplementFamilyInput,
} from '@/lib/api/implementFamilies';
import { EquipmentBrand } from '@/lib/api/equipmentBrands';
import { mediaAPI } from '@/lib/api/media';
import { validateImageFile } from '@/lib/utils/file-validation';
import {
  X,
  AlertCircle,
  FileText,
  Maximize2,
  Minimize2,
  FolderOpen,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trash2,
  CheckCircle2,
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
    isActive: family ? family.isActive : true,
    sortOrder: family?.sortOrder !== undefined ? String(family.sortOrder) : '0',
    seoTitle: family?.seoTitle || '',
    seoDescription: family?.seoDescription || '',
  });

  // Direct image upload states
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    family?.logoUrl || null
  );
  const [existingLogoUrl, setExistingLogoUrl] = useState<string | null>(
    family?.logoUrl || null
  );
  const [existingLogoId, setExistingLogoId] = useState<string | null>(
    family?.logoId || null
  );
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [uploadStep, setUploadStep] = useState<string | null>(null);
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
        isActive: family.isActive,
        sortOrder: String(family.sortOrder ?? 0),
        seoTitle: family.seoTitle || '',
        seoDescription: family.seoDescription || '',
      });
      setLogoPreview(family.logoUrl || null);
      setExistingLogoUrl(family.logoUrl || null);
      setExistingLogoId(family.logoId || null);
      setLogoFile(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        brandId: initialBrandId
          ? String(initialBrandId)
          : brands.length > 0
            ? String(brands[0].id)
            : '',
      }));
      setLogoPreview(null);
      setExistingLogoUrl(null);
      setExistingLogoId(null);
      setLogoFile(null);
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

  // Image Selection Handler
  const handleSelectImage = (file: File) => {
    const validation = validateImageFile(file, { isLogo: true, maxSizeMB: 5 });
    if (!validation.valid) {
      const err = validation.error || 'Invalid image file';
      setError(err);
      toast.error(err);
      return;
    }

    setError(null);
    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectImage(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectImage(e.dataTransfer.files[0]);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLogoFile(null);
    setLogoPreview(null);
    setExistingLogoUrl(null);
    setExistingLogoId(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
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
      let finalLogoUrl = existingLogoUrl || '';
      let finalLogoId = existingLogoId || '';

      // 1. Upload new image file if selected
      if (logoFile) {
        setUploadStep('Uploading family image...');
        const mediaForm = new FormData();
        mediaForm.append('file', logoFile);
        mediaForm.append('targetType', 'IMPLEMENT');
        mediaForm.append('targetId', String(brandIdNum));
        mediaForm.append('mediaType', 'image');

        const mediaRes = await mediaAPI.createMedia(mediaForm);

        if (mediaRes.success && mediaRes.data && mediaRes.data.length > 0) {
          finalLogoUrl = mediaRes.data[0].url;
          finalLogoId = mediaRes.data[0].fileId || '';
        } else {
          throw new Error('Image upload failed. Please try again.');
        }
      }

      // 2. Create or Update Implement Family with the uploaded image URL
      setUploadStep(isEditing ? 'Updating family details...' : 'Creating family...');

      if (isEditing && family) {
        const payload: UpdateImplementFamilyInput = {
          brandId: brandIdNum,
          name: formData.name.trim(),
          slug: formData.slug.trim() || undefined,
          description: formData.description.trim() || undefined,
          logoUrl: finalLogoUrl || '',
          logoId: finalLogoId || undefined,
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
          logoUrl: finalLogoUrl || undefined,
          logoId: finalLogoId || undefined,
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
      console.error('ImplementFamily save error:', err);
      const apiError = err?.response?.data;
      const issues = apiError?.error;
      let msg = apiError?.message || err?.message || 'Failed to save implement family';
      if (Array.isArray(issues) && issues.length > 0) {
        msg = issues.map((i: any) => i.message || i).join(', ');
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
      setUploadStep(null);
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

          <form
            id="implementFamilyForm"
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            {/* SECTION 1: Family Logo (Direct Upload) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[var(--color-brand-green)] font-black text-xs tracking-wider uppercase">
                  <ImageIcon size={16} />
                  <span>Family Logo / Photo</span>
                </div>
                <span className="text-[11px] text-muted">
                  Max size: 5MB (PNG, JPG, WebP, SVG)
                </span>
              </div>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml"
                onChange={handleFileInputChange}
              />

              {/* Upload Dropzone / Preview */}
              {logoPreview ? (
                <div className="relative flex flex-col sm:flex-row items-center gap-4 rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  {/* Image Display */}
                  <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-white p-2 shadow-sm overflow-hidden">
                    <img
                      src={logoPreview}
                      alt="Logo preview"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  {/* Image Metadata & Controls */}
                  <div className="flex flex-1 flex-col gap-1 text-center sm:text-left min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-foreground text-sm font-bold truncate">
                        {logoFile ? logoFile.name : 'Current Family Logo'}
                      </span>
                      {logoFile && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-[var(--color-brand-green)]/15 px-2 py-0.5 text-[10px] font-black text-[var(--color-brand-green)]">
                          <CheckCircle2 size={12} /> Ready
                        </span>
                      )}
                    </div>
                    <span className="text-muted text-xs font-medium">
                      {logoFile
                        ? `File size: ${formatFileSize(logoFile.size)} • Type: ${logoFile.type || 'Image'}`
                        : 'Image is linked to this family'}
                    </span>

                    {/* Action buttons */}
                    <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-background px-3 py-1.5 text-xs font-bold text-foreground transition-colors hover:bg-foreground/5 cursor-pointer shadow-sm"
                      >
                        <Upload size={14} /> Change Image
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="flex items-center gap-1.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-500 transition-colors hover:bg-red-500/20 cursor-pointer"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-[var(--color-brand-green)] bg-[var(--color-brand-green)]/10 scale-[0.99]'
                      : 'border-[var(--border-subtle)] bg-foreground/[0.02] hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/5'
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-background text-muted shadow-sm transition-transform group-hover:scale-110 group-hover:text-[var(--color-brand-green)]">
                    <Upload size={22} />
                  </div>
                  <div>
                    <div className="text-foreground text-sm font-bold">
                      Click to choose an image or drag & drop here
                    </div>
                    <div className="text-muted text-xs mt-1">
                      PNG, JPG, WebP, or SVG up to 5MB
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION 2: Brand & Identity Details */}
            <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
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
                    <option
                      value=""
                      disabled
                      className="bg-background text-foreground"
                    >
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
                    placeholder="e.g. Regular Series Rotavator"
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
                    placeholder="regular-series-rotavator"
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

            {/* SECTION 3: SEO Optimization */}
            <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
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
                <span>{uploadStep || 'Saving...'}</span>
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
