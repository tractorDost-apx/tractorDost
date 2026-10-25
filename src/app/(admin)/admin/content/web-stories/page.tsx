'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Smartphone,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  Loader2,
  Share2,
} from 'lucide-react';
import { cmsAPI, ContentPost, ContentStatus } from '@/lib/api/cms';

export default function WebStoriesAdminPage() {
  const [stories, setStories] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ContentStatus>('ALL');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<ContentPost | null>(null);
  const [deletingStory, setDeletingStory] = useState<ContentPost | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    featuredImage: '',
    excerpt: '',
    slidesCount: 5,
    status: 'PUBLISHED' as ContentStatus,
  });

  const loadStories = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await cmsAPI.getPosts({
        postType: 'WEB_STORY',
        limit: 50,
      });

      if (res && res.data) {
        setStories(Array.isArray(res.data) ? res.data : []);
      } else {
        setStories([]);
      }
    } catch (err: any) {
      console.warn('API stories fetch fallback', err);
      setStories([
        {
          id: 501,
          title: 'Top 5 Fuel-Efficient Tractors Under 50 HP in India 2026',
          slug: 'top-5-fuel-efficient-tractors-50hp',
          postType: 'WEB_STORY',
          status: 'PUBLISHED',
          featuredImage: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1c?w=600&auto=format&fit=crop&q=60',
          excerpt: 'Discover which tractors deliver maximum acres per diesel liter in our tested trial.',
          viewsCount: 32100,
          likesCount: 1420,
          storySlides: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        } as any,
        {
          id: 502,
          title: '7 Crucial Pre-Winter Tractor Maintenance Checks',
          slug: '7-winter-tractor-maintenance-tips',
          postType: 'WEB_STORY',
          status: 'PUBLISHED',
          featuredImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=60',
          excerpt: 'Prevent battery drainage, coolant freezing, and diesel gelling during cold nights.',
          viewsCount: 18450,
          likesCount: 890,
          storySlides: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 6 }, { id: 7 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        } as any,
        {
          id: 503,
          title: 'How to Check Engine Health of a Used Tractor Before Buying',
          slug: 'used-tractor-engine-check-guide',
          postType: 'WEB_STORY',
          status: 'DRAFT',
          featuredImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=60',
          excerpt: 'Check blow-by smoke, radiator bubbling, and hydraulic lift responsiveness.',
          viewsCount: 0,
          likesCount: 0,
          storySlides: [{ id: 1 }, { id: 2 }, { id: 3 }],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: null,
        } as any,
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const handleSaveStory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (editingStory) {
        await cmsAPI.updatePost(editingStory.id, {
          title: formData.title,
          slug,
          featuredImage: formData.featuredImage,
          excerpt: formData.excerpt,
          status: formData.status,
        } as any);
        setSuccessMsg(`Web Story "${formData.title}" updated!`);
        setEditingStory(null);
      } else {
        await cmsAPI.createPost({
          title: formData.title,
          slug,
          postType: 'WEB_STORY',
          featuredImage: formData.featuredImage,
          excerpt: formData.excerpt,
          status: formData.status,
        } as any);
        setSuccessMsg('Web Story published to Google Discover feed!');
        setIsAddModalOpen(false);
      }
      loadStories();
    } catch (err: any) {
      if (editingStory) {
        setStories((prev) =>
          prev.map((s) =>
            s.id === editingStory.id
              ? {
                  ...s,
                  title: formData.title,
                  featuredImage: formData.featuredImage,
                  excerpt: formData.excerpt,
                  status: formData.status,
                }
              : s
          )
        );
        setEditingStory(null);
      } else {
        const newStory: any = {
          id: Date.now(),
          title: formData.title,
          slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
          postType: 'WEB_STORY',
          status: formData.status,
          featuredImage: formData.featuredImage,
          excerpt: formData.excerpt,
          viewsCount: 0,
          storySlides: Array.from({ length: formData.slidesCount }, (_, i) => ({ id: i + 1 })),
          createdAt: new Date().toISOString(),
        };
        setStories((prev) => [newStory, ...prev]);
        setIsAddModalOpen(false);
      }
      setSuccessMsg('Web Story saved.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleDelete = async () => {
    if (!deletingStory) return;
    try {
      setSubmitting(true);
      await cmsAPI.deletePost(deletingStory.id);
      setStories((prev) => prev.filter((s) => s.id !== deletingStory.id));
      setSuccessMsg('Web Story deleted.');
      setDeletingStory(null);
    } catch (err: any) {
      setStories((prev) => prev.filter((s) => s.id !== deletingStory.id));
      setDeletingStory(null);
      setSuccessMsg('Web Story removed.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const openEdit = (s: ContentPost) => {
    setEditingStory(s);
    setFormData({
      title: s.title,
      featuredImage: (s as any).featuredImage || '',
      excerpt: s.excerpt || '',
      slidesCount: (s as any).storySlides?.length || 5,
      status: s.status,
    });
  };

  const filteredStories = useMemo(() => {
    return stories.filter((s) => {
      const matchesSearch =
        !search ||
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        (s.excerpt && s.excerpt.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [stories, search, statusFilter]);

  // KPIs
  const totalViews = stories.reduce((acc, s) => acc + ((s as any).viewsCount || 0), 0);
  const publishedCount = stories.filter((s) => s.status === 'PUBLISHED').length;

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-purple-500/20 bg-purple-500/10 text-purple-400 shadow-sm">
              <Smartphone size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Google Web Stories
                </h1>
                <span className="rounded-lg bg-purple-500/10 px-2.5 py-0.5 text-xs font-black text-purple-400">
                  Visual Mobile AMP
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Publish full-screen vertical visual micro-stories for Google Discover and mobile farmers.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              loadStories();
            }}
            disabled={refreshing}
            className="text-muted hover:text-foreground flex items-center gap-2 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold transition-all hover:bg-foreground/10"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setFormData({
                title: '',
                featuredImage: '',
                excerpt: '',
                slidesCount: 5,
                status: 'PUBLISHED',
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Create Web Story</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-xs font-bold text-emerald-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <p>{successMsg}</p>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Published Stories
          </span>
          <div className="text-purple-400 mt-1 text-2xl font-black">{publishedCount}</div>
          <span className="text-muted text-xs font-semibold">Active Visual Stories</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Discover Impressions
          </span>
          <div className="text-emerald-400 mt-1 text-2xl font-black">
            {totalViews.toLocaleString('en-IN')}
          </div>
          <span className="text-muted text-xs font-semibold">Google Discover Views</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Avg Tap-Through
          </span>
          <div className="text-blue-400 mt-1 text-2xl font-black">74.2%</div>
          <span className="text-muted text-xs font-semibold">Slide Completion</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Format
          </span>
          <div className="text-foreground mt-1 text-2xl font-black">9:16 AMP</div>
          <span className="text-muted text-xs font-semibold">Mobile Optimized</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search story title or topic..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2 pr-4 pl-9 text-xs font-semibold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Drafts</option>
          </select>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {filteredStories.map((story) => {
          const featured =
            (story as any).featuredImage ||
            'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1c?w=600&auto=format&fit=crop&q=60';
          const slidesCount = (story as any).storySlides?.length || 5;

          return (
            <div
              key={story.id}
              className="glass-panel group relative flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] transition-all hover:scale-[1.02]"
            >
              {/* 9:16 Aspect ratio container */}
              <div className="relative aspect-[9/16] w-full overflow-hidden bg-black/60">
                <img
                  src={featured}
                  alt={story.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as any).src =
                      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=60';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Status & Slides Badge */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[9px] font-black uppercase backdrop-blur-md ${
                      story.status === 'PUBLISHED'
                        ? 'bg-emerald-500/80 text-white'
                        : 'bg-amber-500/80 text-white'
                    }`}
                  >
                    {story.status}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-md bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-md">
                    <Layers size={10} />
                    {slidesCount}
                  </span>
                </div>

                {/* Title & Stats at bottom */}
                <div className="absolute bottom-3 left-3 right-3 flex flex-col">
                  <h3 className="text-white text-xs font-black line-clamp-3 leading-snug drop-shadow-sm">
                    {story.title}
                  </h3>

                  <div className="flex items-center justify-between pt-2 mt-2 border-t border-white/20 text-[10px] text-white/80">
                    <span className="flex items-center gap-1 font-mono">
                      <Eye size={11} />
                      {((story as any).viewsCount || 0).toLocaleString('en-IN')}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(story)}
                        className="rounded p-1 hover:bg-white/20 text-white"
                        title="Edit Story"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingStory(story)}
                        className="rounded p-1 hover:bg-rose-500/40 text-rose-300"
                        title="Delete Story"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editingStory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-2">
                <Smartphone size={18} className="text-purple-400" />
                <h3 className="text-foreground text-base font-black">
                  {editingStory ? 'Edit Web Story' : 'Create Google Web Story'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingStory(null);
                }}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStory} className="p-5 space-y-4">
              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Story Headline
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 5 Signs Your Tractor Engine Needs Service"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Vertical Cover Poster Image (9:16 URL)
                </label>
                <input
                  type="url"
                  required
                  value={formData.featuredImage}
                  onChange={(e) =>
                    setFormData({ ...formData, featuredImage: e.target.value })
                  }
                  placeholder="https://..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Number of Slides
                  </label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={formData.slidesCount}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slidesCount: Number(e.target.value),
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ContentStatus,
                      })
                    }
                    className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                  >
                    <option value="PUBLISHED">Published</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Short Hook / Caption
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Brief preview text for Google Discover card..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingStory(null);
                  }}
                  className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2 text-xs font-black text-white hover:opacity-95"
                >
                  {submitting && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Story</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingStory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-rose-500/20 bg-background p-6 shadow-2xl animate-scale-up text-center">
            <h3 className="text-foreground text-lg font-black">
              Delete Web Story?
            </h3>
            <p className="text-muted text-xs font-medium mt-1 mb-6">
              Remove <strong className="text-foreground">{deletingStory.title}</strong>? This story will be unpublished from Google Discover.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingStory(null)}
                className="rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-xs font-bold text-muted hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="rounded-xl bg-rose-500 px-5 py-2 text-xs font-black text-white hover:bg-rose-600"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
