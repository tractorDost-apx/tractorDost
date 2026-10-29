'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Search,
  Sparkles,
  Newspaper,
  Calendar,
  Clock,
  TrendingUp,
  Tag,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { cmsAPI, ContentPost, ContentCategory } from '@/lib/api/cms';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Pagination from '@/components/shared/Pagination';

export default function NewsListClient() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load news categories
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await cmsAPI.getCategories({ postType: 'NEWS', isActive: true });
        if (res.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      } catch (err) {
        console.error('Failed to load news categories', err);
      }
    }
    loadCategories();
  }, []);

  // Fetch news posts
  const fetchNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await cmsAPI.getPosts({
        page,
        limit: 9,
        postType: 'NEWS',
        status: 'PUBLISHED',
        search: debouncedSearch || undefined,
        categoryId: selectedCategory === 'all' ? undefined : Number(selectedCategory),
        sortBy: 'publishedAt',
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
      console.error('Failed to fetch news', err);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, selectedCategory]);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const featuredPost = posts.find((p) => p.isTrending) || posts[0];
  const listPosts = featuredPost ? posts.filter((p) => p.id !== featuredPost.id) : posts;

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-3.5 pb-24 sm:px-6 lg:px-8">
      {/* Header */}
      <section className="relative flex flex-col items-center justify-center pb-10 text-center">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            <Newspaper size={14} /> Agri & Tractor News
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-6xl">
            Latest Farm Mechanization <span className="text-[var(--color-brand-green)]">Updates</span>
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
            Stay ahead with breaking tractor launches, government subsidy policies, price revisions, and Indian agriculture tech news.
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Search and Category Filter Bar */}
      <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="text-muted-foreground absolute top-1/2 left-4 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search news by tractor model, scheme, or brand..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-secondary/20 border-border/50 text-foreground w-full rounded-2xl border py-3.5 pr-4 pl-11 text-sm font-medium transition-all focus:border-[var(--color-brand-green)]/50 focus:ring-1 focus:ring-[var(--color-brand-green)]/50 focus:outline-none"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setPage(1);
            }}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
            }`}
          >
            All News
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.id.toString());
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
                selectedCategory === cat.id.toString()
                  ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                  : 'bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <TractorLoader size={48} className="text-[var(--color-brand-green)]" />
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-3xl border border-border/40 bg-card/40 p-16 text-center">
          <Newspaper size={48} className="text-muted-foreground mx-auto mb-4 opacity-40" />
          <h3 className="text-foreground text-xl font-bold">No News Found</h3>
          <p className="text-muted-foreground mt-1 text-sm">
            Try adjusting your search query or check back soon for breaking farm updates.
          </p>
        </div>
      ) : (
        <>
          {/* Featured Breaking News Hero Card (if available on page 1) */}
          {page === 1 && featuredPost && (
            <div className="mb-12">
              <Link
                href={`/news/${featuredPost.slug}`}
                className="group relative grid grid-cols-1 overflow-hidden rounded-3xl border border-border/50 bg-card/60 shadow-xl transition-all duration-300 hover:border-[var(--color-brand-green)]/40 hover:shadow-2xl md:grid-cols-12"
              >
                <div className="relative h-64 overflow-hidden bg-black/40 md:col-span-7 md:h-96">
                  {featuredPost.featuredImage ? (
                    <img
                      src={featuredPost.featuredImage}
                      alt={featuredPost.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#121a14] to-[#0a0f0c]">
                      <Newspaper size={64} className="text-[var(--color-brand-green)]/30" />
                    </div>
                  )}
                  {featuredPost.isTrending && (
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-red-500/90 px-3 py-1 text-xs font-black text-white shadow-md backdrop-blur-sm">
                      <TrendingUp size={14} /> Breaking News
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-center p-8 md:col-span-5 md:p-10">
                  <div className="text-muted-foreground mb-3 flex items-center gap-4 text-xs font-semibold">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} />
                      {new Date(featuredPost.publishedAt || featuredPost.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {featuredPost.readTimeMinutes && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} /> {featuredPost.readTimeMinutes} min read
                      </span>
                    )}
                  </div>
                  <h2 className="text-foreground group-hover:text-[var(--color-brand-green)] mb-4 text-2xl font-black leading-snug transition-colors md:text-3xl">
                    {featuredPost.title}
                  </h2>
                  <p className="text-muted-foreground mb-6 line-clamp-3 text-sm leading-relaxed">
                    {featuredPost.excerpt || 'Read the full story to know how this latest update impacts tractor owners and agriculture in India.'}
                  </p>
                  <div className="inline-flex items-center gap-2 text-sm font-black text-[var(--color-brand-green)]">
                    Read Full Story <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* News Cards Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {listPosts.map((post) => (
              <Link
                key={post.id}
                href={`/news/${post.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/40 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-xl"
              >
                <div className="relative h-48 w-full overflow-hidden bg-black/40">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#121a14] to-[#0a0f0c]">
                      <Newspaper size={40} className="text-[var(--color-brand-green)]/30" />
                    </div>
                  )}
                  {post.category && (
                    <div className="absolute top-3 left-3 rounded-full bg-black/70 px-2.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
                      {post.category.name}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="text-muted-foreground mb-2 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                    {post.readTimeMinutes && (
                      <span className="flex items-center gap-1">
                        <Clock size={12} /> {post.readTimeMinutes} min
                      </span>
                    )}
                  </div>

                  <h3 className="text-foreground group-hover:text-[var(--color-brand-green)] mb-2 line-clamp-2 font-bold leading-snug transition-colors">
                    {post.title}
                  </h3>

                  {post.excerpt && (
                    <p className="text-muted-foreground mb-4 line-clamp-2 text-xs leading-relaxed">
                      {post.excerpt}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between border-t border-border/30 pt-3 text-xs font-bold text-[var(--color-brand-green)]">
                    <span>Read Article</span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-12 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
