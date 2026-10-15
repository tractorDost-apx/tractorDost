'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  Filter,
} from 'lucide-react';
import { cmsAPI, ContentCategory, ContentType } from '@/lib/api/cms';
import CategoryModal from './CategoryModal';
import Pagination from '@/components/shared/Pagination';

export default function CategoryList() {
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<ContentType | ''>('');

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | null>(null);

  // Delete modal
  const [catToDelete, setCatToDelete] = useState<ContentCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsAPI.getCategories({
        page,
        limit,
        search: debouncedSearch || undefined,
        postType: typeFilter || undefined,
        sortBy: 'sortOrder',
        sortOrder: 'asc',
      });
      if (res.success && Array.isArray(res.data)) {
        setCategories(res.data);
        if (res.meta) {
          setTotalCount(res.meta.total);
          setTotalPages(res.meta.totalPages);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, typeFilter]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async () => {
    if (!catToDelete) return;
    setIsDeleting(true);
    setAlertMsg(null);

    try {
      const res = await cmsAPI.deleteCategory(catToDelete.id);
      if (res.success) {
        setAlertMsg({ text: `Category "${catToDelete.name}" deleted successfully.`, type: 'success' });
        setCatToDelete(null);
        fetchCategories();
      }
    } catch (err: any) {
      console.error('Failed to delete category', err);
      const msg = err?.response?.data?.message || 'Failed to delete category.';
      setAlertMsg({ text: msg, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FolderTree className="text-[var(--color-brand-green)]" size={24} />
            Content Categories
          </h1>
          <p className="text-xs text-muted">
            Organize articles, news, buying guides, and stories into structured hierarchies.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[var(--color-brand-green)]/20 hover:opacity-90 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs font-semibold ${
            alertMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category name..."
              className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 py-2 text-xs text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-white"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value as ContentType | '');
                setPage(1);
              }}
              className="rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-bold text-white focus:border-[var(--color-brand-green)] focus:outline-none"
            >
              <option value="" className="bg-zinc-900">All Post Types</option>
              <option value="BLOG" className="bg-zinc-900">Blog</option>
              <option value="NEWS" className="bg-zinc-900">News</option>
              <option value="BUYING_GUIDE" className="bg-zinc-900">Buying Guide</option>
              <option value="COMPARISON" className="bg-zinc-900">Comparison</option>
              <option value="VIDEO" className="bg-zinc-900">Video</option>
              <option value="WEB_STORY" className="bg-zinc-900">Web Story</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <div className="glass-panel flex flex-col overflow-hidden rounded-2xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-4">Slug</th>
                <th className="py-3.5 px-4">Post Type</th>
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-brand-green)] border-t-transparent" />
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted">
                    <FolderTree size={36} className="mx-auto mb-2 opacity-30 text-[var(--color-brand-green)]" />
                    <p className="text-sm font-bold text-white">No categories found</p>
                    <p className="mt-1 text-xs">Create your first category to group your content.</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr key={cat.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{cat.name}</span>
                        {cat.parentId && (
                          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-muted">
                            sub
                          </span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-[11px] text-muted line-clamp-1 mt-0.5">{cat.description}</p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-muted">
                      {cat.slug}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand-green)]">
                        {cat.postType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-muted font-mono">
                      {cat.sortOrder}
                    </td>
                    <td className="py-3.5 px-4">
                      {cat.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                          <CheckCircle2 size={13} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500">
                          <XCircle size={13} /> Inactive
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setIsModalOpen(true);
                          }}
                          title="Edit Category"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-white/10 hover:text-[var(--color-brand-green)] transition-all"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setCatToDelete(cat)}
                          title="Delete Category"
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-red-500/10 hover:text-red-400 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          page={page}
          limit={limit}
          totalCount={totalCount}
          totalPages={totalPages}
          onPageChange={(p) => setPage(p)}
          onLimitChange={(l) => {
            setLimit(l);
            setPage(1);
          }}
        />
      </div>

      {/* Create / Edit Modal */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={selectedCategory}
        allCategories={categories}
        onSuccess={fetchCategories}
      />

      {/* Delete Confirmation Modal */}
      {catToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 shadow-2xl border border-red-500/20 animate-in fade-in zoom-in-95 duration-150">
            <h3 className="mb-2 text-base font-black text-white flex items-center gap-2">
              <AlertCircle size={18} className="text-red-400" />
              Delete Category Confirmation
            </h3>
            <p className="mb-4 text-xs text-muted leading-relaxed">
              Are you sure you want to delete category{' '}
              <span className="font-bold text-white">"{catToDelete.name}"</span>?
              <br />
              <span className="text-[11px] text-amber-400/90 block mt-1">
                Note: Categories with existing posts or subcategories cannot be deleted until those dependencies are removed or reassigned.
              </span>
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCatToDelete(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-muted hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-500 disabled:opacity-50 transition-all"
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
