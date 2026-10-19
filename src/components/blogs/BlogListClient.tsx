'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, Sparkles, BookOpen, AlertCircle, X } from 'lucide-react';
import { cmsAPI, ContentPost, ContentCategory } from '@/lib/api/cms';
import PostCard from './PostCard';
import PostFilters, { PostFiltersState } from './PostFilters';
import Pagination from '@/components/shared/Pagination';

export default function BlogListClient() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filters, setFilters] = useState<PostFiltersState>({
    categoryId: '',
    language: '',
    postType: '',
    sortBy: 'latest',
  });

  // Pagination State
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load categories for filter bar
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

  // Fetch posts from API
  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      // Map sort option to backend params
      let sortBy: 'publishedAt' | 'viewsCount' | 'createdAt' = 'publishedAt';
      let isTrending: boolean | undefined = undefined;

      if (filters.sortBy === 'views') {
        sortBy = 'viewsCount';
      } else if (filters.sortBy === 'trending') {
        isTrending = true;
      }

      const res = await cmsAPI.getPosts({
        page,
        limit,
        status: 'PUBLISHED',
        search: debouncedSearch || undefined,
        categoryId: filters.categoryId === '' ? undefined : Number(filters.categoryId),
        language: filters.language || undefined,
        postType: filters.postType || undefined,
        isTrending,
        sortBy,
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
  }, [page, limit, debouncedSearch, filters]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleFilterChange = (newFilters: PostFiltersState) => {
    setFilters(newFilters);
    setPage(1);
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-3xl p-8 sm:p-12 text-center border border-zinc-200 bg-white/70 dark:border-white/10 dark:bg-gradient-to-b dark:from-white/[0.04] dark:to-transparent shadow-sm dark:shadow-2xl">
        <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-64 w-96 rounded-full bg-[var(--color-brand-green)]/15 blur-[80px]" />

        <div className="relative z-10 mx-auto max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-bold text-[var(--color-brand-green)] mb-4">
            <Sparkles size={14} />
            <span>TRACTORDOST KNOWLEDGE HUB</span>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-5xl leading-tight">
            Farming Insights, Tractor Guides & Industry News
          </h1>

          <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-muted leading-relaxed max-w-2xl">
            Explore trusted buying advice, tractor comparisons, maintenance guides, and agricultural
            advancements written for Indian farmers and tractor owners.
          </p>

          {/* Hero Search Bar */}
          <div className="mt-8 relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-muted" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by topic, tractor model, or guide name..."
              className="w-full rounded-2xl border border-zinc-300 bg-white pl-12 pr-10 py-3.5 text-sm text-zinc-900 placeholder-zinc-400 shadow-sm focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20 focus:outline-none dark:border-white/15 dark:bg-black/60 dark:text-white dark:placeholder-white/40 dark:shadow-inner backdrop-blur-md"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 dark:text-muted dark:hover:text-white"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <PostFilters
        filters={filters}
        onChange={handleFilterChange}
        categories={categories}
        totalResults={totalCount}
      />

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="h-96 rounded-2xl animate-pulse bg-zinc-100 border border-zinc-200 dark:bg-white/5 dark:border-white/5"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl p-16 text-center border border-zinc-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#121814]/40 dark:shadow-xl">
          <BookOpen size={48} className="text-[var(--color-brand-green)]/40 mb-3" />
          <h3 className="text-xl font-black text-zinc-900 dark:text-white">No blog posts found</h3>
          <p className="mt-2 text-xs text-zinc-500 dark:text-muted max-w-md">
            We couldn't find any articles matching your search criteria or filters. Try adjusting your search query or reset the filters.
          </p>
          {(searchQuery || filters.categoryId || filters.language || filters.postType) && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ categoryId: '', language: '', postType: '', sortBy: 'latest' });
              }}
              className="mt-5 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-90 transition-all"
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Main Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>

          {/* Pagination */}
          <Pagination
            page={page}
            limit={limit}
            totalCount={totalCount}
            totalPages={totalPages}
            onPageChange={(p) => {
              setPage(p);
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
