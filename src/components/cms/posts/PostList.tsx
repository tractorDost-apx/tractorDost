'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Eye,
  Filter,
  X,
  TrendingUp,
  FileText,
  Calendar,
  AlertCircle,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react';
import {
  cmsAPI,
  ContentPost,
  ContentCategory,
  ContentStatus,
  ContentType,
} from '@/lib/api/cms';
import Pagination from '@/components/shared/Pagination';

const STATUS_CONFIG: Record<ContentStatus, { label: string; badgeClass: string }> = {
  DRAFT: { label: 'Draft', badgeClass: 'bg-zinc-500/15 text-zinc-300 border-zinc-500/30' },
  REVIEW: { label: 'In Review', badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  SCHEDULED: { label: 'Scheduled', badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30' },
  PUBLISHED: { label: 'Published', badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  ARCHIVED: { label: 'Archived', badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30' },
};

export default function PostList() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ContentStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<ContentType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<number | ''>('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Deletion modal state
  const [postToDelete, setPostToDelete] = useState<ContentPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load categories for filter dropdown
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await cmsAPI.getCategories({ limit: 100, isActive: true });
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsAPI.getPosts({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter || undefined,
        postType: typeFilter || undefined,
        categoryId: categoryFilter === '' ? undefined : Number(categoryFilter),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (res.success && Array.isArray(res.data)) {
        setPosts(res.data);
        if (res.meta) {
          setTotalCount(res.meta.total);
          setTotalPages(res.meta.totalPages);
        }
      }
    } catch (err) {
      console.error('Failed to fetch posts', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter, typeFilter, categoryFilter]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async () => {
    if (!postToDelete) return;
    setIsDeleting(true);
    setActionMsg(null);

    try {
      const res = await cmsAPI.deletePost(postToDelete.id);
      if (res.success) {
        setActionMsg({ text: `Post "${postToDelete.title}" deleted successfully.`, type: 'success' });
        setPostToDelete(null);
        fetchPosts();
      }
    } catch (err: any) {
      console.error('Failed to delete post', err);
      const msg = err?.response?.data?.message || 'Failed to delete post.';
      setActionMsg({ text: msg, type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setStatusFilter('');
    setTypeFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  const hasActiveFilters = Boolean(statusFilter || typeFilter || categoryFilter || debouncedSearch);

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <FileText className="text-[var(--color-brand-green)]" size={24} />
            Blog & Content Posts
          </h1>
          <p className="text-xs text-muted">
            Manage articles, tractor reviews, news, guides, and informative content.
          </p>
        </div>

        <Link
          href="/admin/cms/posts/new"
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-[var(--color-brand-green)]/20 hover:opacity-90 transition-all self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Create New Post</span>
        </Link>
      </div>

      {/* Notifications */}
      {actionMsg && (
        <div
          className={`flex items-center justify-between rounded-xl border p-4 text-xs font-semibold ${
            actionMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{actionMsg.text}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title or excerpt..."
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

          {/* Filter toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                showFilters || hasActiveFilters
                  ? 'bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/40'
                  : 'bg-white/5 text-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              <Filter size={14} />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="flex h-2 w-2 rounded-full bg-[var(--color-brand-green)]" />
              )}
            </button>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-muted hover:bg-white/5 hover:text-white transition-all"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-3 border-t border-white/10 pt-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-bold text-muted uppercase">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ContentStatus | '');
                  setPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[var(--color-brand-green)] focus:outline-none"
              >
                <option value="" className="bg-zinc-900">All Statuses</option>
                <option value="DRAFT" className="bg-zinc-900">Draft</option>
                <option value="REVIEW" className="bg-zinc-900">In Review</option>
                <option value="SCHEDULED" className="bg-zinc-900">Scheduled</option>
                <option value="PUBLISHED" className="bg-zinc-900">Published</option>
                <option value="ARCHIVED" className="bg-zinc-900">Archived</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-muted uppercase">Post Type</label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as ContentType | '');
                  setPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[var(--color-brand-green)] focus:outline-none"
              >
                <option value="" className="bg-zinc-900">All Content Types</option>
                <option value="BLOG" className="bg-zinc-900">Blog</option>
                <option value="NEWS" className="bg-zinc-900">News</option>
                <option value="BUYING_GUIDE" className="bg-zinc-900">Buying Guide</option>
                <option value="COMPARISON" className="bg-zinc-900">Comparison</option>
                <option value="VIDEO" className="bg-zinc-900">Video</option>
                <option value="WEB_STORY" className="bg-zinc-900">Web Story</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold text-muted uppercase">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value === '' ? '' : Number(e.target.value));
                  setPage(1);
                }}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs text-white focus:border-[var(--color-brand-green)] focus:outline-none"
              >
                <option value="" className="bg-zinc-900">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-zinc-900">
                    {c.name} ({c.postType})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Post Table Container */}
      <div className="glass-panel flex flex-col overflow-hidden rounded-2xl shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="py-3.5 px-4">Title & Slug</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-[var(--color-brand-green)] border-t-transparent" />
                      <span>Loading posts...</span>
                    </div>
                  </td>
                </tr>
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-muted">
                    <FileText size={36} className="mx-auto mb-2 opacity-30 text-[var(--color-brand-green)]" />
                    <p className="text-sm font-bold text-white">No posts found</p>
                    <p className="mt-1 text-xs">
                      {hasActiveFilters ? 'Try adjusting your filters.' : 'Get started by creating your first post.'}
                    </p>
                    {!hasActiveFilters && (
                      <Link
                        href="/admin/cms/posts/new"
                        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-bold text-white shadow-md hover:opacity-90"
                      >
                        <Plus size={14} />
                        <span>Create Post</span>
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                posts.map((post) => {
                  const statusInfo = STATUS_CONFIG[post.status] || {
                    label: post.status,
                    badgeClass: 'bg-zinc-500/20 text-zinc-300',
                  };

                  return (
                    <tr
                      key={post.id}
                      className="transition-colors hover:bg-white/[0.02]"
                    >
                      {/* Title & Slug */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {post.featuredImage ? (
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="h-10 w-12 rounded-lg object-cover border border-white/10 shrink-0"
                            />
                          ) : (
                            <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-white/5 border border-white/5 text-muted shrink-0">
                              <FileText size={18} />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white truncate max-w-[280px] sm:max-w-[340px]">
                                {post.title}
                              </span>
                              {post.isTrending && (
                                <span title="Trending Post">
                                  <TrendingUp size={13} className="text-amber-400 shrink-0" />
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-muted truncate max-w-[280px]">
                              /{post.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4 text-white/80">
                        {post.category ? (
                          <span className="rounded-md bg-white/5 px-2 py-0.5 text-[11px] font-semibold text-white/90">
                            {post.category.name}
                          </span>
                        ) : (
                          <span className="text-muted italic text-[11px]">Uncategorized</span>
                        )}
                      </td>

                      {/* Post Type */}
                      <td className="py-3.5 px-4">
                        <span className="rounded-md bg-white/5 px-2 py-0.5 text-[10px] font-bold text-[var(--color-brand-green)] uppercase">
                          {post.postType}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-muted text-[11px] whitespace-nowrap">
                        <div className="flex flex-col">
                          <span>
                            {post.publishedAt
                              ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })
                              : new Date(post.createdAt).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric',
                                })}
                          </span>
                          <span className="text-[10px] opacity-60">
                            {post.publishedAt ? 'Published' : 'Created'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/cms/posts/${post.id}/edit`}
                            title="Edit Post"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-white/10 hover:text-[var(--color-brand-green)] transition-all"
                          >
                            <Edit2 size={14} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setPostToDelete(post)}
                            title="Delete Post"
                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-muted hover:bg-red-500/10 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-150 dark:bg-black/75">
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150 dark:border-red-500/20 dark:bg-[#121814]">
            <h3 className="mb-2 text-base font-black text-zinc-900 flex items-center gap-2 dark:text-white">
              <AlertCircle size={18} className="text-red-500 dark:text-red-400" />
              Delete Post Confirmation
            </h3>
            <p className="mb-4 text-xs text-zinc-600 leading-relaxed dark:text-zinc-400">
              Are you sure you want to permanently delete{' '}
              <span className="font-bold text-zinc-900 dark:text-white">"{postToDelete.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPostToDelete(null)}
                className="rounded-xl border border-zinc-200 bg-zinc-100 px-4 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-200 hover:text-zinc-900 transition-all disabled:opacity-50 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10 dark:hover:text-white"
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
