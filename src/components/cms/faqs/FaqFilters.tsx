'use client';

import React from 'react';
import { Search, RotateCcw, X, Layers } from 'lucide-react';
import { FaqTargetType, FAQ_TARGET_TYPES } from '@/lib/api/faq';

export type PublishedFilterState = 'ALL' | 'PUBLISHED' | 'DRAFT';

interface FaqFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  targetTypeFilter: FaqTargetType | '';
  onTargetTypeChange: (value: FaqTargetType | '') => void;
  categoryFilter: string;
  onCategoryChange: (value: string) => void;
  publishedFilter: PublishedFilterState;
  onPublishedFilterChange: (value: PublishedFilterState) => void;
  onReset: () => void;
  availableCategories: string[];
  totalResults: number;
}

export default function FaqFilters({
  searchQuery,
  onSearchChange,
  targetTypeFilter,
  onTargetTypeChange,
  categoryFilter,
  onCategoryChange,
  publishedFilter,
  onPublishedFilterChange,
  onReset,
  availableCategories,
  totalResults,
}: FaqFiltersProps) {
  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
      targetTypeFilter ||
      categoryFilter.trim() ||
      publishedFilter !== 'ALL'
  );

  return (
    <div className="glass-panel mb-6 flex flex-col gap-4 rounded-2xl p-4 sm:p-5 shadow-lg border border-white/10">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Left: Search input */}
        <div className="relative flex-1">
          <Search
            size={16}
            className="text-muted pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search questions, answers or slugs..."
            className="w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-9 py-2.5 text-xs font-medium text-white placeholder-white/40 focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-muted hover:text-white absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-white/10 transition-colors"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right: Published toggle segmented control */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-muted uppercase tracking-wider hidden sm:inline">
            Status:
          </span>
          <div className="flex items-center rounded-xl bg-black/40 p-1 border border-white/10">
            <button
              type="button"
              onClick={() => onPublishedFilterChange('ALL')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                publishedFilter === 'ALL'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-muted hover:text-white'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onPublishedFilterChange('PUBLISHED')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                publishedFilter === 'PUBLISHED'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-muted hover:text-emerald-400'
              }`}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => onPublishedFilterChange('DRAFT')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                publishedFilter === 'DRAFT'
                  ? 'bg-zinc-500/20 text-zinc-300 border border-zinc-500/30 shadow-sm'
                  : 'text-muted hover:text-zinc-300'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>
      </div>

      {/* Secondary filter row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center pt-2 border-t border-white/5">
        {/* Target Type Dropdown */}
        <div className="lg:col-span-5 relative">
          <label className="mb-1 block text-[11px] font-bold text-muted">
            Target Type
          </label>
          <div className="relative">
            <select
              value={targetTypeFilter}
              onChange={(e) => onTargetTypeChange(e.target.value as FaqTargetType | '')}
              className="w-full appearance-none rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-bold text-white focus:border-[var(--color-brand-green)] focus:outline-none transition-all cursor-pointer"
            >
              <option value="" className="bg-zinc-900 text-white">
                All Target Types (Tractor, Loan, Brand...)
              </option>
              {FAQ_TARGET_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-zinc-900 text-white">
                  {t.label} ({t.value})
                </option>
              ))}
            </select>
            <Layers
              size={14}
              className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
          </div>
        </div>

        {/* Category Input / Auto-suggest */}
        <div className="lg:col-span-5 relative">
          <label className="mb-1 block text-[11px] font-bold text-muted">
            Category
          </label>
          <div className="relative">
            <input
              type="text"
              list="faq-category-suggestions"
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              placeholder="e.g. Finance, Maintenance, Warranty..."
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs text-white placeholder-white/30 focus:border-[var(--color-brand-green)] focus:outline-none transition-all"
            />
            <datalist id="faq-category-suggestions">
              {availableCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            {categoryFilter && (
              <button
                onClick={() => onCategoryChange('')}
                className="text-muted hover:text-white absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded"
                title="Clear category filter"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons: Reset & Summary */}
        <div className="lg:col-span-2 flex items-end justify-between sm:justify-end gap-2 pt-5 sm:pt-0">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold text-muted hover:bg-white/10 hover:text-white transition-all w-full sm:w-auto justify-center"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          <div className="text-[11px] font-bold text-muted whitespace-nowrap self-center hidden lg:block">
            Found: <span className="text-white font-extrabold">{totalResults}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
