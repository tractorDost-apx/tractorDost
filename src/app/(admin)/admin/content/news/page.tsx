'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Newspaper,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  Eye,
  Calendar,
  X,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { cmsAPI, ContentPost } from '@/lib/api/cms';
import { TractorLoader } from '@/components/ui/TractorLoader';
import { toast } from '@/components/ui/toast';

export default function AdminNewsListPage() {
  const [news, setNews] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<ContentPost | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [contentRichtext, setContentRichtext] = useState('');
  const [isTrending, setIsTrending] = useState(false);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadNews = async () => {
    try {
      setLoading(true);
      const res = await cmsAPI.getPosts({ postType: 'NEWS', limit: 50 });
      if (res.data) {
        setNews(res.data);
      }
    } catch (err) {
      console.error('Failed to load news articles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, []);

  const openCreateModal = () => {
    setEditingNews(null);
    setTitle('');
    setSlug('');
    setFeaturedImage('');
    setExcerpt('');
    setContentRichtext('');
    setIsTrending(false);
    setStatus('PUBLISHED');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveNews = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        postType: 'NEWS' as const,
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        featuredImage: featuredImage || null,
        excerpt: excerpt || null,
        contentRichtext: contentRichtext || null,
        isTrending,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : null,
      };

      if (editingNews) {
        await cmsAPI.updatePost(editingNews.id, payload);
        toast.success('News article updated successfully');
      } else {
        await cmsAPI.createPost(payload);
        toast.success('News article created successfully');
      }

      setIsModalOpen(false);
      await loadNews();
    } catch (err: any) {
      console.error('Failed to save news article:', err);
      setFormError(err?.response?.data?.message || 'Failed to save news article.');
      toast.error(err?.response?.data?.message || 'Failed to save news article.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this news article?')) return;
    try {
      await cmsAPI.deletePost(id);
      toast.success('News article deleted successfully');
      await loadNews();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete news article.');
    }
  };

  const filteredNews = news.filter((n) =>
    n.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/admin/content" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft size={16} />
            </Link>
            <h1 className="text-2xl font-black text-foreground">Agricultural News Desk</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Publish government subsidy updates, tractor price revisions, and farming industry breaking news.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-black uppercase text-black hover:bg-lime-300 transition-all shadow-md"
        >
          <Plus size={16} /> Publish News
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative min-w-[280px]">
          <Search size={16} className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search news releases..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card/60 border-border/50 text-foreground w-full rounded-full border py-2.5 pl-9 pr-4 text-xs font-medium focus:border-lime-400 focus:outline-none"
          />
        </div>
        <div className="text-xs font-bold text-muted-foreground">
          Total News: <span className="text-foreground font-black">{news.length}</span>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <TractorLoader size={40} />
            <p className="text-muted-foreground mt-3 text-xs font-bold">Loading news items...</p>
          </div>
        ) : filteredNews.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No news articles found. Click "Publish News" to release your first agricultural announcement.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/40 text-muted-foreground uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3 font-bold">Headline</th>
                  <th className="pb-3 font-bold">Slug</th>
                  <th className="pb-3 font-bold">Trending</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Views</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredNews.map((n) => (
                  <tr key={n.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-foreground max-w-sm truncate">
                      {n.title}
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground font-mono text-[11px] max-w-xs truncate">
                      {n.slug}
                    </td>
                    <td className="py-3.5 pr-4">
                      {n.isTrending ? (
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-500">
                          Trending
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-[10px]">Standard</span>
                      )}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          n.status === 'PUBLISHED'
                            ? 'bg-lime-400/15 text-lime-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {n.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground">
                      {n.viewsCount || 0}
                    </td>
                    <td className="py-3.5 text-muted-foreground">
                      {new Date(n.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/content/news/${n.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-lime-400 hover:text-black transition-colors"
                          title="Full Editor"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(n.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete News"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-border/60 bg-card p-6 shadow-2xl">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
            </button>

            <h2 className="text-xl font-black text-foreground mb-4">
              {editingNews ? 'Edit News Article' : 'Publish Agricultural News'}
            </h2>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveNews} className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Headline *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Government Announces 50% Subsidy on Rotavators in Maharashtra"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Featured Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={featuredImage}
                  onChange={(e) => setFeaturedImage(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Summary / Excerpt
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief 1-2 sentence lead for ticker and push notifications..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  News Body (HTML / Text) *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="<p>Full news report details...</p>"
                  value={contentRichtext}
                  onChange={(e) => setContentRichtext(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-foreground">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="h-4 w-4 rounded accent-amber-500"
                    />
                    <span>Mark as Breaking / Trending</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <label className="text-xs text-muted-foreground font-bold">Status:</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as any)}
                      className="bg-secondary/30 border-border/50 rounded-lg px-2.5 py-1 text-xs font-bold"
                    >
                      <option value="PUBLISHED">Published</option>
                      <option value="DRAFT">Draft</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl border border-border/60 px-5 py-2 text-xs font-bold text-foreground hover:bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-lime-400 px-6 py-2 text-xs font-black uppercase text-black hover:bg-lime-300 disabled:opacity-70 shadow-md"
                  >
                    {submitting ? 'Publishing...' : 'Publish News'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
