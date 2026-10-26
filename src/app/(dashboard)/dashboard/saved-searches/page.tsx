'use client';

import React, { useState } from 'react';
import { Search, Bell, Trash2, ExternalLink, PlusCircle, Filter } from 'lucide-react';
import Link from 'next/link';

interface SavedSearchItem {
  id: number;
  query: string;
  filters: string;
  frequency: string;
  active: boolean;
  targetUrl: string;
}

const INITIAL_SEARCHES: SavedSearchItem[] = [
  {
    id: 1,
    query: 'Mahindra Tractors in Maharashtra',
    filters: 'Brand: Mahindra • Max Price: ₹6,00,000',
    frequency: 'Daily',
    active: true,
    targetUrl: '/used-tractors?brand=Mahindra',
  },
  {
    id: 2,
    query: '4WD Tractors in Pune & Kolhapur',
    filters: 'Drive: 4WD • District: Pune, Kolhapur',
    frequency: 'Instant',
    active: true,
    targetUrl: '/used-tractors/4wd',
  },
  {
    id: 3,
    query: 'Swaraj 744 FE Tractors',
    filters: 'Brand: Swaraj • Model: 744 FE',
    frequency: 'Weekly',
    active: false,
    targetUrl: '/used-tractors?brand=Swaraj',
  },
];

export default function SavedSearchesPage() {
  const [searches, setSearches] = useState<SavedSearchItem[]>(INITIAL_SEARCHES);

  const handleToggleActive = (id: number) => {
    setSearches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, active: !s.active } : s))
    );
  };

  const handleDelete = (id: number) => {
    setSearches((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="animate-fade-in flex h-full flex-col space-y-6">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground mb-1 text-3xl font-black">Saved Searches & Alerts</h1>
          <p className="text-muted text-xs font-medium sm:text-sm">
            Get notified whenever a tractor matching your budget and location is posted.
          </p>
        </div>

        <Link
          href="/used-tractors"
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 active:scale-95"
        >
          <Search size={16} /> Search & Create Alert
        </Link>
      </div>

      {searches.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] mb-4">
            <Search size={32} />
          </div>
          <h3 className="text-foreground text-lg font-bold">No Saved Searches Yet</h3>
          <p className="text-muted mt-1 max-w-sm text-xs font-medium">
            Search for used tractors by brand, horsepower, or district and save your search to receive instant alerts.
          </p>
          <Link
            href="/used-tractors"
            className="mt-6 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md hover:opacity-90"
          >
            Browse Used Tractors
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {searches.map((search) => (
            <div
              key={search.id}
              className="glass-panel flex flex-col justify-between gap-6 rounded-2xl border border-[var(--border-subtle)] p-6 transition-all hover:border-[var(--color-brand-green)]/30 hover:shadow-sm md:flex-row md:items-center"
            >
              <div className="flex flex-1 items-start gap-4">
                <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                  <Search size={22} />
                </div>
                <div>
                  <h3 className="text-foreground mb-1 text-base font-black">{search.query}</h3>
                  <p className="text-muted mb-3 text-xs font-medium">Filters: {search.filters}</p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-muted flex items-center gap-1.5 rounded-lg bg-foreground/5 px-2.5 py-1 text-xs font-bold">
                      <Bell size={13} /> Frequency: {search.frequency}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleToggleActive(search.id)}
                      className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-black uppercase transition-all ${
                        search.active
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-zinc-500/10 text-zinc-400'
                      }`}
                    >
                      {search.active ? 'Active' : 'Paused (Click to activate)'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 border-t border-[var(--border-subtle)] pt-4 md:border-t-0 md:pt-0">
                <Link
                  href={search.targetUrl}
                  className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-4 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-sm transition-opacity hover:opacity-90"
                >
                  <span>View Results</span>
                  <ExternalLink size={13} />
                </Link>

                <button
                  type="button"
                  onClick={() => handleDelete(search.id)}
                  className="text-muted hover:text-red-500 hover:bg-red-500/10 rounded-xl border border-[var(--border-subtle)] p-2.5 transition-colors"
                  title="Delete Alert"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
