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
    <div className="glass-panel flex flex-col gap-4 rounded-2xl  p-4">
      <div className="flex flex-col items-center justify-between gap-4 lg:flex-row">
        {/* Search input */}
        <div className="group relative w-full lg:w-96">
          <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors group-focus-within:text-[#4a7635]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search business name, address, district..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-xl border border-[var(--border-subtle)] py-2.5 pr-4 pl-10 text-sm font-medium transition-all focus:border-[#4a7635]/50 focus:ring-2 focus:ring-[#4a7635]/20 focus:outline-none"
          />
        </div>

        {/* Filters dropdown row */}
        <div className="flex w-full flex-wrap items-center gap-3 lg:w-auto">
          <div className="text-muted flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
            <Filter size={14} className="text-[#4a7635]" />
            Filters:
          </div>

          {/* Dealer Type Filter */}
          <select
            value={dealerTypeFilter}
            onChange={(e) => onDealerTypeChange(e.target.value as DealerType | '')}
            className="bg-foreground/5 text-foreground rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold focus:border-[#4a7635]/50 focus:outline-none"
          >
            <option value="" className="bg-foreground/5 text-muted">
              All Dealer Types
            </option>
            <option value="BRAND_DEALER" className="bg-foreground/5 text-muted">
              Brand Authorized
            </option>
            <option value="MULTI_BRAND" className="bg-foreground/5 text-muted">
              Multi-Brand
            </option>
            <option value="USED_TRACTOR_DEALER" className="bg-foreground/5 text-muted">
              Used Tractors
            </option>
          </select>

          {/* Verification Status Filter */}
          <select
            value={verificationStatusFilter}
            onChange={(e) => onVerificationStatusChange(e.target.value as VerificationStatus | '')}
            className="bg-foreground/5 text-foreground rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold focus:border-[#4a7635]/50 focus:outline-none"
          >
            <option value="" className="bg-foreground/5 text-muted">
              All Verification Statuses
            </option>
            <option value="VERIFIED" className="bg-foreground/5 text-muted">
              VERIFIED
            </option>
            <option value="PENDING" className="bg-foreground/5 text-muted">
              PENDING
            </option>
            <option value="REJECTED" className="bg-foreground/5 text-muted">
              REJECTED
            </option>
          </select>

          {/* Active Status Filter */}
          <select
            value={activeFilter}
            onChange={(e) => onActiveFilterChange(e.target.value as 'all' | 'active' | 'inactive')}
            className="bg-foreground/5 text-foreground rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold focus:border-[#4a7635]/50 focus:outline-none"
          >
            <option value="all" className="bg-foreground/5 text-muted">
              All Operational Statuses
            </option>
            <option value="active" className="bg-foreground/5 text-muted">
              Active Only
            </option>
            <option value="inactive" className="bg-foreground/5 text-muted">
              Inactive Only
            </option>
          </select>

          {/* State Input Filter */}
          <input
            type="text"
            placeholder="Filter State..."
            value={stateFilter}
            onChange={(e) => onStateChange(e.target.value)}
            className="bg-foreground/5 text-foreground placeholder:text-muted w-32 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold focus:border-[#4a7635]/50 focus:outline-none"
          />

          {/* District Input Filter */}
          <input
            type="text"
            placeholder="Filter District..."
            value={districtFilter}
            onChange={(e) => onDistrictChange(e.target.value)}
            className="bg-foreground/5 text-foreground placeholder:text-muted w-32 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold focus:border-[#4a7635]/50 focus:outline-none"
          />

          {/* Reset Filters button */}
          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 transition-all hover:bg-rose-500/20"
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
