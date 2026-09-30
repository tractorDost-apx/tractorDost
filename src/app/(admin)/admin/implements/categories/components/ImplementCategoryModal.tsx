'use client';

import React, { useState, useEffect } from 'react';
import { implementCategoryAPI, ImplementCategory } from '@/lib/api/implementCategories';
import { X, Upload, Layers, ChevronDown } from 'lucide-react';
import { TractorLoader } from '@/components/ui/TractorLoader';

interface ImplementCategoryModalProps {
  category: ImplementCategory | null;
  categories: ImplementCategory[]; // The full tree for parent selection
  onClose: () => void;
}

export default function ImplementCategoryModal({
  category,
  categories,
  onClose,
}: ImplementCategoryModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    parentId: '',
    sortOrder: '0',
    isActive: true,
  });

  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || '',
        parentId: category.parentId ? String(category.parentId) : '',
        sortOrder: String(category.sortOrder),
        isActive: category.isActive,
      });
      setIconPreview(category.iconUrl || null);
    }
  }, [category]);

  // Auto-generate slug from name if creating new
  useEffect(() => {
    if (!category && formData.name) {
      const generatedSlug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
      setFormData((prev) => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name, category]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData({ ...formData, [name]: (e.target as HTMLInputElement).checked });
    } else {
      setFormData({ ...formData, [name]: value });
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

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('slug', formData.slug);

      if (formData.description) {
        submitData.append('description', formData.description);
      }

      if (formData.parentId) {
        submitData.append('parentId', formData.parentId);
      }

      submitData.append('sortOrder', formData.sortOrder);
      submitData.append('isActive', formData.isActive ? 'true' : 'false');

      if (iconFile) {
        submitData.append('icon', iconFile);
      }

      if (category) {
        await implementCategoryAPI.updateImplementCategory(category.id, submitData);
      } else {
        await implementCategoryAPI.createImplementCategory(submitData);
      }
      onClose();
    } catch (error: any) {
      console.error(error);
      alert(error?.response?.data?.message || 'Failed to save category.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to flatten categories for the dropdown, avoiding self as parent
  const renderCategoryOptions = (cats: ImplementCategory[], level = 0): React.ReactNode[] => {
    let options: React.ReactNode[] = [];
    cats.forEach((cat) => {
      // Don't allow selecting itself or its children as parent
      if (category && cat.id === category.id) return;

      options.push(
        <option key={cat.id} value={cat.id}>
          {'\u00A0'.repeat(level * 4)} {level > 0 ? '↳ ' : ''}
          {cat.name}
        </option>
      );

      if (cat.children && cat.children.length > 0) {
        options = options.concat(renderCategoryOptions(cat.children, level + 1));
      }
    });
    return options;
  };

  return (
    <div className="bg-background/80 animate-fade-in fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-background flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] shadow-2xl">
        {/* Header */}
        <div className="bg-foreground/[0.02] flex items-center justify-between border-b border-[var(--border-subtle)] p-6">
          <div>
            <h2 className="text-foreground text-xl font-black tracking-tight">
              {category ? 'Edit Implement Category' : 'Add New Implement Category'}
            </h2>
            <p className="text-muted mt-1 text-xs font-bold tracking-wider uppercase">
              {category ? 'Update existing master data' : 'Create new master record'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-foreground/5 rounded-full p-2 transition-colors hover:bg-red-500/10 hover:text-red-500"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="custom-scrollbar flex-1 overflow-y-auto p-6">
          <form id="categoryForm" onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Icon Upload Section */}
            <div className="bg-foreground/[0.01] hover:bg-foreground/[0.03] group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border-subtle)] p-8 transition-colors">
              <input
                type="file"
                accept="image/jpeg, image/png, image/webp, image/svg+xml"
                onChange={handleFileChange}
                className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
              />

              {iconPreview ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-white p-2 shadow-sm transition-colors group-hover:border-[var(--color-brand-green)]">
                    <img
                      src={iconPreview}
                      alt="Preview"
                      className="max-h-full max-w-full object-contain"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                      <Upload size={20} className="text-white" />
                    </div>
                  </div>
                  <span className="text-muted text-xs font-bold tracking-wider uppercase">
                    Click to change icon
                  </span>
                </div>
              ) : (
                <div className="text-muted flex flex-col items-center gap-3 transition-colors group-hover:text-[var(--color-brand-green)]">
                  <div className="bg-foreground/5 rounded-full p-4 transition-colors group-hover:bg-[var(--color-brand-green)]/10">
                    <Layers size={24} />
                  </div>
                  <div className="text-center">
                    <p className="text-foreground text-sm font-bold">Upload Category Icon</p>
                    <p className="mt-1 text-xs font-medium tracking-wider uppercase">
                      SVG, PNG, JPG (Max 2MB)
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                  Category Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Cultivators"
                  className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-transparent px-4 py-2.5 text-sm font-bold transition-all focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                  Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  placeholder="e.g. cultivators"
                  className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-transparent px-4 py-2.5 text-sm font-bold transition-all focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                  Parent Category
                </label>
                <div className="relative">
                  <select
                    name="parentId"
                    value={formData.parentId}
                    onChange={handleChange}
                    className="bg-foreground/5 text-foreground focus:bg-background w-full appearance-none rounded-xl border border-transparent px-4 py-2.5 text-sm font-bold transition-all focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
                  >
                    <option value="">None (Root Category)</option>
                    {renderCategoryOptions(categories)}
                  </select>
                  <div className="text-muted pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4">
                    <ChevronDown size={16} />
                  </div>
                </div>
                <p className="text-muted mt-0.5 ml-1 text-[10px] font-medium">
                  Leave empty to make this a top-level category
                </p>
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Brief description of this implement category..."
                  rows={3}
                  className="bg-foreground/5 text-foreground focus:bg-background custom-scrollbar w-full resize-none rounded-xl border border-transparent px-4 py-3 text-sm font-medium transition-all focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-muted text-[10px] font-black tracking-wider uppercase">
                  Sort Order *
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  required
                  min="0"
                  className="bg-foreground/5 text-foreground focus:bg-background w-full rounded-xl border border-transparent px-4 py-2.5 text-sm font-bold transition-all focus:ring-2 focus:ring-[var(--color-brand-green)]/30 focus:outline-none"
                />
                <p className="text-muted mt-0.5 ml-1 text-[10px] font-medium">
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <div className="bg-foreground/5 flex items-center gap-3 rounded-xl border border-transparent p-4 transition-colors hover:border-[var(--border-subtle)]">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="bg-background h-5 w-5 rounded border-[var(--border-subtle)] text-[var(--color-brand-green)] focus:ring-[var(--color-brand-green)]"
              />
              <label
                htmlFor="isActive"
                className="text-foreground cursor-pointer text-sm font-bold select-none"
              >
                Active & Visible
                <p className="text-muted mt-0.5 text-[10px] font-medium tracking-wider uppercase">
                  Show this category in public menus and listings
                </p>
              </label>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-foreground/[0.02] flex justify-end gap-3 border-t border-[var(--border-subtle)] p-6">
          <button
            type="button"
            onClick={onClose}
            className="text-foreground/70 bg-foreground/5 hover:bg-foreground/10 rounded-full px-6 py-2.5 text-sm font-bold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="categoryForm"
            disabled={loading}
            className="flex items-center gap-2 rounded-full bg-[var(--color-brand-green)] px-8 py-2.5 text-sm font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-colors hover:bg-[var(--color-brand-orange)] disabled:pointer-events-none disabled:opacity-50"
          >
            {loading && <TractorLoader size={20} />}
            {category ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}
