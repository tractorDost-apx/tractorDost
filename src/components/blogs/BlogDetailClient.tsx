'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Tag,
  ChevronRight,
  TrendingUp,
  Languages,
  RotateCcw,
} from 'lucide-react';
import { ContentPost } from '@/lib/api/cms';
import FloatingLanguageSelector from './FloatingLanguageSelector';
import ShareButtons from './ShareButtons';
import RelatedPosts from './RelatedPosts';
import {
  INDIAN_LANGUAGES,
  TranslatedPostContent,
} from '@/lib/services/translationService';

interface BlogDetailClientProps {
  post: ContentPost;
}

export default function BlogDetailClient({ post }: BlogDetailClientProps) {
  // Dynamic state for translated content
  const [displayedTitle, setDisplayedTitle] = useState(post.title);
  const [displayedExcerpt, setDisplayedExcerpt] = useState(post.excerpt || '');
  const [displayedContent, setDisplayedContent] = useState(post.contentRichtext || '');
  const [currentLang, setCurrentLang] = useState('en');

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : new Date(post.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });

  const parsedTags = Array.isArray(post.tags) ? (post.tags as string[]) : [];

  const handleTranslationChange = (translated: TranslatedPostContent) => {
    setDisplayedTitle(translated.title);
    setDisplayedExcerpt(translated.excerpt);
    setDisplayedContent(translated.contentHtml);
    setCurrentLang(translated.lang);
  };

  const activeLangOption = INDIAN_LANGUAGES.find((l) => l.code === currentLang) || INDIAN_LANGUAGES[0];

  return (
    <article className="mx-auto flex w-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8 relative">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-muted">
        <Link href="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <ChevronRight size={13} className="opacity-40" />
        <Link href="/blogs" className="hover:text-white transition-colors">
          Blogs
        </Link>
        {post.category && (
          <>
            <ChevronRight size={13} className="opacity-40" />
            <Link
              href={`/blogs?category=${post.category.id}`}
              className="hover:text-white transition-colors"
            >
              {post.category.name}
            </Link>
          </>
        )}
        <ChevronRight size={13} className="opacity-40" />
        <span className="text-white/60 truncate max-w-[200px] sm:max-w-xs">{displayedTitle}</span>
      </nav>

      {/* Header Info */}
      <header className="flex flex-col gap-4">
        {/* Badges & Meta */}
        <div className="flex flex-wrap items-center gap-2">
          {post.category && (
            <span className="rounded-lg bg-[var(--color-brand-green)]/15 border border-[var(--color-brand-green)]/30 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
              {post.category.name}
            </span>
          )}
          <span className="rounded-lg bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-bold text-muted uppercase">
            {post.postType}
          </span>
          {post.isTrending && (
            <span className="flex items-center gap-1 rounded-lg bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-300">
              <TrendingUp size={12} />
              <span>Trending</span>
            </span>
          )}

          {/* Active Translation Indicator */}
          {currentLang !== 'en' && (
            <span className="flex items-center gap-1.5 rounded-lg bg-[var(--color-brand-green)]/20 border border-[var(--color-brand-green)]/40 px-3 py-1 text-xs font-bold text-[var(--color-brand-green)]">
              <Languages size={13} />
              <span>Reading in {activeLangOption.native} ({activeLangOption.name})</span>
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-black text-white sm:text-4xl md:text-5xl leading-tight">
          {displayedTitle}
        </h1>

        {/* Excerpt */}
        {displayedExcerpt && (
          <p className="text-base sm:text-lg text-white/70 leading-relaxed font-medium italic border-l-2 border-[var(--color-brand-green)]/50 pl-4 py-1">
            {displayedExcerpt}
          </p>
        )}

        {/* Author, Date, Read Time & Share Bar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-y border-white/10 py-4 my-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-brand-green)]/20 text-[var(--color-brand-green)] border border-[var(--color-brand-green)]/30 font-bold text-sm">
              <User size={18} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">
                {post.author?.fullName || 'TractorDost Editorial'}
              </span>
              <div className="flex items-center gap-2 text-[11px] text-muted">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  {formattedDate}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {post.readTimeMinutes ? `${post.readTimeMinutes} min read` : '4 min read'}
                </span>
              </div>
            </div>
          </div>

          <ShareButtons title={displayedTitle} />
        </div>
      </header>

      {/* Full Width Featured Image */}
      {post.featuredImage && (
        <div className="relative my-6 w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-black/40">
          <img
            src={post.featuredImage}
            alt={displayedTitle}
            className="w-full max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Rich Text Body Content */}
      <main className="mt-4">
        <div
          className="prose prose-invert max-w-none text-white/85 leading-relaxed
            prose-headings:text-white prose-headings:font-black
            prose-h2:text-2xl prose-h2:sm:text-3xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:sm:text-2xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-white/80 prose-p:text-base prose-p:sm:text-lg prose-p:leading-relaxed prose-p:my-4
            prose-a:text-[var(--color-brand-green)] prose-a:underline prose-a:underline-offset-4 hover:prose-a:opacity-80
            prose-blockquote:border-l-4 prose-blockquote:border-[var(--color-brand-green)] prose-blockquote:bg-white/[0.02] prose-blockquote:py-3 prose-blockquote:px-5 prose-blockquote:rounded-r-xl prose-blockquote:italic prose-blockquote:text-white/80
            prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6
            prose-li:text-white/80 prose-li:my-1.5
            prose-img:rounded-2xl prose-img:border prose-img:border-white/10 prose-img:shadow-2xl prose-img:my-8 prose-img:mx-auto"
          dangerouslySetInnerHTML={{
            __html: displayedContent || '<p className="text-muted">No content available.</p>',
          }}
        />
      </main>

      {/* Tags section */}
      {parsedTags.length > 0 && (
        <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-white/10 pt-6">
          <span className="flex items-center gap-1.5 text-xs font-bold text-muted mr-1">
            <Tag size={13} className="text-[var(--color-brand-green)]" />
            Tags:
          </span>
          {parsedTags.map((tag) => (
            <span
              key={tag}
              className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs font-medium text-white/80 hover:border-[var(--color-brand-green)]/40 hover:text-white transition-colors cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Bottom Share Banner */}
      <div className="glass-panel my-10 flex flex-col items-center justify-between gap-4 rounded-2xl p-6 sm:flex-row border border-white/10 bg-gradient-to-r from-black/40 via-white/[0.02] to-black/40">
        <div>
          <h4 className="text-sm font-bold text-white">Found this article helpful?</h4>
          <p className="text-xs text-muted">
            Share with fellow farmers and tractor enthusiasts in your community.
          </p>
        </div>
        <ShareButtons title={displayedTitle} />
      </div>

      {/* Related Posts Section */}
      <RelatedPosts
        currentPostId={post.id}
        categoryId={post.categoryId}
        categoryName={post.category?.name}
      />

      {/* Back to Blogs Link */}
      <div className="mt-12 text-center">
        <Link
          href="/blogs"
          className="inline-flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-6 py-3 text-xs font-bold text-white hover:bg-white/10 hover:border-white/20 transition-all"
        >
          <ArrowLeft size={16} />
          <span>Back to All Blogs & Articles</span>
        </Link>
      </div>

      {/* Floating Language Selector (Fixed Bottom-Right) */}
      <FloatingLanguageSelector
        slug={post.slug}
        originalTitle={post.title}
        originalExcerpt={post.excerpt || ''}
        originalContent={post.contentRichtext || ''}
        onTranslationChange={handleTranslationChange}
      />
    </article>
  );
}
