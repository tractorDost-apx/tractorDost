import React from 'react';
import { Search, Bell, Trash2 } from 'lucide-react';

export default function SavedSearchesPage() {
  const dummySearches = [
    {
      id: 1,
      query: 'Mahindra Tractors under ₹5,000,000',
      filters: 'Brand: Mahindra, Max Price: 5L',
      frequency: 'Daily',
      active: true,
    },
    {
      id: 2,
      query: 'John Deere in Pune',
      filters: 'Brand: John Deere, Location: Pune',
      frequency: 'Weekly',
      active: true,
    },
  ];

  return (
    <div className="animate-fade-in flex h-full flex-col">
      <div className="mb-8">
        <h1 className="text-foreground mb-2 text-3xl font-black">Saved Searches</h1>
        <p className="text-muted font-medium">Manage your search alerts and notifications.</p>
      </div>

      <div className="space-y-4">
        {dummySearches.map((search) => (
          <div
            key={search.id}
            className="glass-panel flex flex-col justify-between gap-6 rounded-2xl border border-[var(--border-subtle)] p-6 transition-colors hover:border-[var(--color-brand-green)]/30 md:flex-row md:items-center"
          >
            <div className="flex flex-1 items-start gap-4">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                <Search size={20} />
              </div>
              <div>
                <h3 className="text-foreground mb-1 text-lg font-bold">{search.query}</h3>
                <p className="text-muted mb-3 text-sm font-medium">Filters: {search.filters}</p>
                <div className="flex items-center gap-2">
                  <span className="text-muted flex items-center gap-1 rounded-md bg-[var(--border-subtle)] px-2 py-1 text-xs font-bold">
                    <Bell size={12} /> Alerts: {search.frequency}
                  </span>
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-bold ${search.active ? 'bg-lime-500/[var(--border-subtle)] text-lime-500' : 'bg-red-500/[var(--border-subtle)] text-red-500'}`}
                  >
                    {search.active ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="spatial-button-outline rounded-xl px-4 py-2 text-sm">
                View Results
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10 text-red-500 transition-colors hover:bg-red-500 hover:text-white">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
