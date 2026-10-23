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
  Clock,
  Globe,
  Tag,
  AlignLeft,
  Sparkles,
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
  DRAFT: {
    label: 'Draft',
    badgeClass: 'bg-foreground/10 text-muted border-[var(--border-subtle)]',
  },
  REVIEW: {
    label: 'In Review',
    badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
  },
  SCHEDULED: {
    label: 'Scheduled',
    badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
  },
  PUBLISHED: {
    label: 'Published',
    badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
  },
  ARCHIVED: {
    label: 'Archived',
    badgeClass: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
  },
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

  // Quick View Detail Modal
  const [detailPost, setDetailPost] = useState<ContentPost | null>(null);

  // Deletion modal state
  const [postToDelete, setPostToDelete] = useState<ContentPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Keyboard accessibility & body scroll locking for detail modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setDetailPost(null);
    };
    if (detailPost) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [detailPost]);

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
    <div className="animate-fade-in flex flex-1 h-full w-full flex-col gap-6 pb-2">
      {/* Top Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground flex items-center gap-2.5 text-2xl sm:text-3xl font-black tracking-tight">
            <FileText className="text-[var(--color-brand-green)]" size={26} />
            Blog & Content Posts
          </h1>
          <p className="text-muted mt-1 text-xs sm:text-sm font-semibold">
            Manage articles, tractor reviews, news, guides, and informative content.
          </p>
        </div>

        <Link
          href="/admin/cms/posts/new"
          className="spatial-button flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm whitespace-nowrap shadow-lg cursor-pointer"
        >
          <Plus size={16} />
          <span>Create New Post</span>
        </Link>
      </div>

      {/* Notifications */}
      {actionMsg && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-bold ${
            actionMsg.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              : 'border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMsg.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{actionMsg.text}</span>
          </div>
          <button onClick={() => setActionMsg(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Search and Filters Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 shadow-sm border border-[var(--border-subtle)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" size={16} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, summary or slug..."
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

          {/* Filter toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all cursor-pointer ${
                showFilters || hasActiveFilters
                  ? 'bg-[var(--color-brand-green)]/15 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/30'
                  : 'border border-[var(--border-subtle)] bg-foreground/[0.03] text-muted hover:text-foreground'
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
                className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3 py-2 text-xs font-semibold text-muted hover:text-foreground transition-all cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Collapsible Filter Options */}
        {showFilters && (
          <div className="grid grid-cols-1 gap-3 border-t border-[var(--border-subtle)] pt-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-[11px] font-black text-muted uppercase tracking-wider">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value as ContentStatus | '');
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer transition-colors"
              >
                <option value="" className="bg-background text-foreground">All Statuses</option>
                <option value="DRAFT" className="bg-background text-foreground">Draft</option>
                <option value="REVIEW" className="bg-background text-foreground">In Review</option>
                <option value="SCHEDULED" className="bg-background text-foreground">Scheduled</option>
                <option value="PUBLISHED" className="bg-background text-foreground">Published</option>
                <option value="ARCHIVED" className="bg-background text-foreground">Archived</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-black text-muted uppercase tracking-wider">
                Post Type
              </label>
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value as ContentType | '');
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer transition-colors"
              >
                <option value="" className="bg-background text-foreground">All Content Types</option>
                <option value="BLOG" className="bg-background text-foreground">Blog</option>
                <option value="NEWS" className="bg-background text-foreground">News</option>
                <option value="BUYING_GUIDE" className="bg-background text-foreground">Buying Guide</option>
                <option value="COMPARISON" className="bg-background text-foreground">Comparison</option>
                <option value="VIDEO" className="bg-background text-foreground">Video</option>
                <option value="WEB_STORY" className="bg-background text-foreground">Web Story</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-black text-muted uppercase tracking-wider">
                Category
              </label>
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value === '' ? '' : Number(e.target.value));
                  setPage(1);
                }}
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none cursor-pointer transition-colors"
              >
                <option value="" className="bg-background text-foreground">All Categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id} className="bg-background text-foreground">
                    {c.name} ({c.postType})
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Post Table Container */}
      <div className="glass-panel flex flex-1 flex-col overflow-hidden rounded-2xl shadow-sm border border-[var(--border-subtle)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[var(--border-subtle)] bg-foreground/5 text-[11px] font-black uppercase tracking-wider text-muted">
              <tr>
                <th className="py-4 px-6">Title & Slug</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Type</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)] font-medium">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted font-bold">
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
                    <p className="text-sm font-bold text-foreground">No posts found</p>
                    <p className="mt-1 text-xs">
                      {hasActiveFilters ? 'Try adjusting your filters.' : 'Get started by creating your first post.'}
                    </p>
                    {!hasActiveFilters && (
                      <Link
                        href="/admin/cms/posts/new"
                        className="spatial-button mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2 text-xs font-bold shadow-md cursor-pointer"
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
                    badgeClass: 'bg-foreground/10 text-muted border-[var(--border-subtle)]',
                  };

                  return (
                    <tr
                      key={post.id}
                      onClick={() => setDetailPost(post)}
                      className="hover:bg-[var(--color-brand-green)]/[0.04] group cursor-pointer transition-colors"
                    >
                      {/* Title & Slug */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {post.featuredImage ? (
                            <img
                              src={post.featuredImage}
                              alt={post.title}
                              className="h-10 w-12 rounded-lg object-cover border border-[var(--border-subtle)] shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="flex h-10 w-12 items-center justify-center rounded-lg bg-foreground/5 border border-[var(--border-subtle)] text-muted shrink-0">
                              <FileText size={18} />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-foreground text-sm truncate max-w-[280px] sm:max-w-[340px]">
                                {post.title}
                              </span>
                              {post.isTrending && (
                                <span title="Trending Post">
                                  <TrendingUp size={13} className="text-amber-500 shrink-0" />
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[11px] text-muted truncate max-w-[280px] mt-0.5">
                              /{post.slug}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-6">
                        {post.category ? (
                          <span className="rounded-md bg-foreground/5 border border-[var(--border-subtle)] px-2 py-0.5 text-[11px] font-bold text-foreground">
                            {post.category.name}
                          </span>
                        ) : (
                          <span className="text-muted italic text-[11px]">Uncategorized</span>
                        )}
                      </td>

                      {/* Post Type */}
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center rounded-lg bg-[var(--color-brand-green)]/10 px-2.5 py-1 text-[10px] font-black tracking-wider text-[var(--color-brand-green)] uppercase">
                          {post.postType?.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusInfo.badgeClass}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-6 text-muted text-xs whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground/90">
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
                          <span className="text-[10px] opacity-70">
                            {post.publishedAt ? 'Published' : 'Created'}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDetailPost(post);
                            }}
                            title="Quick View Post Profile"
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-green)]/10 hover:text-[var(--color-brand-green)] cursor-pointer"
                          >
                            <Eye size={16} />
                          </button>
                          <Link
                            href={`/admin/cms/posts/${post.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            title="Edit Post"
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-[var(--color-brand-orange)]/10 hover:text-[var(--color-brand-orange)] cursor-pointer"
                          >
                            <Edit2 size={16} />
                          </Link>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPostToDelete(post);
                            }}
                            title="Delete Post"
                            className="text-foreground/70 rounded-xl p-2 transition-colors hover:bg-red-500/10 hover:text-red-500 cursor-pointer"
                          >
                            <Trash2 size={16} />
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

      {/* Quick View Post Detail Modal */}
      {detailPost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-6 backdrop-blur-md animate-fade-in">
          <div
            className="fixed inset-0 -z-10"
            onClick={() => setDetailPost(null)}
          />

          <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] bg-foreground/[0.02] p-5 sm:p-6">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] shadow-sm">
                  <FileText size={24} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-foreground text-lg sm:text-xl font-black truncate">
                      {detailPost.title}
                    </h2>
                    {detailPost.isTrending && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-black text-amber-600 dark:text-amber-400">
                        <TrendingUp size={11} /> Trending
                      </span>
                    )}
                  </div>
                  <p className="text-muted text-xs font-bold truncate mt-0.5 font-mono">
                    /{detailPost.slug}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setDetailPost(null)}
                className="hover:bg-foreground/5 text-muted hover:text-foreground shrink-0 rounded-full p-2 transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              {/* Featured Image Banner if available */}
              {detailPost.featuredImage && (
                <div className="overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] shadow-sm">
                  <img
                    src={detailPost.featuredImage}
                    alt={detailPost.title}
                    className="h-48 w-full object-cover"
                  />
                </div>
              )}

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Status
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    {detailPost.status}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Type
                  </span>
                  <div className="text-[var(--color-brand-green)] text-base font-black mt-1">
                    {detailPost.postType?.replace('_', ' ')}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Language
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    {detailPost.language || 'EN'}
                  </div>
                </div>

                <div className="rounded-2xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-4">
                  <span className="text-muted block text-[10px] font-black tracking-wider uppercase">
                    Read Time
                  </span>
                  <div className="text-foreground text-base font-black mt-1">
                    {detailPost.readTimeMinutes ? `${detailPost.readTimeMinutes} min` : '3 min'}
                  </div>
                </div>
              </div>

              {/* Excerpt Section */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-5 shadow-sm space-y-2">
                <div className="flex items-center gap-2 text-[var(--color-brand-green)]">
                  <AlignLeft size={16} />
                  <h3 className="text-xs font-black tracking-wider uppercase">
                    Excerpt / Overview
                  </h3>
                </div>
                <p className="text-foreground/80 text-xs sm:text-sm font-medium leading-relaxed">
                  {detailPost.excerpt || 'No short summary provided for this article.'}
                </p>
              </div>

              {/* Category & Routing Details */}
              <div className="rounded-2xl border border-[var(--border-subtle)] bg-background p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 text-[var(--color-brand-orange)] border-b border-[var(--border-subtle)] pb-2.5">
                  <Tag size={16} />
                  <h3 className="text-xs font-black tracking-wider uppercase">
                    Taxonomy & Publishing Meta
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3.5">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      Category
                    </span>
                    <span className="text-foreground text-xs sm:text-sm font-bold mt-1 block">
                      {detailPost.category ? detailPost.category.name : 'Unassigned'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3.5">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      Published Date
                    </span>
                    <span className="text-foreground text-xs sm:text-sm font-bold mt-1 block">
                      {detailPost.publishedAt
                        ? new Date(detailPost.publishedAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Draft (Not Published Yet)'}
                    </span>
                  </div>

                  <div className="col-span-1 sm:col-span-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-3.5">
                    <span className="text-muted text-[10px] font-black tracking-wider uppercase block">
                      Public Web Link
                    </span>
                    <a
                      href={`/articles/${detailPost.slug}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[var(--color-brand-green)] hover:underline text-xs sm:text-sm font-mono font-bold mt-1 inline-flex items-center gap-1.5"
                    >
                      /articles/{detailPost.slug}
                      <ExternalLink size={12} />
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[var(--border-subtle)] bg-foreground/[0.02] p-4 sm:p-6">
              <button
                type="button"
                onClick={() => setDetailPost(null)}
                className="hover:bg-foreground/5 text-foreground rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold transition-colors cursor-pointer"
              >
                Close Window
              </button>

              <Link
                href={`/admin/cms/posts/${detailPost.id}/edit`}
                className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black tracking-wider text-white uppercase shadow-[var(--color-brand-green)]/20 shadow-lg transition-colors hover:bg-[var(--color-brand-orange)] cursor-pointer"
              >
                <Edit2 size={14} /> Edit Full Article
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md rounded-3xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl animate-scale-up">
            <h3 className="mb-2 text-base font-black text-foreground flex items-center gap-2">
              <AlertCircle size={18} className="text-red-500" />
              Delete Post Confirmation
            </h3>
            <p className="mb-4 text-xs text-muted leading-relaxed">
              Are you sure you want to permanently delete post{' '}
              <span className="font-bold text-foreground">"{postToDelete.title}"</span>?
              <br />
              <span className="text-[11px] text-red-500 block mt-1 font-semibold">
                This action is permanent and will remove the article and its SEO URLs immediately.
              </span>
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPostToDelete(null)}
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
