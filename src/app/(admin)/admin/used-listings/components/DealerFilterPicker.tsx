'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Search, Store, X } from 'lucide-react';
import { dealerAPI } from '@/lib/api/dealers';
import type { Dealer } from '@/types/models/dealer';
import { useDebounce } from '@/hooks/ui/use-debounce';
import { useDealerName } from '@/hooks/dealers/use-dealer-name';

interface DealerFilterPickerProps {
  /** Selected dealer profile id, or null for every dealer */
  value: number | null;
  onChange: (dealerId: number | null) => void;
}

type DealerOption = Pick<Dealer, 'id' | 'businessName' | 'district' | 'state'>;

/**
 * Searchable dealer filter. Matches on business name, location and pincode through the existing
 * dealer list endpoint. A numeric query also looks up that dealer id. Phone is not searchable:
 * dealer phone numbers are encrypted at rest and cannot be matched.
 */
export function DealerFilterPicker({ value, onChange }: DealerFilterPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const term = useDebounce(query.trim(), 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedName = useDealerName(value);
  // Results are stored with the term they answer, so stale results are never shown for a new term
  const [result, setResult] = useState<{
    term: string;
    options: DealerOption[];
    failed: boolean;
  } | null>(null);

  useEffect(() => {
    if (!open || term === '') return;

    let cancelled = false;

    const byName = dealerAPI
      .getAllDealers({ search: term, limit: 8 })
      .then((res) => res.data.data)
      .catch(() => null);
    const byId = /^\d+$/.test(term)
      ? dealerAPI
          .getDealerById(Number(term))
          .then((res) => (res.success ? [res.data] : []))
          .catch(() => [])
      : Promise.resolve<Dealer[]>([]);

    Promise.all([byName, byId]).then(([named, idMatches]) => {
      if (cancelled) return;
      if (named === null) {
        setResult({ term, options: [], failed: true });
        return;
      }
      const seen = new Set<number>();
      const merged = [...idMatches, ...named].filter((dealer) => {
        if (seen.has(dealer.id)) return false;
        seen.add(dealer.id);
        return true;
      });
      setResult({ term, options: merged, failed: false });
    });

    return () => {
      cancelled = true;
    };
  }, [open, term]);

  const current = result?.term === term ? result : null;
  const searching = open && term !== '' && current === null;
  const options = current?.options ?? [];
  const failed = current?.failed ?? false;

  useEffect(() => {
    if (!open) return;
    const handleMouseDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open]);

  const choose = (dealer: DealerOption) => {
    onChange(dealer.id);
    setQuery('');
    setOpen(false);
  };

  if (value !== null) {
    return (
      <div className="flex items-center justify-between gap-2 rounded-xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/5 px-3.5 py-2.5">
        <span className="text-foreground flex min-w-0 items-center gap-2 text-xs font-bold">
          <Store size={14} className="shrink-0 text-[var(--color-brand-green)]" />
          <span className="truncate">{selectedName ?? `Dealer #${value}`}</span>
        </span>
        <button
          type="button"
          onClick={() => onChange(null)}
          className="text-muted hover:text-foreground hover:bg-foreground/10 rounded-lg p-0.5"
          aria-label="Remove dealer filter"
        >
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <Search size={14} className="text-muted pointer-events-none absolute top-3 left-3" />
      <input
        type="text"
        value={query}
        onFocus={() => setOpen(true)}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Escape' && open) {
            e.stopPropagation();
            setOpen(false);
          }
        }}
        maxLength={100}
        placeholder="Search dealer by name, place or ID..."
        aria-expanded={open}
        role="combobox"
        aria-controls="dealer-filter-options"
        className="text-foreground bg-foreground/5 w-full rounded-xl border border-[var(--border-subtle)] py-2.5 pr-3 pl-9 text-xs font-bold outline-none focus:border-[var(--color-brand-green)] focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
      />
      {open && term !== '' && (
        <div
          id="dealer-filter-options"
          role="listbox"
          className="absolute top-full right-0 left-0 z-20 mt-1 max-h-64 overflow-y-auto rounded-xl border border-[var(--border-subtle)] bg-[var(--background)] p-1 shadow-2xl"
        >
          {searching && options.length === 0 ? (
            <div className="text-muted flex items-center gap-2 px-3 py-2.5 text-xs font-bold">
              <Loader2 size={14} className="animate-spin" />
              Searching...
            </div>
          ) : failed ? (
            <div className="px-3 py-2.5 text-xs font-bold text-rose-400">
              Could not search dealers.
            </div>
          ) : options.length === 0 ? (
            <div className="text-muted px-3 py-2.5 text-xs font-bold">
              No dealers match &quot;{term}&quot;
            </div>
          ) : (
            options.map((dealer) => (
              <button
                key={dealer.id}
                type="button"
                role="option"
                aria-selected={false}
                onClick={() => choose(dealer)}
                className="hover:bg-foreground/10 flex w-full items-start justify-between gap-2 rounded-lg px-3 py-2 text-left transition-colors"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-foreground truncate text-xs font-bold">
                    {dealer.businessName}
                  </span>
                  <span className="text-muted truncate text-[10px] font-medium">
                    {[dealer.district, dealer.state].filter(Boolean).join(', ') || '—'}
                  </span>
                </span>
                <span className="text-muted shrink-0 font-mono text-[10px]">#{dealer.id}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
