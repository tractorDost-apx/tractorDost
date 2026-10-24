import React from 'react';
import {
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Filter,
  RotateCcw,
  Search,
  UserRound,
  X,
} from 'lucide-react';
import type {
  Department,
  EmployeeSortBy,
  EmployeeStatus,
  SortOrder,
} from '@/types/models/employee';
import {
  EMPLOYEE_SORT_OPTIONS,
  EMPLOYEE_STATUS_META,
  EMPLOYEE_STATUS_ORDER,
} from '@/lib/utils/employee-format';

export interface ManagerFilter {
  id: number;
  label: string;
}

interface EmployeeFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  status: EmployeeStatus | '';
  onStatusChange: (value: EmployeeStatus | '') => void;
  departmentId: number | null;
  onDepartmentChange: (value: number | null) => void;
  departments: Department[] | null;
  departmentsLoading: boolean;
  departmentsError: string | null;
  manager: ManagerFilter | null;
  onManagerClear: () => void;
  sortBy: EmployeeSortBy;
  onSortByChange: (value: EmployeeSortBy) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (value: SortOrder) => void;
  onResetFilters: () => void;
}

const selectClassName =
  'bg-foreground/5 text-foreground rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold focus:border-lime-400/50 focus:outline-none disabled:opacity-50';

export function EmployeeFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
  departmentId,
  onDepartmentChange,
  departments,
  departmentsLoading,
  departmentsError,
  manager,
  onManagerClear,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onResetFilters,
}: EmployeeFiltersProps) {
  const isFiltered =
    !!search ||
    !!status ||
    departmentId !== null ||
    manager !== null ||
    sortBy !== 'createdAt' ||
    sortOrder !== 'desc';

  return (
    <div className="glass-panel flex flex-col gap-3 rounded-2xl p-4">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        <div className="group relative w-full xl:w-96">
          <div className="text-muted pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 transition-colors group-focus-within:text-lime-400">
            <Search size={16} />
          </div>
          <input
            type="search"
            placeholder="Search name, code or designation..."
            value={search}
            maxLength={100}
            onChange={(e) => onSearchChange(e.target.value)}
            aria-label="Search employees"
            className="bg-foreground/5 text-foreground placeholder:text-muted focus:bg-background w-full rounded-xl border border-[var(--border-subtle)] py-2.5 pr-4 pl-10 text-sm font-medium transition-all focus:border-lime-400/50 focus:ring-1 focus:ring-lime-400/50 focus:outline-none"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 xl:w-auto xl:justify-end">
          <div className="text-muted flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
            <Filter size={14} className="text-lime-400" />
            Filters:
          </div>

          <select
            value={status}
            onChange={(e) => onStatusChange(e.target.value as EmployeeStatus | '')}
            className={selectClassName}
            aria-label="Filter by status"
          >
            <option value="">All statuses</option>
            {EMPLOYEE_STATUS_ORDER.map((s) => (
              <option key={s} value={s}>
                {EMPLOYEE_STATUS_META[s].label}
              </option>
            ))}
          </select>

          <select
            value={departmentId ?? ''}
            onChange={(e) => onDepartmentChange(e.target.value ? Number(e.target.value) : null)}
            disabled={departmentsLoading && !departments}
            className={`${selectClassName} max-w-[200px]`}
            aria-label="Filter by department"
            title={departmentsError ?? undefined}
          >
            <option value="">
              {departmentsError && !departments
                ? 'Departments unavailable'
                : departmentsLoading && !departments
                  ? 'Loading departments...'
                  : 'All departments'}
            </option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d.isActive ? '' : ' (inactive)'}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as EmployeeSortBy)}
            className={selectClassName}
            aria-label="Sort by"
          >
            {EMPLOYEE_SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                Sort: {o.label}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="text-foreground bg-foreground/5 flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-3 py-2 text-xs font-bold transition-colors hover:border-lime-400/40"
            title={
              sortOrder === 'asc'
                ? 'Ascending — click for descending'
                : 'Descending — click for ascending'
            }
          >
            {sortOrder === 'asc' ? (
              <ArrowUpNarrowWide size={14} />
            ) : (
              <ArrowDownWideNarrow size={14} />
            )}
            {sortOrder === 'asc' ? 'Asc' : 'Desc'}
          </button>

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

      <div className="flex flex-wrap items-center gap-2">
        {manager && (
          <span className="flex items-center gap-1.5 rounded-xl border border-lime-400/30 bg-lime-400/10 py-1 pr-1 pl-2.5 text-xs font-bold text-lime-400">
            <UserRound size={12} />
            Reporting to {manager.label}
            <button
              type="button"
              onClick={onManagerClear}
              className="rounded-lg p-0.5 hover:bg-lime-400/20"
              aria-label="Clear reporting manager filter"
            >
              <X size={12} />
            </button>
          </span>
        )}
        <p className="text-muted text-[11px] font-medium">
          Mobile numbers and emails are stored encrypted, so they only match when typed in full.
        </p>
      </div>
    </div>
  );
}
