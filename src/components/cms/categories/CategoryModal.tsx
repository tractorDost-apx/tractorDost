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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg rounded-2xl p-6 shadow-2xl border border-white/15 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <FolderTree size={20} className="text-[var(--color-brand-green)]" />
            <h2 className="text-lg font-black text-white">
              {category ? 'Edit Category' : 'Create Category'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all"
          >
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-white">
              Category Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tractors Review, Tips & Guides"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-bold text-muted">URL Slug</label>
              <button
                type="button"
                onClick={generateSlug}
                className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-brand-green)] hover:underline"
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
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 font-mono text-xs text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-white">Content Type</label>
              <select
                value={postType}
                onChange={(e) => {
                  setPostType(e.target.value as ContentType);
                  setParentId(''); // reset parent if type changed
                }}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-bold text-white focus:border-[var(--color-brand-green)] focus:outline-none"
              >
                {POST_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value} className="bg-zinc-900">
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-white">Parent Category</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs font-bold text-white focus:border-[var(--color-brand-green)] focus:outline-none"
              >
                <option value="" className="bg-zinc-900 text-muted">
                  None (Top Level)
                </option>
                {parentCandidates.map((c) => (
                  <option key={c.id} value={c.id} className="bg-zinc-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-muted">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description about this category..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="mb-1 block text-xs font-bold text-muted">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white focus:border-[var(--color-brand-green)] focus:outline-none"
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
              <label htmlFor="cat-active" className="text-xs font-bold text-white cursor-pointer select-none">
                Active Category
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex justify-end gap-2 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl px-4 py-2 text-xs font-bold text-muted hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-90 disabled:opacity-50 transition-all"
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
