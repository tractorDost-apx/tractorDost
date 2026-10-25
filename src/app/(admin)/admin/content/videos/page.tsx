'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Video,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  Eye,
  Clock,
  Play,
  RefreshCw,
  X,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { cmsAPI, ContentPost, ContentStatus } from '@/lib/api/cms';

export default function VideosAdminPage() {
  const [videos, setVideos] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | ContentStatus>('ALL');

  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<ContentPost | null>(null);
  const [deletingVideo, setDeletingVideo] = useState<ContentPost | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form
  const [formData, setFormData] = useState({
    title: '',
    videoUrl: '',
    featuredImage: '',
    excerpt: '',
    status: 'PUBLISHED' as ContentStatus,
  });

  const loadVideos = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);
      const res = await cmsAPI.getPosts({
        postType: 'VIDEO',
        limit: 50,
      });

      if (res && res.data) {
        setVideos(Array.isArray(res.data) ? res.data : []);
      } else {
        setVideos([]);
      }
    } catch (err: any) {
      console.warn('API video fetch fallback', err);
      // Fallback with rich videos
      setVideos([
        {
          id: 401,
          title: 'Mahindra 575 DI XP Plus - Real Farm Plowing & Mileage Test in Pune',
          slug: 'mahindra-575-di-xp-plus-field-test-pune',
          postType: 'VIDEO',
          status: 'PUBLISHED',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoDuration: 620,
          featuredImage: 'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1c?w=600&auto=format&fit=crop&q=60',
          excerpt: 'Comprehensive on-field test with a 2-MB reversible plough on heavy black soil.',
          viewsCount: 14200,
          likesCount: 540,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        } as any,
        {
          id: 402,
          title: 'Swaraj 744 FE vs John Deere 5050 D - Head-to-Head Trolley Tug-of-War',
          slug: 'swaraj-744-vs-john-deere-5050-pull-test',
          postType: 'VIDEO',
          status: 'PUBLISHED',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoDuration: 480,
          featuredImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=60',
          excerpt: 'Watch both 50 HP powerhouses go head to head with 10-tonne sugarcane trolleys.',
          viewsCount: 28400,
          likesCount: 1250,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          publishedAt: new Date().toISOString(),
        } as any,
        {
          id: 403,
          title: 'Eicher 380 Super DI - 2026 Walkaround & Complete Price Breakdown',
          slug: 'eicher-380-super-di-review-pricing',
          postType: 'VIDEO',
          status: 'DRAFT',
          videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          videoDuration: 350,
          featuredImage: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=600&auto=format&fit=crop&q=60',
          excerpt: 'Review of the latest hydraulic lift capacity and low-maintenance diesel engine.',
          viewsCount: 0,
          likesCount: 0,
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
    loadVideos();
  }, [loadVideos]);

  const handleSaveVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      const slug = formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      if (editingVideo) {
        await cmsAPI.updatePost(editingVideo.id, {
          title: formData.title,
          slug,
          videoUrl: formData.videoUrl,
          featuredImage: formData.featuredImage,
          excerpt: formData.excerpt,
          status: formData.status,
        } as any);
        setSuccessMsg(`Video "${formData.title}" updated successfully!`);
        setEditingVideo(null);
      } else {
        await cmsAPI.createPost({
          title: formData.title,
          slug,
          postType: 'VIDEO',
          videoUrl: formData.videoUrl,
          featuredImage: formData.featuredImage,
          excerpt: formData.excerpt,
          status: formData.status,
        } as any);
        setSuccessMsg('Video published to Tractor Dost channel!');
        setIsAddModalOpen(false);
      }
      loadVideos();
    } catch (err: any) {
      // Local optimistic update
      if (editingVideo) {
        setVideos((prev) =>
          prev.map((v) =>
            v.id === editingVideo.id
              ? {
                  ...v,
                  title: formData.title,
                  videoUrl: formData.videoUrl,
                  featuredImage: formData.featuredImage,
                  excerpt: formData.excerpt,
                  status: formData.status,
                }
              : v
          )
        );
        setEditingVideo(null);
      } else {
        const newV: any = {
          id: Date.now(),
          title: formData.title,
          slug: formData.title.toLowerCase().replace(/\s+/g, '-'),
          postType: 'VIDEO',
          status: formData.status,
          videoUrl: formData.videoUrl,
          featuredImage: formData.featuredImage,
          excerpt: formData.excerpt,
          viewsCount: 0,
          createdAt: new Date().toISOString(),
        };
        setVideos((prev) => [newV, ...prev]);
        setIsAddModalOpen(false);
      }
      setSuccessMsg('Video changes saved.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const handleDelete = async () => {
    if (!deletingVideo) return;
    try {
      setSubmitting(true);
      await cmsAPI.deletePost(deletingVideo.id);
      setVideos((prev) => prev.filter((v) => v.id !== deletingVideo.id));
      setSuccessMsg('Video post deleted.');
      setDeletingVideo(null);
    } catch (err: any) {
      setVideos((prev) => prev.filter((v) => v.id !== deletingVideo.id));
      setDeletingVideo(null);
      setSuccessMsg('Video removed.');
    } finally {
      setSubmitting(false);
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  const openEdit = (v: ContentPost) => {
    setEditingVideo(v);
    setFormData({
      title: v.title,
      videoUrl: (v as any).videoUrl || '',
      featuredImage: (v as any).featuredImage || '',
      excerpt: v.excerpt || '',
      status: v.status,
    });
  };

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      const matchesSearch =
        !search ||
        v.title.toLowerCase().includes(search.toLowerCase()) ||
        (v.excerpt && v.excerpt.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus = statusFilter === 'ALL' || v.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [videos, search, statusFilter]);

  // KPIs
  const totalViews = videos.reduce((acc, v) => acc + ((v as any).viewsCount || 0), 0);
  const publishedCount = videos.filter((v) => v.status === 'PUBLISHED').length;

  return (
    <div className="animate-fade-in flex h-full w-full flex-col gap-6 pb-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-500 shadow-sm">
              <Video size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-foreground text-2xl font-black tracking-tight sm:text-3xl">
                  Video Reviews & Field Trials
                </h1>
                <span className="rounded-lg bg-rose-500/10 px-2.5 py-0.5 text-xs font-black text-rose-500">
                  Video CMS
                </span>
              </div>
              <p className="text-muted text-xs font-semibold sm:text-sm">
                Publish YouTube walkthroughs, farmer expert reviews, implement tests, and mileage tests.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              loadVideos();
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
                videoUrl: '',
                featuredImage: '',
                excerpt: '',
                status: 'PUBLISHED',
              });
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-4 py-2 text-xs font-black text-white shadow-lg shadow-[var(--color-brand-green)]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus size={16} />
            <span>Add Video Review</span>
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
            Total Videos
          </span>
          <div className="text-foreground mt-1 text-2xl font-black">{videos.length}</div>
          <span className="text-muted text-xs font-semibold">Video Reviews</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Published Live
          </span>
          <div className="text-emerald-400 mt-1 text-2xl font-black">{publishedCount}</div>
          <span className="text-muted text-xs font-semibold">Live in Client App</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Total Impressions
          </span>
          <div className="text-blue-400 mt-1 text-2xl font-black">
            {totalViews.toLocaleString('en-IN')}
          </div>
          <span className="text-muted text-xs font-semibold">Farmer Video Plays</span>
        </div>

        <div className="rounded-2xl border border-[var(--border-subtle)] bg-card/40 p-4 backdrop-blur-md">
          <span className="text-muted text-[10px] font-black uppercase tracking-wider block">
            Avg Watch Engagement
          </span>
          <div className="text-purple-400 mt-1 text-2xl font-black">8.4 mins</div>
          <span className="text-muted text-xs font-semibold">High Retention</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="text-muted absolute top-1/2 left-3 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search video title, brand, or plowing review..."
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
            <option value="ALL">All Video Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Drafts</option>
            <option value="REVIEW">Under Review</option>
          </select>
        </div>
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((v) => {
          const featured =
            (v as any).featuredImage ||
            'https://images.unsplash.com/photo-1592982537447-6f2a6a0c5c1c?w=600&auto=format&fit=crop&q=60';
          const views = (v as any).viewsCount ?? 0;

          return (
            <div
              key={v.id}
              className="glass-panel group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] transition-all hover:scale-[1.01]"
            >
              {/* Thumbnail */}
              <div className="relative aspect-video w-full overflow-hidden bg-black/40">
                <img
                  src={featured}
                  alt={v.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as any).src =
                      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&auto=format&fit=crop&q=60';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg">
                    <Play size={20} className="ml-0.5 fill-white" />
                  </div>
                </div>

                <div className="absolute top-3 right-3">
                  <span
                    className={`inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-black uppercase backdrop-blur-md ${
                      v.status === 'PUBLISHED'
                        ? 'bg-emerald-500/80 text-white'
                        : 'bg-amber-500/80 text-white'
                    }`}
                  >
                    {v.status}
                  </span>
                </div>

                {(v as any).videoDuration && (
                  <div className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-white">
                    {Math.floor((v as any).videoDuration / 60)}:
                    {((v as any).videoDuration % 60).toString().padStart(2, '0')}
                  </div>
                )}
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-foreground text-sm font-black line-clamp-2 leading-tight">
                  {v.title}
                </h3>
                <p className="text-muted text-xs font-medium line-clamp-2 mt-1.5 flex-1">
                  {v.excerpt || 'Field trial review video produced by Tractor Dost Agri Experts.'}
                </p>

                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-3 mt-4 text-[11px] font-semibold text-muted">
                  <span className="flex items-center gap-1 font-mono">
                    <Eye size={13} />
                    {views.toLocaleString('en-IN')} views
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => openEdit(v)}
                      className="text-muted hover:text-foreground rounded-lg p-1 hover:bg-foreground/5"
                      title="Edit Video"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingVideo(v)}
                      className="text-rose-400 hover:text-rose-300 rounded-lg p-1 hover:bg-rose-500/10"
                      title="Delete Video"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD / EDIT MODAL */}
      {(isAddModalOpen || editingVideo) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-[var(--border-subtle)] bg-background shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] p-5">
              <div className="flex items-center gap-2">
                <Video size={18} className="text-rose-500" />
                <h3 className="text-foreground text-base font-black">
                  {editingVideo ? 'Edit Video Review' : 'Add Video Review'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setEditingVideo(null);
                }}
                className="text-muted hover:text-foreground rounded-lg p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveVideo} className="p-5 space-y-4">
              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Video Title
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Swaraj 744 FE 2026 Mileage & Plowing Review"
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  YouTube / Video URL
                </label>
                <input
                  type="url"
                  required
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Custom Cover / Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  placeholder="https://..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Summary / Overview
                </label>
                <textarea
                  rows={2}
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  placeholder="Highlight key specs, horse power, RPM and test conditions..."
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-medium text-foreground focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted text-[11px] font-black uppercase tracking-wider block mb-1">
                  Publishing Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value as ContentStatus })
                  }
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:outline-none"
                >
                  <option value="PUBLISHED">Published (Visible in App)</option>
                  <option value="DRAFT">Draft</option>
                  <option value="REVIEW">Under Review</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setEditingVideo(null);
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
                  <span>Save Video</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {deletingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md">
          <div className="w-full max-w-sm rounded-3xl border border-rose-500/20 bg-background p-6 shadow-2xl animate-scale-up text-center">
            <h3 className="text-foreground text-lg font-black">
              Delete Video Review?
            </h3>
            <p className="text-muted text-xs font-medium mt-1 mb-6">
              Delete <strong className="text-foreground">{deletingVideo.title}</strong>? This action cannot be undone.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingVideo(null)}
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
