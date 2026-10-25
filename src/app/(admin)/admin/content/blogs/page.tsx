'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Plus,
  Trash2,
  Edit,
  Search,
  CheckCircle2,
  Eye,
  Calendar,
  X,
  ArrowLeft,
} from 'lucide-react';
import { cmsAPI, ContentPost } from '@/lib/api/cms';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function AdminBlogsListPage() {
  const [blogs, setBlogs] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<ContentPost | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [contentRichtext, setContentRichtext] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const res = await cmsAPI.getPosts({ postType: 'BLOG', limit: 50 });
      if (res.data) {
        setBlogs(res.data);
      }
    } catch (err) {
      console.error('Failed to load blog posts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const openCreateModal = () => {
    setEditingBlog(null);
    setTitle('');
    setSlug('');
    setFeaturedImage('');
    setExcerpt('');
    setContentRichtext('');
    setStatus('PUBLISHED');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (b: ContentPost) => {
    setEditingBlog(b);
    setTitle(b.title);
    setSlug(b.slug);
    setFeaturedImage(b.featuredImage || '');
    setExcerpt(b.excerpt || '');
    setContentRichtext(b.contentRichtext || '');
    setStatus(b.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const payload = {
        postType: 'BLOG' as const,
        title,
        slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
        featuredImage: featuredImage || null,
        excerpt: excerpt || null,
        contentRichtext: contentRichtext || null,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : null,
      };

      if (editingBlog) {
        await cmsAPI.updatePost(editingBlog.id, payload);
      } else {
        await cmsAPI.createPost(payload);
      }

      setIsModalOpen(false);
      await loadBlogs();
    } catch (err: any) {
      console.error('Failed to save blog:', err);
      setFormError(err?.response?.data?.message || 'Failed to save blog post.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this blog post?')) return;
    try {
      await cmsAPI.deletePost(id);
      await loadBlogs();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Failed to delete blog post.');
    }
  };

  const filteredBlogs = blogs.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-2xl font-black text-foreground">Blog Articles Manager</h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Create, edit, and publish expert tractor guides, comparison stories, and farm technology tips.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2.5 text-xs font-black uppercase text-black hover:bg-lime-300 transition-all shadow-md"
        >
          <Plus size={16} /> New Blog Post
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative min-w-[280px]">
          <Search size={16} className="text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search blog articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-card/60 border-border/50 text-foreground w-full rounded-full border py-2.5 pl-9 pr-4 text-xs font-medium focus:border-lime-400 focus:outline-none"
          />
        </div>
        <div className="text-xs font-bold text-muted-foreground">
          Total Blogs: <span className="text-foreground font-black">{blogs.length}</span>
        </div>
      </div>

      {/* Blogs Table */}
      <div className="rounded-3xl border border-border/60 bg-card/60 p-6 shadow-xl">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <TractorLoader size={40} />
            <p className="text-muted-foreground mt-3 text-xs font-bold">Loading blog articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-12 text-center text-xs text-muted-foreground">
            No blog articles found. Click "+ New Blog Post" to publish your first article.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/40 text-muted-foreground uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="pb-3 font-bold">Article Title</th>
                  <th className="pb-3 font-bold">Slug</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold">Views</th>
                  <th className="pb-3 font-bold">Created</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredBlogs.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="py-3.5 pr-4 font-bold text-foreground max-w-sm truncate">
                      {b.title}
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground font-mono text-[11px] max-w-xs truncate">
                      {b.slug}
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          b.status === 'PUBLISHED'
                            ? 'bg-lime-400/15 text-lime-400'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-muted-foreground">
                      {b.viewsCount || 0}
                    </td>
                    <td className="py-3.5 text-muted-foreground">
                      {new Date(b.createdAt).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/content/blogs/${b.id}`}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-lime-400 hover:text-black transition-colors"
                          title="Full Editor"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(b.id)}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                          title="Delete Post"
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

      {/* Quick Create / Edit Modal */}
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
              {editingBlog ? 'Edit Blog Article' : 'Create New Blog Article'}
            </h2>

            {formError && (
              <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveBlog} className="space-y-4">
              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Blog Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Top 10 Tractors for Sugarcane Farming"
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
                  placeholder="Short introductory summary for cards and search snippets..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                  Article Body (HTML / Text) *
                </label>
                <textarea
                  required
                  rows={8}
                  placeholder="<p>Write your detailed agricultural article here...</p>"
                  value={contentRichtext}
                  onChange={(e) => setContentRichtext(e.target.value)}
                  className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-3 py-2 text-xs font-medium focus:border-lime-400 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-3">
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
                    {submitting ? 'Saving...' : editingBlog ? 'Update' : 'Publish'}
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
