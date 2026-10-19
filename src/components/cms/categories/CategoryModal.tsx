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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150 dark:bg-black/75">
      <div className="relative w-full max-w-lg rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:border-white/15 dark:bg-[#121814]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-100 pb-4 mb-4 dark:border-white/10">
          <div className="flex items-center gap-2">
            <FolderTree size={20} className="text-[var(--color-brand-green)]" />
            <h2 className="text-lg font-black text-zinc-900 dark:text-white">
              {category ? 'Edit Category' : 'Create Category'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-all dark:border-transparent dark:bg-white/5 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-500">
            <AlertCircle size={16} className="shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Tractors Review, Tips & Guides"
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-xs font-bold text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-white/30"
            />
          </div>

          <div>
            <div className="mb-1 flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-400">URL Slug</label>
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
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 font-mono text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-white/30"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-zinc-700 dark:text-zinc-300">Content Type</label>
              <select
                value={postType}
                onChange={(e) => {
                  setPostType(e.target.value as ContentType);
                  setParentId(''); // reset parent if type changed
                }}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-900 focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
              >
                {POST_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-zinc-700 dark:text-zinc-300">Parent Category</label>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-xs font-bold text-zinc-900 focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
              >
                <option value="">
                  None (Top Level)
                </option>
                {parentCandidates.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-zinc-700 dark:text-zinc-400">Description (Optional)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description about this category..."
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-900 placeholder:text-zinc-400 focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder-white/30"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="mb-1 block text-xs font-bold text-zinc-700 dark:text-zinc-400">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-xs text-zinc-900 focus:border-[var(--color-brand-green)] focus:bg-white focus:outline-none dark:border-white/10 dark:bg-black/40 dark:text-white"
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
              <label htmlFor="cat-active" className="text-xs font-bold text-zinc-800 cursor-pointer select-none dark:text-white">
                Active Category
              </label>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex justify-end gap-2 border-t border-zinc-100 pt-4 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 transition-all disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-bold text-white shadow-md hover:brightness-110 disabled:opacity-50 transition-all"
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
