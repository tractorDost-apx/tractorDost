import React, { useState } from 'react';
import {
  Search,
  Filter,
  RotateCcw,
  Calendar,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Download,
  AlertCircle,
  Copy,
  Clock,
  Flame,
} from 'lucide-react';
import { LeadStatus, LeadType, GetLeadsParams } from '@/lib/api/leads';

interface UserOption {
  id: number;
  fullName: string;
}

interface BrandOption {
  id: number;
  name: string;
}

interface LeadFiltersProps {
  filters: GetLeadsParams;
  onFilterChange: (updated: Partial<GetLeadsParams>) => void;
  onResetFilters: () => void;
  onApplyFilters: () => void;
  onExport: () => void;
  exporting: boolean;
  agents: UserOption[];
  brands: BrandOption[];
}

export const LEAD_TYPES: { value: LeadType; label: string }[] = [
  { value: 'GET_PRICE', label: 'Get Price' },
  { value: 'EMI_ENQUIRY', label: 'EMI Enquiry' },
  { value: 'LOAN', label: 'Loan Application' },
  { value: 'INSURANCE', label: 'Insurance Enquiry' },
  { value: 'USED_ENQUIRY', label: 'Used Tractor Enquiry' },
  { value: 'SELL', label: 'Sell Tractor' },
  { value: 'DEALER', label: 'Dealer Enquiry' },
  { value: 'SERVICE', label: 'Service Booking' },
  { value: 'CALLBACK', label: 'Callback Request' },
  { value: 'BROCHURE', label: 'Brochure Download' },
  { value: 'COMPARE', label: 'Compare Enquiry' },
  { value: 'VALUATION', label: 'Tractor Valuation' },
  { value: 'TEST_DRIVE', label: 'Test Drive Request' },
];

export const LEAD_STATUSES: { value: LeadStatus; label: string }[] = [
  { value: 'NEW', label: 'New' },
  { value: 'ATTEMPTED', label: 'Attempted' },
  { value: 'CONTACTED', label: 'Contacted' },
  { value: 'QUALIFIED', label: 'Qualified' },
  { value: 'INTERESTED', label: 'Interested' },
  { value: 'DEALER_ASSIGNED', label: 'Dealer Assigned' },
  { value: 'CONVERTED', label: 'Converted' },
  { value: 'LOST', label: 'Lost' },
  { value: 'SPAM', label: 'Spam' },
];

export function LeadFilters({
  filters,
  onFilterChange,
  onResetFilters,
  onApplyFilters,
  onExport,
  exporting,
  agents,
  brands,
}: LeadFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [datePreset, setDatePreset] = useState<string>('all');

  const handleDatePreset = (preset: string) => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === 'today') {
      const todayStr = now.toISOString().slice(0, 10);
      onFilterChange({ dateFrom: todayStr, dateTo: todayStr, page: 1 });
    } else if (preset === 'yesterday') {
      const y = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const yStr = y.toISOString().slice(0, 10);
      onFilterChange({ dateFrom: yStr, dateTo: yStr, page: 1 });
    } else if (preset === '7days') {
      const past7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      onFilterChange({
        dateFrom: past7.toISOString().slice(0, 10),
        dateTo: now.toISOString().slice(0, 10),
        page: 1,
      });
    } else if (preset === '30days') {
      const past30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      onFilterChange({
        dateFrom: past30.toISOString().slice(0, 10),
        dateTo: now.toISOString().slice(0, 10),
        page: 1,
      });
    } else if (preset === 'all') {
      onFilterChange({ dateFrom: undefined, dateTo: undefined, page: 1 });
    }
  };

  // Count active filters
  const activeFiltersCount = [
    Boolean(filters.search),
    Boolean(filters.status),
    Boolean(filters.leadType),
    Boolean(filters.assignment && filters.assignment !== 'all'),
    Boolean(filters.assignedTo),
    Boolean(filters.interestedBrand),
    Boolean(filters.interestedModel),
    Boolean(filters.sourcePage),
    Boolean(filters.state),
    Boolean(filters.district),
    Boolean(filters.isDuplicate),
    Boolean(filters.followupDue),
    Boolean(filters.needsAttention),
    Boolean(filters.dateFrom || filters.dateTo),
  ].filter(Boolean).length;

  return (
    <div className="glass-panel flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] p-4">
      {/* Top Search Bar & Primary Actions */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Search box */}
        <div className="group relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-muted transition-colors group-focus-within:text-[#4a7635]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by customer name, mobile, email, lead #ID, or tractor model..."
            value={filters.search ?? ''}
            onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onApplyFilters();
            }}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 py-2.5 pr-10 pl-10 text-xs font-semibold text-foreground placeholder:text-muted transition-all focus:border-[#4a7635]/60 focus:bg-background focus:ring-2 focus:ring-[#4a7635]/20 focus:outline-none"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFilterChange({ search: '', page: 1 })}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted hover:text-foreground"
              title="Clear search"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Advanced toggle */}
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all ${
              isExpanded || activeFiltersCount > 0
                ? 'border-[#4a7635]/40 bg-[#4a7635]/10 text-[#4a7635]'
                : 'border-[var(--border-subtle)] bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground'
            }`}
          >
            <SlidersHorizontal size={14} />
            <span>Advanced Filters</span>
            {activeFiltersCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#4a7635] text-[10px] font-black text-white">
                {activeFiltersCount}
              </span>
            )}
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {/* Reset Filters */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-2 text-xs font-bold text-rose-400 transition-colors hover:bg-rose-500/20"
              title="Reset all filters"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          )}

          {/* Export to Excel */}
          <button
            type="button"
            onClick={onExport}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-bold text-emerald-400 transition-colors hover:bg-emerald-500/20 disabled:opacity-50"
            title="Download filtered leads in Excel .xlsx"
          >
            <Download size={13} className={exporting ? 'animate-bounce' : ''} />
            <span>{exporting ? 'Exporting...' : 'Export Excel'}</span>
          </button>
        </div>
      </div>

      {/* Primary Row: Lead Status & Lead Type & Assignment Quick Filters */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4">
        {/* Status Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-muted">
            Lead Status
          </label>
          <select
            value={filters.status ?? ''}
            onChange={(e) =>
              onFilterChange({
                status: (e.target.value as LeadStatus) || '',
                page: 1,
              })
            }
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
          >
            <option value="" className="bg-background text-foreground">
              All Statuses
            </option>
            {LEAD_STATUSES.map((s) => (
              <option key={s.value} value={s.value} className="bg-background text-foreground">
                {s.label}
              </option>
            ))}
          </select>
        </div>

        {/* Lead Type Dropdown */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-muted">
            Lead Type
          </label>
          <select
            value={filters.leadType ?? ''}
            onChange={(e) =>
              onFilterChange({
                leadType: (e.target.value as LeadType) || '',
                page: 1,
              })
            }
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
          >
            <option value="" className="bg-background text-foreground">
              All Lead Types
            </option>
            {LEAD_TYPES.map((t) => (
              <option key={t.value} value={t.value} className="bg-background text-foreground">
                {t.label}
              </option>
            ))}
          </select>
        </div>

        {/* Assignment Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-muted">
            Assignment
          </label>
          <select
            value={
              filters.assignedTo
                ? `agent:${filters.assignedTo}`
                : filters.assignment || 'all'
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val.startsWith('agent:')) {
                const agentId = Number(val.replace('agent:', ''));
                onFilterChange({
                  assignedTo: agentId,
                  assignment: undefined,
                  page: 1,
                });
              } else if (val === 'unassigned') {
                onFilterChange({
                  assignment: 'unassigned',
                  assignedTo: undefined,
                  page: 1,
                });
              } else if (val === 'assigned') {
                onFilterChange({
                  assignment: 'assigned',
                  assignedTo: undefined,
                  page: 1,
                });
              } else {
                onFilterChange({
                  assignment: 'all',
                  assignedTo: undefined,
                  page: 1,
                });
              }
            }}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
          >
            <option value="all" className="bg-background text-foreground">
              All Assignments
            </option>
            <option value="unassigned" className="bg-background text-foreground">
              ⚡ Unassigned Only
            </option>
            <option value="assigned" className="bg-background text-foreground">
              ✓ Assigned Leads
            </option>
            {agents.length > 0 && (
              <optgroup label="Specific Agent">
                {agents.map((ag) => (
                  <option
                    key={ag.id}
                    value={`agent:${ag.id}`}
                    className="bg-background text-foreground"
                  >
                    👤 {ag.fullName}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        {/* Date Preset Filter */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black uppercase tracking-wider text-muted">
            Date Range
          </label>
          <select
            value={datePreset}
            onChange={(e) => handleDatePreset(e.target.value)}
            className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
          >
            <option value="all" className="bg-background text-foreground">
              All Time
            </option>
            <option value="today" className="bg-background text-foreground">
              Today
            </option>
            <option value="yesterday" className="bg-background text-foreground">
              Yesterday
            </option>
            <option value="7days" className="bg-background text-foreground">
              Last 7 Days
            </option>
            <option value="30days" className="bg-background text-foreground">
              Last 30 Days
            </option>
            <option value="custom" className="bg-background text-foreground">
              Custom Range...
            </option>
          </select>
        </div>
      </div>

      {/* Collapsible Advanced Panel */}
      {isExpanded && (
        <div className="flex flex-col gap-4 border-t border-[var(--border-subtle)] pt-4 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {/* Custom Date From */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">
                From Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateFrom ?? ''}
                  onChange={(e) => {
                    setDatePreset('custom');
                    onFilterChange({ dateFrom: e.target.value, page: 1 });
                  }}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
                />
              </div>
            </div>

            {/* Custom Date To */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">
                To Date
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={filters.dateTo ?? ''}
                  onChange={(e) => {
                    setDatePreset('custom');
                    onFilterChange({ dateTo: e.target.value, page: 1 });
                  }}
                  className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
                />
              </div>
            </div>

            {/* Tractor Brand */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">
                Tractor Brand
              </label>
              <select
                value={filters.interestedBrand ?? ''}
                onChange={(e) =>
                  onFilterChange({ interestedBrand: e.target.value || undefined, page: 1 })
                }
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
              >
                <option value="" className="bg-background text-foreground">
                  All Brands
                </option>
                {brands.map((b) => (
                  <option key={b.id} value={b.name} className="bg-background text-foreground">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Tractor Model */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">
                Tractor Model
              </label>
              <input
                type="text"
                placeholder="e.g. DI 745, 5050 D..."
                value={filters.interestedModel ?? ''}
                onChange={(e) =>
                  onFilterChange({ interestedModel: e.target.value || undefined, page: 1 })
                }
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
              />
            </div>

            {/* Source Page */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">
                Source Page
              </label>
              <input
                type="text"
                placeholder="e.g. tractor-detail, homepage..."
                value={filters.sourcePage ?? ''}
                onChange={(e) =>
                  onFilterChange({ sourcePage: e.target.value || undefined, page: 1 })
                }
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
              />
            </div>

            {/* Location: State */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">
                State
              </label>
              <input
                type="text"
                placeholder="e.g. Uttar Pradesh, Punjab..."
                value={filters.state ?? ''}
                onChange={(e) =>
                  onFilterChange({ state: e.target.value || undefined, page: 1 })
                }
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
              />
            </div>

            {/* Location: District */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">
                District
              </label>
              <input
                type="text"
                placeholder="e.g. Agra, Ludhiana..."
                value={filters.district ?? ''}
                onChange={(e) =>
                  onFilterChange({ district: e.target.value || undefined, page: 1 })
                }
                className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-semibold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
              />
            </div>

            {/* Sort Field */}
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-muted">
                Sort By
              </label>
              <div className="flex gap-1.5">
                <select
                  value={filters.sortBy ?? 'createdAt'}
                  onChange={(e) =>
                    onFilterChange({
                      sortBy: e.target.value as any,
                      page: 1,
                    })
                  }
                  className="flex-1 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground focus:border-[#4a7635]/60 focus:outline-none"
                >
                  <option value="createdAt" className="bg-background text-foreground">
                    Created Date
                  </option>
                  <option value="intentScore" className="bg-background text-foreground">
                    Intent Score
                  </option>
                  <option value="status" className="bg-background text-foreground">
                    Status
                  </option>
                  <option value="nextFollowupAt" className="bg-background text-foreground">
                    Next Follow-up
                  </option>
                  <option value="name" className="bg-background text-foreground">
                    Customer Name
                  </option>
                </select>
                <button
                  type="button"
                  onClick={() =>
                    onFilterChange({
                      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
                      page: 1,
                    })
                  }
                  className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-foreground hover:bg-foreground/10"
                  title="Toggle order"
                >
                  {filters.sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
                </button>
              </div>
            </div>
          </div>

          {/* Quick Toggle Pills: Duplicates, Follow-up Due, Needs Attention */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted">
              Quick Highlights:
            </span>

            {/* Needs Attention */}
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  needsAttention: filters.needsAttention ? undefined : true,
                  page: 1,
                })
              }
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                filters.needsAttention
                  ? 'border border-amber-500/50 bg-amber-500/20 text-amber-300 ring-2 ring-amber-500/20'
                  : 'border border-[var(--border-subtle)] bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground'
              }`}
            >
              <Flame size={12} className={filters.needsAttention ? 'text-amber-400' : ''} />
              <span>Needs Attention</span>
            </button>

            {/* Follow-up Due */}
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  followupDue: filters.followupDue ? undefined : true,
                  page: 1,
                })
              }
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                filters.followupDue
                  ? 'border border-rose-500/50 bg-rose-500/20 text-rose-300 ring-2 ring-rose-500/20'
                  : 'border border-[var(--border-subtle)] bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground'
              }`}
            >
              <Clock size={12} className={filters.followupDue ? 'text-rose-400' : ''} />
              <span>Follow-ups Overdue</span>
            </button>

            {/* Duplicates */}
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  isDuplicate: filters.isDuplicate ? undefined : true,
                  page: 1,
                })
              }
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                filters.isDuplicate
                  ? 'border border-purple-500/50 bg-purple-500/20 text-purple-300 ring-2 ring-purple-500/20'
                  : 'border border-[var(--border-subtle)] bg-foreground/5 text-muted hover:bg-foreground/10 hover:text-foreground'
              }`}
            >
              <Copy size={12} className={filters.isDuplicate ? 'text-purple-400' : ''} />
              <span>Duplicate Inquiries</span>
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Indicators (Pills) */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 border-t border-[var(--border-subtle)] pt-3 text-[11px]">
          <span className="font-bold text-muted mr-1">Active filters:</span>

          {filters.search && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-0.5 font-bold text-foreground">
              Search: "{filters.search}"
              <button
                type="button"
                onClick={() => onFilterChange({ search: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.status && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-sky-500/20 bg-sky-500/10 px-2 py-0.5 font-bold text-sky-400">
              Status: {filters.status}
              <button
                type="button"
                onClick={() => onFilterChange({ status: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.leadType && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-teal-500/20 bg-teal-500/10 px-2 py-0.5 font-bold text-teal-400">
              Type: {filters.leadType}
              <button
                type="button"
                onClick={() => onFilterChange({ leadType: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.assignment && filters.assignment !== 'all' && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-bold text-amber-400">
              Assignment: {filters.assignment}
              <button
                type="button"
                onClick={() => onFilterChange({ assignment: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.assignedTo && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 font-bold text-blue-400">
              Agent ID: {filters.assignedTo}
              <button
                type="button"
                onClick={() => onFilterChange({ assignedTo: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.interestedBrand && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-0.5 font-bold text-foreground">
              Brand: {filters.interestedBrand}
              <button
                type="button"
                onClick={() => onFilterChange({ interestedBrand: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.interestedModel && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-0.5 font-bold text-foreground">
              Model: {filters.interestedModel}
              <button
                type="button"
                onClick={() => onFilterChange({ interestedModel: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.sourcePage && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-0.5 font-bold text-foreground">
              Source: {filters.sourcePage}
              <button
                type="button"
                onClick={() => onFilterChange({ sourcePage: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.state && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-0.5 font-bold text-foreground">
              State: {filters.state}
              <button
                type="button"
                onClick={() => onFilterChange({ state: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.district && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-0.5 font-bold text-foreground">
              District: {filters.district}
              <button
                type="button"
                onClick={() => onFilterChange({ district: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {(filters.dateFrom || filters.dateTo) && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-foreground/5 px-2 py-0.5 font-bold text-foreground">
              Date: {filters.dateFrom ?? 'any'} to {filters.dateTo ?? 'now'}
              <button
                type="button"
                onClick={() => {
                  setDatePreset('all');
                  onFilterChange({ dateFrom: undefined, dateTo: undefined, page: 1 });
                }}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.needsAttention && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 font-bold text-amber-400">
              Needs Attention
              <button
                type="button"
                onClick={() => onFilterChange({ needsAttention: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.followupDue && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-rose-500/20 bg-rose-500/10 px-2 py-0.5 font-bold text-rose-400">
              Follow-ups Due
              <button
                type="button"
                onClick={() => onFilterChange({ followupDue: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          {filters.isDuplicate && (
            <span className="inline-flex items-center gap-1 rounded-lg border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 font-bold text-purple-400">
              Duplicates
              <button
                type="button"
                onClick={() => onFilterChange({ isDuplicate: undefined, page: 1 })}
                className="hover:text-rose-400"
              >
                <X size={12} />
              </button>
            </span>
          )}

          <button
            type="button"
            onClick={onResetFilters}
            className="text-[10px] font-black uppercase text-[#4a7635] hover:underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
