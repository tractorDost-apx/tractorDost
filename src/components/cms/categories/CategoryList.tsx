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
  Eye,
  Layers,
  Hash,
  Tag,
  AlignLeft,
  Info,
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
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ContentCategory | null>(null);

  // Detail Profile Modal
  const [detailCategory, setDetailCategory] = useState<ContentCategory | null>(null);

  // Delete modal
  const [catToDelete, setCatToDelete] = useState<ContentCategory | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [alertMsg, setAlertMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Keyboard accessibility & body scroll locking for detail modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailCategory(null);
    };
    if (detailCategory) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [detailCategory]);

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
    <div className="animate-fade-in flex flex-1 h-full w-full flex-col gap-6 pb-2">
      {/* Header section */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-2.5 text-2xl sm:text-3xl font-black tracking-tight">
            <FolderTree className="text-[var(--color-brand-green)]" size={26} />
            Content Categories
          </h1>
          <p className="text-muted mt-1 text-xs sm:text-sm font-semibold">
            Organize articles, news, buying guides, and stories into structured hierarchies.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedCategory(null);
            setIsModalOpen(true);
          }}
          className="spatial-button flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap shadow-lg cursor-pointer"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Alert Banner */}
      {alertMsg && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-bold ${
            alertMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {alertMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{alertMsg.text}</span>
          </div>
          <button onClick={() => setAlertMsg(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 shadow-sm border border-[var(--border-subtle)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category name or slug..."
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] pl-10 pr-4 py-2 text-xs font-bold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-foreground cursor-pointer"
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
              className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer transition-colors"
            >
              <option value="" className="bg-background text-foreground">All Post Types</option>
              <option value="BLOG" className="bg-background text-foreground">Blog</option>
              <option value="NEWS" className="bg-background text-foreground">News</option>
              <option value="BUYING_GUIDE" className="bg-background text-foreground">Buying Guide</option>
              <option value="COMPARISON" className="bg-background text-foreground">Comparison</option>
              <option value="VIDEO" className="bg-background text-foreground">Video</option>
              <option value="WEB_STORY" className="bg-background text-foreground">Web Story</option>
            </select>
          </div>
        </div>
      </div>

      {/* Categories Table Container */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl shadow-sm border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="py-4 px-6">Category Name</th>
                <th className="py-4 px-6">Slug</th>
                <th className="py-4 px-6">Post Type</th>
                <th className="py-4 px-6">Order</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted font-bold">
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
                    <p className="text-sm font-bold text-foreground">No categories found</p>
                    <p className="mt-1 text-xs">Create your first category to group your content.</p>
                  </td>
                </tr>
              ) : (
                categories.map((cat) => (
                  <tr
                    key={cat.id}
                    onClick={() => setDetailCategory(cat)}
                    className="hover:bg-[var(--color-brand-green)]/[0.04] group cursor-pointer transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{cat.name}</span>
                        {cat.parentId && (
                          <span className="rounded-md bg-foreground/10 px-1.5 py-0.5 text-[9px] font-black tracking-wider uppercase text-muted">
                            sub
                          </span>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-xs text-muted/80 line-clamp-1 mt-0.5">{cat.description}</p>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-muted/90">
                      {cat.slug}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center rounded-lg bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                        {cat.postType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-4 px-6 font-bold text-foreground">
                      #{cat.sortOrder ?? 0}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-black tracking-widest uppercase ${
                          cat.isActive
                            ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                            : 'bg-red-500/10 text-red-500'
                        }`}
                      >
                        {cat.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDetailCategory(cat);
                          }}
                          title="View Category Profile"
                          className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)] cursor-pointer"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(cat);
                            setIsModalOpen(true);
                          }}
                          title="Edit Category"
                          className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)] cursor-pointer"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCatToDelete(cat);
                          }}
                          title="Delete Category"
                          className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                        >
                          <Trash2 size={16} />
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

      {/* Content Category Detail Profile Modal */}
      {detailCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setDetailCategory(null)}
          />

          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/[0.02] p-5 sm:p-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-sm">
                  <FolderTree size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-foreground text-lg sm:text-xl font-black truncate">
                      {detailCategory.name}
                    </h2>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-black tracking-widest uppercase ${
                        detailCategory.isActive
                          ? 'bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]'
                          : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {detailCategory.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="inline-flex items-center rounded-lg bg-[var(--color-brand-green)]/10 px-2 py-0.5 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                      {detailCategory.postType?.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-muted text-xs font-bold truncate mt-0.5">
                    Slug: <span className="text-foreground/80 font-mono">{detailCategory.slug}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailCategory(null)}
                className="hover:bg-foreground/5 text-muted hover:text-foreground shrink-0 rounded-full p-2 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Quick Key Metrics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Post Type
                  </span>
                  <div className="text-[var(--color-brand-green)] text-base font-black mt-1">
                    {detailCategory.postType?.replace('_', ' ')}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Display Sort Order
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    #{detailCategory.sortOrder ?? 0}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Status
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    {detailCategory.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Database ID
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    #{detailCategory.id}
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[var(--color-brand-green)]">
                  <AlignLeft size={16} />
                  <h3 className="text-xs font-black tracking-wider uppercase">
                    Category Description
                  </h3>
                </div>
                <p className="text-foreground/80 text-xs sm:text-sm font-medium leading-relaxed">
                  {detailCategory.description || 'No detailed description provided for this category yet.'}
                </p>
              </div>

              {/* Hierarchy & Relations */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[var(--color-brand-orange)] border-b border-[var(--border-subtle)] pb-2.5">
                  <Info size={16} />
                  <h3 className="text-xs font-black tracking-wider uppercase">
                    Hierarchy & Routing
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3.5">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      Hierarchy Level
                    </span>
                    <span className="text-foreground text-xs sm:text-sm font-bold mt-1 block">
                      {detailCategory.parentId ? `Child Category (Parent ID: #${detailCategory.parentId})` : 'Root Category (Top Level)'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3.5">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      Associated Post Type
                    </span>
                    <span className="text-foreground text-xs sm:text-sm font-bold mt-1 block">
                      {detailCategory.postType}
                    </span>
                  </div>

                  <div className="col-span-1 sm:col-span-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3.5">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      Content URL Route
                    </span>
                    <span className="text-foreground text-xs sm:text-sm font-mono font-bold mt-1 block">
                      /articles/category/{detailCategory.slug}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-foreground/[0.02] p-4 sm:p-6">
              <button
                type="button"
                onClick={() => setDetailCategory(null)}
                className="hover:bg-foreground/5 text-foreground rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Window
              </button>

              <button
                type="button"
                onClick={() => {
                  const cat = detailCategory;
                  setDetailCategory(null);
                  setSelectedCategory(cat);
                  setIsModalOpen(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-colors hover:bg-[var(--color-brand-orange)] cursor-pointer"
              >
                <Edit2 size={14} /> Edit Category Master
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl animate-scale-up">
            <h3 className="mb-2 text-base font-black text-foreground flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              Delete Category Confirmation
            </h3>
            <p className="mb-4 text-xs text-muted leading-relaxed">
              Are you sure you want to delete category{' '}
              <span className="font-bold text-foreground">"{catToDelete.name}"</span>?
              <br />
              <span className="text-[11px] text-amber-600 dark:text-amber-400 block mt-1 font-semibold">
                Note: Categories with existing posts or subcategories cannot be deleted until those dependencies are removed or reassigned.
              </span>
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setCatToDelete(null)}
                className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-4 py-2 text-xs font-bold text-foreground hover:bg-foreground/10 transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                className="rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white shadow-md hover:bg-red-500 disabled:opacity-50 transition-all cursor-pointer"
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
