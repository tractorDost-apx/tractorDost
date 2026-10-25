import React from 'react';
import { Filter, RotateCcw, Search } from 'lucide-react';

interface DepartmentFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  isActive: boolean | undefined;
  onIsActiveChange: (value: boolean | undefined) => void;
  onResetFilters: () => void;
}

const selectClassName =
  'bg-foreground/5 text-foreground rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold focus:border-lime-400/50 focus:outline-none';

export function DepartmentFilters({
  search,
  onSearchChange,
  isActive,
  onIsActiveChange,
  onResetFilters,
}: DepartmentFiltersProps) {
  const isFiltered = !!search || isActive !== undefined;

  return (
    <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="group relative w-full xl:w-96">
          <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors group-focus-within:text-lime-400">
            <Search size={16} />
          </div>
          <input
            type="search"
            placeholder="Search by name or description..."
            value={search}
            maxLength={100}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search departments"
            className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-xl border border-[var(--border-subtle)] py-2.5 pr-4 pl-10 text-sm font-medium transition-all focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 focus:outline-none"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
          <div className="text-muted flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
            <Filter size={14} className="text-lime-400" />
            Filters:
          </div>

          <select
            value={isActive === undefined ? '' : String(isActive)}
            onChange={(e) => {
              if (e.target.value === '') onIsActiveChange(undefined);
              else onIsActiveChange(e.target.value === 'true');
            }}
            className={selectClassName}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            <option value="true">Active only</option>
            <option value="false">Inactive only</option>
          </select>

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 transition-all hover:bg-rose-500/20"
            >
              <RotateCcw size={13} />
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
