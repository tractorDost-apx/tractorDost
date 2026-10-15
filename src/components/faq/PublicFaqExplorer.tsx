'use client';

import React, { useState, useMemo, useDeferredValue } from 'react';
import { Search, X, HelpCircle } from 'lucide-react';
import { FAQ, FaqTargetType, FAQ_TARGET_TYPES } from '@/lib/api/faq';
import FaqAccordion from '@/components/homepage/FaqAccordion';

export interface PublicFaqExplorerProps {
  faqs: FAQ[];
}

export default function PublicFaqExplorer({ faqs }: PublicFaqExplorerProps) {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [selectedTargetType, setSelectedTargetType] = useState<FaqTargetType | 'ALL'>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Extract distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => {
      if (f.category?.trim()) {
        set.add(f.category.trim());
      }
    });
    return Array.from(set).sort();
  }, [faqs]);

  // Filter FAQs based on search and selected category/target
  const filteredFaqs = useMemo(() => {
    return faqs.filter((faq) => {
      // Target Type filter
      if (selectedTargetType !== 'ALL' && faq.targetType !== selectedTargetType) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && faq.category !== selectedCategory) {
        return false;
      }

      // Text search
      if (deferredSearch.trim()) {
        const query = deferredSearch.toLowerCase().trim();
        const matchesQuestion = faq.question.toLowerCase().includes(query);
        const matchesAnswer = faq.answer.toLowerCase().includes(query);
        const matchesCat = faq.category?.toLowerCase().includes(query);
        return matchesQuestion || matchesAnswer || matchesCat;
      }

      return true;
    });
  }, [faqs, selectedTargetType, selectedCategory, deferredSearch]);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Search Bar */}
      <div className="relative w-full max-w-2xl mx-auto">
        <Search
          size={18}
          className="text-muted absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search any question, loan, inspection, or brand topic..."
          className="w-full rounded-2xl border border-[var(--border-subtle)] bg-background/80 pl-11 pr-10 py-3.5 text-xs sm:text-sm text-foreground placeholder:text-muted/60 backdrop-blur-md focus:border-[var(--color-brand-green)] focus:ring-1 focus:ring-[var(--color-brand-green)] focus:outline-none transition-all shadow-sm"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="text-muted hover:text-foreground absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-foreground/5 transition-colors"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Target Type Filters Pills */}
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <button
          type="button"
          onClick={() => setSelectedTargetType('ALL')}
          className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
            selectedTargetType === 'ALL'
              ? 'bg-[var(--color-brand-green)] text-white shadow-md'
              : 'border border-[var(--border-subtle)] bg-background/60 text-muted hover:border-[var(--color-brand-green)]/40 hover:text-foreground'
          }`}
        >
          All Topics
        </button>
        {FAQ_TARGET_TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setSelectedTargetType(t.value)}
            className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
              selectedTargetType === t.value
                ? 'bg-[var(--color-brand-green)] text-white shadow-md'
                : 'border border-[var(--border-subtle)] bg-background/60 text-muted hover:border-[var(--color-brand-green)]/40 hover:text-foreground'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Categories sub-filter if present */}
      {categories.length > 0 && (
        <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1 text-[11px]">
          <span className="text-muted font-bold mr-1">Categories:</span>
          <button
            type="button"
            onClick={() => setSelectedCategory('ALL')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-foreground/10 text-foreground'
                : 'text-muted hover:text-foreground'
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg font-bold transition-colors ${
                selectedCategory === cat
                  ? 'bg-foreground/10 text-foreground'
                  : 'text-muted hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Results Count & Accordion */}
      <div className="mt-4">
        <div className="mb-4 flex items-center justify-between text-xs text-muted font-bold px-1">
          <span>
            Showing <strong className="text-foreground">{filteredFaqs.length}</strong>{' '}
            {filteredFaqs.length === 1 ? 'question' : 'questions'}
          </span>
          {(search || selectedTargetType !== 'ALL' || selectedCategory !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedTargetType('ALL');
                setSelectedCategory('ALL');
              }}
              className="text-[var(--color-brand-green)] hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-[var(--border-subtle)] bg-background/40">
            <HelpCircle size={40} className="mx-auto text-muted/40 mb-3" />
            <h3 className="text-sm font-bold text-foreground">No questions found</h3>
            <p className="text-xs text-muted mt-1">
              Try adjusting your search terms or filter selection.
            </p>
          </div>
        ) : (
          <FaqAccordion faqs={filteredFaqs} defaultOpenIndex={0} />
        )}
      </div>
    </div>
  );
}
