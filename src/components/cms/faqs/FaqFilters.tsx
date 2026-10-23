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
    <div className="glass-panel flex flex-col gap-4 rounded-2xl p-4 sm:p-5 shadow-sm border border-[var(--border-subtle)]">
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
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] pl-10 pr-9 py-2.5 text-xs font-bold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="text-muted hover:text-foreground absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-foreground/5 transition-colors cursor-pointer"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Right: Published toggle segmented control */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black text-muted uppercase tracking-wider hidden sm:inline">
            Status:
          </span>
          <div className="flex items-center rounded-xl bg-foreground/[0.03] p-1 border border-[var(--border-subtle)]">
            <button
              type="button"
              onClick={() => onPublishedFilterChange('ALL')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                publishedFilter === 'ALL'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => onPublishedFilterChange('PUBLISHED')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                publishedFilter === 'PUBLISHED'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-muted hover:text-emerald-500'
              }`}
            >
              Published
            </button>
            <button
              type="button"
              onClick={() => onPublishedFilterChange('DRAFT')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                publishedFilter === 'DRAFT'
                  ? 'bg-foreground/10 text-foreground border border-[var(--border-subtle)] shadow-sm'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              Drafts
            </button>
          </div>
        </div>
      </div>

      {/* Secondary filter row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center pt-2 border-t border-[var(--border-subtle)]">
        {/* Target Type Dropdown */}
        <div className="lg:col-span-5 relative">
          <label className="mb-1 block text-[11px] font-black text-muted uppercase tracking-wider">
            Target Type
          </label>
          <div className="relative">
            <select
              value={targetTypeFilter}
              onChange={(e) => onTargetTypeChange(e.target.value as FaqTargetType | '')}
              className="w-full appearance-none rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2 text-xs font-bold text-foreground focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors cursor-pointer"
            >
              <option value="" className="bg-background text-foreground">
                All Target Types (Tractor, Loan, Brand...)
              </option>
              {FAQ_TARGET_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-background text-foreground">
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
          <label className="mb-1 block text-[11px] font-black text-muted uppercase tracking-wider">
            Category
          </label>
          <div className="relative">
            <input
              type="text"
              list="faq-category-suggestions"
              value={categoryFilter}
              onChange={(e) => onCategoryChange(e.target.value)}
              placeholder="e.g. Finance, Maintenance, Warranty..."
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3.5 py-2 text-xs font-bold text-foreground placeholder:text-muted focus:border-[var(--color-brand-green)] focus:bg-background focus:outline-none transition-colors"
            />
            <datalist id="faq-category-suggestions">
              {availableCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
            {categoryFilter && (
              <button
                onClick={() => onCategoryChange('')}
                className="text-muted hover:text-foreground absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded cursor-pointer"
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
              className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.03] px-3 py-2 text-xs font-bold text-muted hover:text-foreground transition-all w-full sm:w-auto justify-center cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          <div className="text-[11px] font-black text-muted whitespace-nowrap self-center hidden lg:block">
            Found: <span className="text-foreground font-black">{totalResults}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
