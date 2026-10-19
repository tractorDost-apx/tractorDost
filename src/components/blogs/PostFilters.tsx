'use client';

import React from 'react';
import { Filter, X, ArrowUpDown, Globe, Tag, Layers, Check } from 'lucide-react';
import { ContentCategory, ContentType, Language } from '@/lib/api/cms';

export type SortOption = 'latest' | 'views' | 'trending';

export interface PostFiltersState {
  categoryId: number | '';
  language: Language | '';
  postType: ContentType | '';
  sortBy: SortOption;
}

interface PostFiltersProps {
  filters: PostFiltersState;
  onChange: (filters: PostFiltersState) => void;
  categories: ContentCategory[];
  totalResults: number;
}

const LANGUAGES: { code: Language; label: string; native: string }[] = [
  { code: 'EN', label: 'English', native: 'English' },
  { code: 'HI', label: 'Hindi', native: 'हिन्दी' },
  { code: 'MR', label: 'Marathi', native: 'मराठी' },
  { code: 'TE', label: 'Telugu', native: 'తెలుగు' },
  { code: 'TA', label: 'Tamil', native: 'தமிழ்' },
  { code: 'PB', label: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
  { code: 'BN', label: 'Bengali', native: 'বাংলা' },
  { code: 'GU', label: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'KN', label: 'Kannada', native: 'ಕನ್ನಡ' },
];

const POST_TYPES: { type: ContentType; label: string }[] = [
  { type: 'BLOG', label: 'Blog' },
  { type: 'NEWS', label: 'News' },
  { type: 'BUYING_GUIDE', label: 'Buying Guide' },
  { type: 'COMPARISON', label: 'Comparison' },
  { type: 'VIDEO', label: 'Video' },
  { type: 'WEB_STORY', label: 'Web Story' },
];

export default function PostFilters({
  filters,
  onChange,
  categories,
  totalResults,
}: PostFiltersProps) {
  const [isOpenMobile, setIsOpenMobile] = React.useState(false);

  const hasActiveFilters = Boolean(
    filters.categoryId !== '' ||
      filters.language !== '' ||
      filters.postType !== '' ||
      filters.sortBy !== 'latest'
  );

  const resetFilters = () => {
    onChange({
      categoryId: '',
      language: '',
      postType: '',
      sortBy: 'latest',
    });
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Top Filter Bar Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-zinc-500 dark:text-muted">
            Found <strong className="text-zinc-900 dark:text-white">{totalResults}</strong> articles
          </span>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-lg bg-zinc-100 dark:bg-white/5 px-2.5 py-1 text-[11px] font-bold text-[var(--color-brand-green)] hover:bg-zinc-200 dark:hover:bg-white/10 transition-all border border-zinc-200 dark:border-transparent"
            >
              <X size={12} />
              Reset Filters
            </button>
          )}
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="flex items-center gap-2 rounded-xl bg-zinc-100 border border-zinc-200 dark:border-transparent px-4 py-2 text-xs font-bold text-zinc-800 dark:bg-white/5 dark:text-white sm:hidden shadow-sm"
        >
          <Filter size={14} className="text-[var(--color-brand-green)]" />
          <span>Filters & Sort</span>
          {hasActiveFilters && (
            <span className="h-2 w-2 rounded-full bg-[var(--color-brand-green)]" />
          )}
        </button>
      </div>

      {/* Filter Controls (Collapsible on mobile, always visible on sm+) */}
      <div
        className={`rounded-2xl p-4 shadow-sm border border-zinc-200 bg-white dark:border-white/10 dark:bg-[#121814]/60 dark:shadow-xl ${
          isOpenMobile ? 'block' : 'hidden sm:block'
        }`}
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Category Filter */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 dark:text-muted uppercase tracking-wider">
              <Tag size={13} className="text-[var(--color-brand-green)]" />
              Category
            </label>
            <select
              value={filters.categoryId}
              onChange={(e) =>
                onChange({
                  ...filters,
                  categoryId: e.target.value === '' ? '' : Number(e.target.value),
                })
              }
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black/40 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:border-[var(--color-brand-green)] focus:outline-none"
            >
              <option value="" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
                  {cat.name} ({cat.postType})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Language Filter */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 dark:text-muted uppercase tracking-wider">
              <Globe size={13} className="text-[var(--color-brand-green)]" />
              Language
            </label>
            <select
              value={filters.language}
              onChange={(e) =>
                onChange({
                  ...filters,
                  language: e.target.value as Language | '',
                })
              }
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black/40 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:border-[var(--color-brand-green)] focus:outline-none"
            >
              <option value="" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">All Languages</option>
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
                  {l.native} ({l.label})
                </option>
              ))}
            </select>
          </div>

          {/* 3. Post Type Filter */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 dark:text-muted uppercase tracking-wider">
              <Layers size={13} className="text-[var(--color-brand-green)]" />
              Post Type
            </label>
            <select
              value={filters.postType}
              onChange={(e) =>
                onChange({
                  ...filters,
                  postType: e.target.value as ContentType | '',
                })
              }
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black/40 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:border-[var(--color-brand-green)] focus:outline-none"
            >
              <option value="" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">All Post Types</option>
              {POST_TYPES.map((pt) => (
                <option key={pt.type} value={pt.type} className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">
                  {pt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Sort By */}
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold text-zinc-600 dark:text-muted uppercase tracking-wider">
              <ArrowUpDown size={13} className="text-[var(--color-brand-green)]" />
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onChange({
                  ...filters,
                  sortBy: e.target.value as SortOption,
                })
              }
              className="w-full rounded-xl border border-zinc-200 bg-zinc-50 dark:border-white/10 dark:bg-black/40 px-3 py-2 text-xs font-bold text-zinc-900 dark:text-white focus:border-[var(--color-brand-green)] focus:outline-none"
            >
              <option value="latest" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Latest Published</option>
              <option value="views" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Most Viewed</option>
              <option value="trending" className="bg-white text-zinc-900 dark:bg-zinc-900 dark:text-white">Trending Now</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
