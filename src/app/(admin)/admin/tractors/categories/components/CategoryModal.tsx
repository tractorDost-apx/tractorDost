'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Category, categoryAPI } from '@/lib/api/categories';
import { X, Upload, Check, AlertCircle, FileText, Layers, Settings2 } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface CategoryModalProps {
  category: Category | null;
  categories: Category[]; // For parent selection
  onClose: () => void;
}

export default function CategoryModal({ category, categories, onClose }: CategoryModalProps) {
  const isEditing = !!category;

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    isActive: true,
    sortOrder: '0',
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId?.toString() || '',
        isActive: category.isActive,
        sortOrder: category.sortOrder?.toString() || '0',
      });
      if (category.iconUrl) {
        setIconPreview(category.iconUrl);
      }
    }
  }, [category]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setIconPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('slug', formData.slug);
      if (formData.description) data.append('description', formData.description);
      if (formData.parentId) data.append('parentId', formData.parentId);
      data.append('isActive', formData.isActive.toString());
      data.append('sortOrder', parseInt(formData.sortOrder || '0').toString());

      if (iconFile) {
        data.append('image', iconFile);
      }

      if (isEditing && category) {
        await categoryAPI.updateCategory(category.id, data);
      } else {
        await categoryAPI.createCategory(data);
      }

      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  // Helper to flatten categories for the dropdown, avoiding self-referencing if editing
  const renderCategoryOptions = (cats: Category[], level = 0) => {
    let options: React.ReactNode[] = [];
    cats.forEach((c) => {
      // Don't allow a category to be its own parent, or a child of its own children (simplified: just exclude self)
      if (isEditing && category && c.id === category.id) return;

      options.push(
        <option key={c.id} value={c.id}>
          {'- '.repeat(level)}
          {c.name}
        </option>
      );
      if (c.children && c.children.length > 0) {
        options = options.concat(renderCategoryOptions(c.children, level + 1));
      }
    });
    return options;
  };

  const SectionTitle = ({ icon: Icon, title }: { icon: any; title: string }) => (
    <div className="text-foreground mb-4 flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2">
      <Icon size={18} className="text-[var(--color-brand-green)]" />
      <h3 className="text-sm font-black tracking-wider uppercase">{title}</h3>
    </div>
  );

  return (
    <div className="bg-background/80 fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm sm:p-6">
      <div
        className="animate-fade-in flex max-h-[80vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] shadow-2xl"
        style={{ background: 'var(--background)' }}
      >
        {/* Sticky Header */}
        <div className="bg-background z-10 flex shrink-0 items-center justify-between border-b border-[var(--border-subtle)] px-6 py-5">
          <h2 className="text-foreground text-2xl font-black tracking-tight">
            {isEditing ? 'Edit Category Master' : 'Create New Category'}
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

          <form id="categoryForm" onSubmit={handleSubmit} className="flex flex-col gap-10">
            {/* SECTION 1: Identity */}
            <section>
              <SectionTitle icon={FileText} title="Category Details" />

              <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                {/* Icon Upload */}
                <div className="flex flex-col gap-2 md:col-span-4">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Category Icon
                  </label>
                  <div
                    className="bg-foreground/5 group relative flex aspect-square w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-[var(--border-brand)] transition-colors hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)]/5"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {iconPreview ? (
                      <>
                        <img
                          src={iconPreview}
                          alt="Preview"
                          className="h-full w-full object-contain p-4"
                        />
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                          <Upload size={24} className="mb-2 text-white" />
                          <span className="text-xs font-bold text-white">Change Icon</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-muted flex flex-col items-center gap-3 p-6 text-center transition-colors group-hover:text-[var(--color-brand-green)]">
                        <Upload size={32} />
                        <span className="text-xs leading-relaxed font-bold">
                          Click to upload icon (PNG/SVG)
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
                        Category Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                        placeholder="e.g. Mini Tractors"
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
                        placeholder="e.g. mini-tractors"
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
                      placeholder="Write a clear description of what this category represents..."
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: Hierarchy & Structure */}
            <section>
              <SectionTitle icon={Layers} title="Hierarchy & Tree" />
              <div className="bg-foreground/[0.02] grid grid-cols-1 gap-6 rounded-2xl border border-[var(--border-subtle)] p-6 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Parent Category
                  </label>
                  <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleChange}
                    className="bg-background text-foreground w-full rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                  >
                    <option value="">-- None (Root Category) --</option>
                    {renderCategoryOptions(categories)}
                  </select>
                  <p className="text-muted mt-1 text-[10px] font-medium">
                    Select a parent if this is a sub-category. Leave blank for root level.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: Settings */}
            <section>
              <SectionTitle icon={Settings2} title="Visibility & Ordering" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-muted text-xs font-bold tracking-wider uppercase">
                    Sort Order (Priority)
                  </label>
                  <input
                    type="number"
                    name="sortOrder"
                    value={formData.sortOrder}
                    onChange={handleChange}
                    className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-transparent px-4 py-3 text-sm font-bold transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none"
                    placeholder="0"
                  />
                  <p className="text-muted mt-1 text-[10px] font-medium">
                    Lower numbers appear first.
                  </p>
                </div>

                <div className="flex items-center sm:col-span-2">
                  <label className="bg-foreground/5 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent p-4 transition-colors hover:border-[var(--color-brand-green)]/30 sm:w-auto">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive}
                        onChange={handleChange}
                        className="peer sr-only"
                      />
                      <div className="flex h-6 w-6 items-center justify-center rounded-md border-2 border-[var(--border-brand)] transition-all peer-checked:border-[var(--color-brand-green)] peer-checked:bg-[var(--color-brand-green)]">
                        <Check
                          size={14}
                          className="scale-50 text-white opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100"
                          strokeWidth={4}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-foreground text-sm font-bold">Active Status</span>
                      <span className="text-muted text-[10px]">
                        Toggle visibility on the frontend
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </section>
          </form>
        </div>

        {/* Sticky Footer */}
        <div className="bg-background z-10 flex shrink-0 justify-end gap-3 border-t border-[var(--border-subtle)] px-6 py-4">
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
            form="categoryForm"
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
                {isEditing ? 'Save Changes' : 'Create Category'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
