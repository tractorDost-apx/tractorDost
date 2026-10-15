'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Save,
  Sparkles,
  Eye,
  Globe,
  Settings,
  Calendar,
  Tag,
  Clock,
  TrendingUp,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import RichTextEditor from '../editor/RichTextEditor';
import {
  cmsAPI,
  ContentPost,
  ContentCategory,
  ContentType,
  ContentStatus,
  Language,
  CreateContentPostInput,
} from '@/lib/api/cms';

interface PostFormProps {
  mode: 'create' | 'edit';
  initialData?: ContentPost;
  postId?: number;
}

const POST_TYPES: { label: string; value: ContentType }[] = [
  { label: 'Blog Article', value: 'BLOG' },
  { label: 'News Update', value: 'NEWS' },
  { label: 'Buying Guide', value: 'BUYING_GUIDE' },
  { label: 'Comparison', value: 'COMPARISON' },
  { label: 'Video Post', value: 'VIDEO' },
  { label: 'Web Story', value: 'WEB_STORY' },
];

const STATUSES: { label: string; value: ContentStatus; color: string }[] = [
  { label: 'Draft', value: 'DRAFT', color: 'bg-zinc-500/20 text-zinc-300' },
  { label: 'In Review', value: 'REVIEW', color: 'bg-amber-500/20 text-amber-300' },
  { label: 'Scheduled', value: 'SCHEDULED', color: 'bg-blue-500/20 text-blue-300' },
  { label: 'Published', value: 'PUBLISHED', color: 'bg-emerald-500/20 text-emerald-300' },
  { label: 'Archived', value: 'ARCHIVED', color: 'bg-rose-500/20 text-rose-300' },
];

const LANGUAGES: { label: string; value: Language }[] = [
  { label: 'English (EN)', value: 'EN' },
  { label: 'Hindi (HI)', value: 'HI' },
  { label: 'Marathi (MR)', value: 'MR' },
  { label: 'Telugu (TE)', value: 'TE' },
  { label: 'Tamil (TA)', value: 'TA' },
  { label: 'Punjabi (PB)', value: 'PB' },
  { label: 'Bengali (BN)', value: 'BN' },
  { label: 'Gujarati (GU)', value: 'GU' },
  { label: 'Kannada (KN)', value: 'KN' },
];

export default function PostForm({ mode, initialData, postId }: PostFormProps) {
  const router = useRouter();

  // Form State
  const [title, setTitle] = useState(initialData?.title || '');
  const [slug, setSlug] = useState(initialData?.slug || '');
  const [postType, setPostType] = useState<ContentType>(initialData?.postType || 'BLOG');
  const [categoryId, setCategoryId] = useState<number | ''>(initialData?.categoryId ?? '');
  const [status, setStatus] = useState<ContentStatus>(initialData?.status || 'DRAFT');
  const [language, setLanguage] = useState<Language>(initialData?.language || 'EN');
  const [featuredImage, setFeaturedImage] = useState(initialData?.featuredImage || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [contentRichtext, setContentRichtext] = useState(initialData?.contentRichtext || '');
  const [publishedAt, setPublishedAt] = useState<string>(
    initialData?.publishedAt
      ? new Date(initialData.publishedAt).toISOString().slice(0, 16)
      : ''
  );

  // SEO & Meta
  const [seoTitle, setSeoTitle] = useState(initialData?.seoTitle || '');
  const [seoDescription, setSeoDescription] = useState(initialData?.seoDescription || '');
  const [canonicalUrl, setCanonicalUrl] = useState(initialData?.canonicalUrl || '');
  const [tagsInput, setTagsInput] = useState(
    Array.isArray(initialData?.tags) ? (initialData.tags as string[]).join(', ') : ''
  );
  const [readTimeMinutes, setReadTimeMinutes] = useState<number | ''>(
    initialData?.readTimeMinutes ?? ''
  );
  const [isTrending, setIsTrending] = useState<boolean>(initialData?.isTrending ?? false);

  // UI state
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'content' | 'seo' | 'preview'>('content');

  // Fetch categories matching current postType
  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const res = await cmsAPI.getCategories({
          postType,
          limit: 100,
          isActive: true,
        });
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, [postType]);

  // Auto-generate slug from title if in create mode or slug is empty
  const generateSlug = () => {
    if (!title.trim()) return;
    const clean = title
      .normalize('NFKD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 180);
    setSlug(clean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!title.trim() || title.trim().length < 3) {
      setErrorMsg('Title must be at least 3 characters.');
      return;
    }

    if (status === 'PUBLISHED' && !contentRichtext.trim()) {
      setErrorMsg('Published posts require body content. Please add content in the editor.');
      return;
    }

    setSaving(true);

    try {
      // Parse tags
      const tagsArray = tagsInput
        ? tagsInput
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : null;

      const payload: CreateContentPostInput = {
        title: title.trim(),
        slug: slug.trim() || undefined,
        postType,
        categoryId: categoryId === '' ? null : Number(categoryId),
        status,
        language,
        featuredImage: featuredImage.trim() || null,
        excerpt: excerpt.trim() || null,
        contentRichtext: contentRichtext || null,
        publishedAt: publishedAt ? new Date(publishedAt).toISOString() : null,
        seoTitle: seoTitle.trim() || null,
        seoDescription: seoDescription.trim() || null,
        canonicalUrl: canonicalUrl.trim() || null,
        tags: tagsArray,
        readTimeMinutes: readTimeMinutes === '' ? null : Number(readTimeMinutes),
        isTrending,
      };

      if (mode === 'create') {
        const res = await cmsAPI.createPost(payload);
        if (res.success) {
          setSuccessMsg('Post created successfully!');
          setTimeout(() => {
            router.push('/admin/cms/posts');
          }, 1200);
        }
      } else if (mode === 'edit' && postId) {
        const res = await cmsAPI.updatePost(postId, payload);
        if (res.success) {
          setSuccessMsg('Post updated successfully!');
          setTimeout(() => {
            router.push('/admin/cms/posts');
          }, 1200);
        }
      }
    } catch (err: any) {
      console.error('Failed to save post', err);
      const apiMsg = err?.response?.data?.message || err?.message || 'Failed to save post.';
      setErrorMsg(apiMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cms/posts"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-muted hover:bg-white/10 hover:text-white transition-all"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-white">
              {mode === 'create' ? 'Create New Post' : 'Edit Post'}
            </h1>
            <p className="text-xs text-muted">
              {mode === 'create'
                ? 'Author and publish engaging blog articles, news updates, or guides.'
                : `Editing: ${title || initialData?.title || 'Untitled Post'}`}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin/cms/posts"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-bold text-muted hover:bg-white/5 hover:text-white transition-all"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-[var(--color-brand-green)]/20 hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Save size={16} />
            <span>{saving ? 'Saving...' : mode === 'create' ? 'Publish / Save' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {errorMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
          <AlertCircle size={18} className="shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs font-semibold text-emerald-400">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Grid: Left Editor & Right Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Title, Excerpt, Tabs, RichTextEditor (2 Cols) */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Title & Slug Box */}
          <div className="glass-panel flex flex-col gap-4 rounded-2xl p-6 shadow-xl">
            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-muted uppercase">
                Post Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Top 10 Most Fuel-Efficient Tractors in India for 2026"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-base font-bold text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-green)]"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-bold tracking-wider text-muted uppercase">
                  URL Slug
                </label>
                <button
                  type="button"
                  onClick={generateSlug}
                  className="flex items-center gap-1 text-[11px] font-bold text-[var(--color-brand-green)] hover:underline"
                >
                  <Sparkles size={12} />
                  Auto-generate from Title
                </button>
              </div>
              <div className="flex items-center rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-muted focus-within:border-[var(--color-brand-green)]">
                <span className="opacity-50 select-none">/posts/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="top-10-fuel-efficient-tractors-2026"
                  className="w-full bg-transparent px-1 font-mono text-xs text-white placeholder-white/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-bold tracking-wider text-muted uppercase">
                Excerpt / Short Summary
              </label>
              <textarea
                rows={2}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Brief 1-2 sentence overview shown in post cards and search previews..."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-xs text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none focus:ring-1 focus:ring-[var(--color-brand-green)]"
              />
            </div>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-2">
            <button
              type="button"
              onClick={() => setActiveTab('content')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'content'
                  ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                  : 'text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <FileText size={15} />
              <span>Article Content</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'seo'
                  ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                  : 'text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <Globe size={15} />
              <span>SEO & Metadata</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'preview'
                  ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                  : 'text-muted hover:bg-white/5 hover:text-white'
              }`}
            >
              <Eye size={15} />
              <span>Preview</span>
            </button>
          </div>

          {/* Tab 1: Rich Text Editor */}
          {activeTab === 'content' && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold tracking-wider text-muted uppercase">
                  Article Body (Rich Text)
                </span>
                <span className="text-[11px] text-muted">Supports formatting, headings, links & images</span>
              </div>
              <RichTextEditor
                content={contentRichtext}
                onChange={(html) => setContentRichtext(html)}
                placeholder="Start typing your blog article here..."
                minHeight="420px"
              />
            </div>
          )}

          {/* Tab 2: SEO Settings */}
          {activeTab === 'seo' && (
            <div className="glass-panel flex flex-col gap-5 rounded-2xl p-6 shadow-xl">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Globe size={16} className="text-[var(--color-brand-green)]" />
                Search Engine Optimization (SEO)
              </h3>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-bold text-muted">SEO Title</label>
                  <span className={`text-[11px] ${seoTitle.length > 60 ? 'text-red-400 font-bold' : 'text-muted'}`}>
                    {seoTitle.length}/60
                  </span>
                </div>
                <input
                  type="text"
                  maxLength={60}
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Appears as page title in Google search results"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between">
                  <label className="text-xs font-bold text-muted">SEO Meta Description</label>
                  <span className={`text-[11px] ${seoDescription.length > 160 ? 'text-red-400 font-bold' : 'text-muted'}`}>
                    {seoDescription.length}/160
                  </span>
                </div>
                <textarea
                  rows={3}
                  maxLength={160}
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Appears under title in Google snippets (recommended 140-160 chars)"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-bold text-muted">Canonical URL</label>
                <input
                  type="url"
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                  placeholder="https://tractordost.com/posts/..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none"
                />
              </div>

              {/* SERP Search Preview */}
              <div className="rounded-xl border border-white/10 bg-black/60 p-4">
                <span className="text-[10px] font-bold tracking-wider text-muted uppercase block mb-2">
                  Google Search Snippet Preview
                </span>
                <div className="text-xs text-blue-400 font-medium truncate">
                  https://tractordost.com/posts/{slug || 'post-slug'}
                </div>
                <div className="text-sm font-bold text-[#8ab4f8] hover:underline cursor-pointer truncate mt-0.5">
                  {seoTitle || title || 'Post Title Preview'}
                </div>
                <div className="text-xs text-zinc-400 line-clamp-2 mt-1">
                  {seoDescription || excerpt || 'Your post description will appear here in search engine rankings.'}
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Live Preview */}
          {activeTab === 'preview' && (
            <div className="glass-panel flex flex-col gap-6 rounded-2xl p-6 sm:p-8 shadow-xl">
              {featuredImage && (
                <div className="relative h-64 w-full overflow-hidden rounded-xl border border-white/10">
                  <img
                    src={featuredImage}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-md bg-[var(--color-brand-green)]/20 px-2 py-0.5 text-[11px] font-bold text-[var(--color-brand-green)]">
                    {postType}
                  </span>
                  <span className="text-xs text-muted">• {language}</span>
                </div>
                <h1 className="text-3xl font-black text-white">{title || 'Untitled Post'}</h1>
                {excerpt && <p className="mt-3 text-sm text-white/70 italic">{excerpt}</p>}
              </div>
              <hr className="border-white/10" />
              <div
                className="prose prose-invert max-w-none text-white/80"
                dangerouslySetInnerHTML={{ __html: contentRichtext || '<p className="text-muted">No content provided yet.</p>' }}
              />
            </div>
          )}
        </div>

        {/* Right Column: Settings & Publishing Controls (1 Col) */}
        <div className="flex flex-col gap-6">
          {/* Publishing Card */}
          <div className="glass-panel flex flex-col gap-4 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-black tracking-wider text-muted uppercase flex items-center gap-2">
              <Settings size={14} className="text-[var(--color-brand-green)]" />
              Publishing Status
            </h3>

            <div>
              <label className="mb-1 block text-xs font-bold text-white">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ContentStatus)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white focus:border-[var(--color-brand-green)] focus:outline-none"
              >
                {STATUSES.map((st) => (
                  <option key={st.value} value={st.value} className="bg-zinc-900 text-white">
                    {st.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-white">Post Type</label>
              <select
                value={postType}
                onChange={(e) => setPostType(e.target.value as ContentType)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white focus:border-[var(--color-brand-green)] focus:outline-none"
              >
                {POST_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value} className="bg-zinc-900 text-white">
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-white">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value === '' ? '' : Number(e.target.value))}
                disabled={loadingCategories}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white focus:border-[var(--color-brand-green)] focus:outline-none disabled:opacity-50"
              >
                <option value="" className="bg-zinc-900 text-zinc-400">
                  {loadingCategories ? 'Loading categories...' : 'None / Uncategorized'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-zinc-900 text-white">
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-white">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs font-bold text-white focus:border-[var(--color-brand-green)] focus:outline-none"
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang.value} value={lang.value} className="bg-zinc-900 text-white">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Calendar size={13} className="text-muted" />
                  Publish Date
                </span>
                <span className="text-[10px] text-muted">Optional</span>
              </label>
              <input
                type="datetime-local"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="glass-panel flex flex-col gap-3 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-black tracking-wider text-muted uppercase flex items-center gap-2">
              <ImageIcon size={14} className="text-[var(--color-brand-green)]" />
              Featured Image
            </h3>

            <div>
              <label className="mb-1 block text-xs font-bold text-muted">Image URL</label>
              <input
                type="url"
                value={featuredImage}
                onChange={(e) => setFeaturedImage(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>

            {featuredImage && (
              <div className="relative mt-2 h-36 w-full overflow-hidden rounded-xl border border-white/10 bg-black/40">
                <img
                  src={featuredImage}
                  alt="Featured Preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Additional Options */}
          <div className="glass-panel flex flex-col gap-4 rounded-2xl p-5 shadow-xl">
            <h3 className="text-xs font-black tracking-wider text-muted uppercase flex items-center gap-2">
              <Tag size={14} className="text-[var(--color-brand-green)]" />
              Additional Attributes
            </h3>

            <div>
              <label className="mb-1 block text-xs font-bold text-muted">Tags (Comma-separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="Mahindra, Mileage, Tractor Price"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center justify-between text-xs font-bold text-muted">
                <span className="flex items-center gap-1.5">
                  <Clock size={13} />
                  Read Time (Minutes)
                </span>
              </label>
              <input
                type="number"
                min={1}
                max={60}
                value={readTimeMinutes}
                onChange={(e) =>
                  setReadTimeMinutes(e.target.value === '' ? '' : Number(e.target.value))
                }
                placeholder="e.g. 5"
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[var(--color-brand-green)]" />
                <div>
                  <span className="block text-xs font-bold text-white">Trending Post</span>
                  <span className="text-[10px] text-muted">Highlight on homepage & feed</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isTrending}
                onChange={(e) => setIsTrending(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded accent-[var(--color-brand-green)]"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
