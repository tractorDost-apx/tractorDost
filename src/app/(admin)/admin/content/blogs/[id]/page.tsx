'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, CheckCircle2, FileText, Eye, Trash2 } from 'lucide-react';
import { cmsAPI, ContentPost } from '@/lib/api/cms';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function AdminBlogEditPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const postId = Number(resolvedParams.id);

  const [post, setPost] = useState<ContentPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form Fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [featuredImage, setFeaturedImage] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [contentRichtext, setContentRichtext] = useState('');
  const [seoTitle, setSeoTitle] = useState('');
  const [seoDescription, setSeoDescription] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');

  useEffect(() => {
    async function loadPost() {
      try {
        setLoading(true);
        const res = await cmsAPI.getPost(postId);
        if (res.data) {
          const p = res.data;
          setPost(p);
          setTitle(p.title);
          setSlug(p.slug);
          setFeaturedImage(p.featuredImage || '');
          setExcerpt(p.excerpt || '');
          setContentRichtext(p.contentRichtext || '');
          setSeoTitle(p.seoTitle || '');
          setSeoDescription(p.seoDescription || '');
          setStatus(p.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
        }
      } catch (err: any) {
        console.error('Failed to load blog:', err);
        setErrorMsg('Blog post not found or failed to load.');
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await cmsAPI.updatePost(postId, {
        title,
        slug,
        featuredImage: featuredImage || null,
        excerpt: excerpt || null,
        contentRichtext: contentRichtext || null,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        status,
        publishedAt: status === 'PUBLISHED' ? new Date().toISOString() : null,
      });

      if (res.data) {
        setPost(res.data);
        setSuccessMsg('Blog post updated successfully!');
      }
    } catch (err: any) {
      console.error('Failed to update blog:', err);
      setErrorMsg(err?.response?.data?.message || 'Failed to update blog post.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <TractorLoader size={48} />
        <p className="text-muted-foreground mt-3 text-xs font-bold">Loading blog post...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-8 text-center max-w-lg mx-auto">
        <h2 className="text-xl font-bold text-foreground">Blog Post Not Found</h2>
        <Link
          href="/admin/content/blogs"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-lime-400 px-5 py-2 text-xs font-bold text-black"
        >
          <ArrowLeft size={14} /> Back to Blogs List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/content/blogs"
          className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={14} /> Back to Blogs
        </Link>
        <Link
          href={`/news/${post.slug}`}
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-lime-400 hover:underline"
        >
          <Eye size={14} /> View Live Preview
        </Link>
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center justify-between border-b border-border/40 pb-5">
          <div>
            <h1 className="text-2xl font-black text-foreground">Edit Blog Article</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              ID: #{post.id} | Views: {post.viewsCount || 0}
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              status === 'PUBLISHED' ? 'bg-lime-400/15 text-lime-400' : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            {status}
          </span>
        </div>

        {successMsg && (
          <div className="mb-6 rounded-xl border border-lime-400/30 bg-lime-400/10 p-3 text-xs font-bold text-lime-400 flex items-center gap-2">
            <CheckCircle2 size={16} /> {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
              Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                URL Slug
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-mono focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-lime-400 focus:outline-none"
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
              Featured Image URL
            </label>
            <input
              type="url"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
              Summary / Excerpt
            </label>
            <textarea
              rows={2}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-medium focus:border-lime-400 focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
              Article Content Body (HTML / Markdown) *
            </label>
            <textarea
              required
              rows={12}
              value={contentRichtext}
              onChange={(e) => setContentRichtext(e.target.value)}
              className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-3 text-sm font-mono focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/40 pt-4">
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                SEO Meta Title
              </label>
              <input
                type="text"
                placeholder="Meta title for Google search..."
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-2.5 text-xs font-medium focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="text-muted-foreground mb-1 block text-xs font-bold uppercase tracking-wider">
                SEO Meta Description
              </label>
              <input
                type="text"
                placeholder="Meta description..."
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                className="bg-secondary/20 border-border/50 text-foreground w-full rounded-xl border px-4 py-2.5 text-xs font-medium focus:border-lime-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push('/admin/content/blogs')}
              className="rounded-xl border border-border/60 px-6 py-3 text-xs font-bold text-foreground hover:bg-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-lime-400 px-8 py-3 text-xs font-black uppercase text-black hover:bg-lime-300 disabled:opacity-70 shadow-md"
            >
              <Save size={16} /> {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
