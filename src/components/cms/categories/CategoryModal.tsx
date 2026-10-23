'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Sparkles, FolderTree } from 'lucide-react';
import {
  cmsAPI,
  ContentCategory,
  ContentType,
  CreateContentCategoryInput,
  UpdateContentCategoryInput,
} from '@/lib/api/cms';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category?: ContentCategory | null;
  allCategories: ContentCategory[];
  onSuccess: () => void;
}

const POST_TYPES: { label: string; value: ContentType }[] = [
  { label: 'Blog', value: 'BLOG' },
  { label: 'News', value: 'NEWS' },
  { label: 'Buying Guide', value: 'BUYING_GUIDE' },
  { label: 'Comparison', value: 'COMPARISON' },
  { label: 'Video', value: 'VIDEO' },
  { label: 'Web Story', value: 'WEB_STORY' },
];

export default function CategoryModal({
  isOpen,
  onClose,
  category,
  allCategories,
  onSuccess,
}: CategoryModalProps) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [postType, setPostType] = useState<ContentType>('BLOG');
  const [parentId, setParentId] = useState<number | ''>('');
  const [description, setDescription] = useState('');
  const [sortOrder, setSortOrder] = useState<number>(0);
  const [isActive, setIsActive] = useState<boolean>(true);

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setPostType(category.postType);
      setParentId(category.parentId ?? '');
      setDescription(category.description ?? '');
      setSortOrder(category.sortOrder ?? 0);
      setIsActive(category.isActive ?? true);
    } else {
      setName('');
      setSlug('');
      setPostType('BLOG');
      setParentId('');
      setDescription('');
      setSortOrder(0);
      setIsActive(true);
    }
    setErrorMsg(null);
  }, [category, isOpen]);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const generateSlug = () => {
    if (!name.trim()) return;
    const clean = name
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 100);
    setSlug(clean);
  };

  // Filter possible parents: same postType, and avoid selecting itself
  const parentCandidates = allCategories.filter(
    (c) => c.postType === postType && (!category || c.id !== category.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }

    setSaving(true);
    try {
      if (category) {
        // Edit mode
        const payload: UpdateContentCategoryInput = {
          name: name.trim(),
          slug: slug.trim() || undefined,
          postType,
          parentId: parentId === '' ? null : Number(parentId),
          description: description.trim() || null,
          sortOrder: Number(sortOrder),
          isActive,
        };
        const res = await cmsAPI.updateCategory(category.id, payload);
        if (res.success) {
          onSuccess();
          onClose();
        }
      } else {
        // Create mode
        const payload: CreateContentCategoryInput = {
          name: name.trim(),
          slug: slug.trim() || undefined,
          postType,
          parentId: parentId === '' ? null : Number(parentId),
          description: description.trim() || null,
          sortOrder: Number(sortOrder),
          isActive,
        };
        const res = await cmsAPI.createCategory(payload);
        if (res.success) {
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      console.error('Failed to save category', err);
      const msg = err?.response?.data?.message || 'Failed to save category.';
      setErrorMsg(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
      <div
        className="fixed inset-0 -z-10"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-3xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
              <FolderTree size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-foreground">
                {category ? 'Edit Category Master' : 'Create Category Master'}
              </h2>
              <p className="text-xs text-muted font-bold">
                Configure taxonomy parameters and hierarchy.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-foreground/5 text-muted hover:text-foreground rounded-full p-2 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 p-3 text-xs font-bold text-red-600 dark:text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-foreground/80">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tractors Review, Tips & Guides"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2.5 text-xs font-bold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-foreground/80">URL Slug</label>
              <button
                type="button"
                onClick={generateSlug}
                className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-brand-green)] hover:underline cursor-pointer"
              >
                <Sparkles size={12} />
                Generate
              </button>
            </div>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="tractors-review"
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2 font-mono text-xs font-bold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-foreground/80">Content Type</label>
              <select
                value={postType}
                onChange={(e) => {
                  setPostType(e.target.value as ContentType);
                  setParentId(''); // reset parent if type changed
                }}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer transition-colors"
              >
                {POST_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value} className="bg-background text-foreground">
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-foreground/80">Parent Category</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer transition-colors"
              >
                <option value="" className="bg-background text-muted">
                  None (Top Level)
                </option>
                {parentCandidates.map((c) => (
                  <option key={c.id} value={c.id} className="bg-background text-foreground">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-black uppercase tracking-wider text-foreground/80">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description about this category..."
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2 text-xs font-medium text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="mb-1 block text-xs font-black uppercase tracking-wider text-foreground/80">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="cat-active"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded accent-[var(--color-brand-green)] cursor-pointer"
              />
              <label htmlFor="cat-active" className="text-xs font-bold text-foreground cursor-pointer select-none">
                Active Category
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex justify-end gap-2 border-t border-[var(--border-subtle)] pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2 text-xs font-bold text-foreground hover:bg-foreground/10 transition-all disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black tracking-wider text-white uppercase shadow-md hover:bg-[var(--color-brand-orange)] disabled:opacity-50 transition-all cursor-pointer"
            >
              <Save size={14} />
              <span>{saving ? 'Saving...' : category ? 'Update Category' : 'Create Category'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
