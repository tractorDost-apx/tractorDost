'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Clock, BookOpen, TrendingUp, Tag } from 'lucide-react';
import { ContentPost } from '@/lib/api/cms';

interface PostCardProps {
  post: ContentPost;
  featured?: boolean;
}

const LANGUAGE_LABELS: Record<string, string> = {
  EN: 'English',
  HI: 'हिन्दी',
  MR: 'मराठी',
  TE: 'తెలుగు',
  TA: 'தமிழ்',
  PB: 'ਪੰਜਾਬੀ',
  BN: 'বাংলা',
  GU: 'ગુજરાતી',
  KN: 'ಕನ್ನಡ',
};

export default function PostCard({ post, featured = false }: PostCardProps) {
  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : new Date(post.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

  const languageLabel = LANGUAGE_LABELS[post.language] || post.language;

  return (
    <Link
      href={`/blogs/${post.slug}`}
      className={`group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-xl dark:border-white/10 dark:bg-[#121814]/40 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-[var(--color-brand-green)]/10 ${
        featured ? 'md:grid md:grid-cols-2 md:gap-6' : ''
      }`}
    >
      {/* Featured / Thumbnail Image */}
      <div className={`relative overflow-hidden bg-black/40 ${featured ? 'h-64 md:h-full' : 'h-52 w-full'}`}>
        {post.featuredImage ? (
          <img
            src={post.featuredImage}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#121a14] to-[#0a0f0c] p-6 text-center">
            <BookOpen size={40} className="text-[var(--color-brand-green)]/40 mb-2" />
            <span className="text-xs font-bold text-white/40 uppercase tracking-widest">
              TractorDost Knowledge
            </span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

        {/* Badges on top of image */}
        <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
          {post.category && (
            <span className="rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md border border-white/10">
              {post.category.name}
            </span>
          )}
          <span className="rounded-lg bg-[var(--color-brand-green)]/80 px-2 py-0.5 text-[10px] font-black text-white uppercase tracking-wider backdrop-blur-md">
            {post.postType}
          </span>
        </div>

        {/* Language & Trending Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          {post.isTrending && (
            <span
              title="Trending Article"
              className="flex items-center gap-1 rounded-lg bg-amber-500/90 px-2 py-1 text-[10px] font-black text-black backdrop-blur-md shadow-md"
            >
              <TrendingUp size={12} />
              <span>TRENDING</span>
            </span>
          )}
          <span className="rounded-lg bg-black/60 px-2 py-1 text-[10px] font-bold text-white/90 backdrop-blur-md border border-white/10">
            {languageLabel}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Metadata info */}
          <div className="flex items-center gap-3 text-[11px] font-semibold text-zinc-500 dark:text-muted mb-2.5">
            <span className="flex items-center gap-1">
              <Calendar size={13} className="text-[var(--color-brand-green)]" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock size={13} />
              {post.readTimeMinutes ? `${post.readTimeMinutes} min read` : '3 min read'}
            </span>
          </div>

          {/* Title */}
          <h3
            className={`font-black text-zinc-900 dark:text-white group-hover:text-[var(--color-brand-green)] transition-colors line-clamp-2 ${
              featured ? 'text-xl md:text-2xl mb-3' : 'text-base mb-2'
            }`}
          >
            {post.title}
          </h3>

          {/* Excerpt */}
          {post.excerpt && (
            <p className="text-xs text-zinc-600 dark:text-white/70 line-clamp-2 leading-relaxed mb-4">
              {post.excerpt}
            </p>
          )}
        </div>

        {/* Author & Read More Footer */}
        <div className="flex items-center justify-between border-t border-zinc-100 dark:border-white/5 pt-3 mt-auto">
          <span className="text-[11px] font-medium text-zinc-500 dark:text-muted truncate">
            By {post.author?.fullName || 'TractorDost Editorial'}
          </span>
          <span className="flex items-center gap-1 text-xs font-bold text-[var(--color-brand-green)] group-hover:translate-x-1 transition-transform">
            Read article →
          </span>
        </div>
      </div>
    </Link>
  );
}
