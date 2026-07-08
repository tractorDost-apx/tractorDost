import React from 'react';
import { Search, Bell, Trash2 } from 'lucide-react';

export default function SavedSearchesPage() {
  const dummySearches = [
    { id: 1, query: 'Mahindra Tractors under ₹5,000,000', filters: 'Brand: Mahindra, Max Price: 5L', frequency: 'Daily', active: true },
    { id: 2, query: 'John Deere in Pune', filters: 'Brand: John Deere, Location: Pune', frequency: 'Weekly', active: true },
  ];

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-foreground mb-2">Saved Searches</h1>
        <p className="text-muted font-medium">Manage your search alerts and notifications.</p>
      </div>

      <div className="space-y-4">
        {dummySearches.map((search) => (
          <div key={search.id} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-[var(--border-subtle)] hover:border-[var(--color-brand-green)]/30 transition-colors">
            <div className="flex items-start gap-4 flex-1">
              <div className="h-10 w-10 rounded-full bg-[var(--color-brand-green)]/10 flex items-center justify-center flex-shrink-0 text-[var(--color-brand-green)] mt-1">
                <Search size={20} />
              </div>
              <div>
                <h3 className="font-bold text-foreground text-lg mb-1">{search.query}</h3>
                <p className="text-muted font-medium text-sm mb-3">Filters: {search.filters}</p>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-bold bg-[var(--border-subtle)] px-2 py-1 rounded-md text-muted">
                    <Bell size={12} /> Alerts: {search.frequency}
                  </span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-md ${search.active ? 'bg-lime-500/[var(--border-subtle)] text-lime-500' : 'bg-red-500/[var(--border-subtle)] text-red-500'}`}>
                    {search.active ? 'Active' : 'Paused'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="spatial-button-outline px-4 py-2 rounded-xl text-sm">
                View Results
              </button>
              <button className="h-10 w-10 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
