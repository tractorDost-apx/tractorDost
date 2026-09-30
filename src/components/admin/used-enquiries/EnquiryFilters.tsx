import React from 'react';
import { Search, ArrowUpDown } from 'lucide-react';

interface EnquiryFiltersProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortOption: string;
  setSortOption: (option: string) => void;
}

export const EnquiryFilters: React.FC<EnquiryFiltersProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
}) => {
  const tabs = ['ALL', 'NEW', 'ATTEMPTED', 'CONTACTED', 'QUALIFIED', 'LOST', 'SPAM'];

  return (
    <div className="bg-foreground/5 flex flex-col items-center justify-between gap-4 rounded-2xl border border-[var(--border-subtle)] p-2 xl:flex-row">
      <div className="no-scrollbar flex w-full gap-1 overflow-x-auto xl:w-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-xl px-4 py-2.5 text-xs font-black tracking-wider whitespace-nowrap uppercase transition-all ${
              activeTab === tab
                ? 'bg-background text-foreground border border-[var(--border-subtle)] shadow-sm'
                : 'text-muted hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            {tab === 'ALL' ? 'All Leads' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="flex w-full shrink-0 flex-col items-center gap-3 sm:flex-row xl:w-auto">
        <div className="relative w-full sm:w-72">
          <Search className="text-muted absolute top-1/2 left-3 -translate-y-1/2" size={18} />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background w-full rounded-xl border border-[var(--border-subtle)] py-2.5 pr-4 pl-10 text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
          />
        </div>

        <div className="relative w-full sm:w-56">
          <ArrowUpDown className="text-muted absolute top-1/2 left-3 -translate-y-1/2" size={16} />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="bg-background w-full cursor-pointer appearance-none rounded-xl border border-[var(--border-subtle)] py-2.5 pr-4 pl-10 text-sm font-bold outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="status-asc">Status (A-Z)</option>
            <option value="status-desc">Status (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};
