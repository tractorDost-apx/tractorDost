import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { DealerType, VerificationStatus } from '@/types/models/dealer';

interface DealerFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;

  stateFilter: string;
  onStateChange: (value: string) => void;

  districtFilter: string;
  onDistrictChange: (value: string) => void;

  dealerTypeFilter: DealerType | '';
  onDealerTypeChange: (value: DealerType | '') => void;

  verificationStatusFilter: VerificationStatus | '';
  onVerificationStatusChange: (value: VerificationStatus | '') => void;

  activeFilter: 'all' | 'active' | 'inactive';
  onActiveFilterChange: (value: 'all' | 'active' | 'inactive') => void;

  onResetFilters: () => void;
}

export function DealerFilters({
  search,
  onSearchChange,
  stateFilter,
  onStateChange,
  districtFilter,
  onDistrictChange,
  dealerTypeFilter,
  onDealerTypeChange,
  verificationStatusFilter,
  onVerificationStatusChange,
  activeFilter,
  onActiveFilterChange,
  onResetFilters,
}: DealerFiltersProps) {
  const isFiltered =
    !!search ||
    !!stateFilter ||
    !!districtFilter ||
    !!dealerTypeFilter ||
    !!verificationStatusFilter ||
    activeFilter !== 'all';

  return (
    <div className="glass-panel p-4 rounded-2xl flex flex-col gap-4 border border-white/5">
      <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
        {/* Search input */}
        <div className="relative w-full lg:w-96 group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted group-focus-within:text-lime-400 transition-colors">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search business name, address, district..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-foreground/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium text-foreground placeholder:text-muted focus:outline-none focus:bg-background focus:border-lime-400/50 focus:ring-2 focus:ring-lime-400/20 transition-all"
          />
        </div>

        {/* Filters dropdown row */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          <div className="flex items-center gap-2 text-xs font-bold text-muted uppercase tracking-wider">
            <Filter size={14} className="text-lime-400" />
            Filters:
          </div>

          {/* Dealer Type Filter */}
          <select
            value={dealerTypeFilter}
            onChange={(e) => onDealerTypeChange(e.target.value as DealerType | '')}
            className="bg-foreground/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-lime-400/50"
          >
            <option value="" className="bg-zinc-900 text-zinc-300">All Dealer Types</option>
            <option value="BRAND_DEALER" className="bg-zinc-900 text-zinc-300">Brand Authorized</option>
            <option value="MULTI_BRAND" className="bg-zinc-900 text-zinc-300">Multi-Brand</option>
            <option value="USED_TRACTOR_DEALER" className="bg-zinc-900 text-zinc-300">Used Tractors</option>
          </select>

          {/* Verification Status Filter */}
          <select
            value={verificationStatusFilter}
            onChange={(e) => onVerificationStatusChange(e.target.value as VerificationStatus | '')}
            className="bg-foreground/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-lime-400/50"
          >
            <option value="" className="bg-zinc-900 text-zinc-300">All Verification Statuses</option>
            <option value="VERIFIED" className="bg-zinc-900 text-zinc-300">VERIFIED</option>
            <option value="PENDING" className="bg-zinc-900 text-zinc-300">PENDING</option>
            <option value="REJECTED" className="bg-zinc-900 text-zinc-300">REJECTED</option>
          </select>

          {/* Active Status Filter */}
          <select
            value={activeFilter}
            onChange={(e) => onActiveFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
            className="bg-foreground/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground focus:outline-none focus:border-lime-400/50"
          >
            <option value="all" className="bg-zinc-900 text-zinc-300">All Operational Statuses</option>
            <option value="active" className="bg-zinc-900 text-zinc-300">Active Only</option>
            <option value="inactive" className="bg-zinc-900 text-zinc-300">Inactive Only</option>
          </select>

          {/* State Input Filter */}
          <input
            type="text"
            placeholder="Filter State..."
            value={stateFilter}
            onChange={(e) => onStateChange(e.target.value)}
            className="w-32 bg-foreground/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-lime-400/50"
          />

          {/* District Input Filter */}
          <input
            type="text"
            placeholder="Filter District..."
            value={districtFilter}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="w-32 bg-foreground/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-bold text-foreground placeholder:text-muted focus:outline-none focus:border-lime-400/50"
          />

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all flex items-center gap-1.5"
            >
              <RotateCcw size={13} />
              Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
