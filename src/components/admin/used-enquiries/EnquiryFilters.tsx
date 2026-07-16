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
    <div className="flex flex-col xl:flex-row justify-between items-center gap-4 bg-foreground/5 p-2 rounded-2xl border border-[var(--border-subtle)]">
      <div className="flex w-full xl:w-auto overflow-x-auto no-scrollbar gap-1">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 rounded-xl text-xs font-black tracking-wider uppercase transition-all whitespace-nowrap ${
              activeTab === tab
                ? 'bg-background text-foreground shadow-sm border border-[var(--border-subtle)]'
                : 'text-muted hover:text-foreground hover:bg-foreground/5'
            }`}
          >
            {tab === 'ALL' ? 'All Leads' : tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row w-full xl:w-auto items-center gap-3 shrink-0">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by name or mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-[var(--border-subtle)] rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-[var(--color-brand-green)]/20"
          />
        </div>

        <div className="relative w-full sm:w-56">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={16} />
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-background border border-[var(--border-subtle)] rounded-xl text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-[var(--color-brand-green)]/20 appearance-none"
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
