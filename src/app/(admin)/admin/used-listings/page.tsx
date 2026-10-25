'use client';

import React, { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ShieldCheck,
  Tag,
  X,
} from 'lucide-react';
import { ListingStatus, type UsedTractorListing } from '@/lib/api/usedTractors';
import { TractorLoader } from '@/components/ui/TractorLoader';
import Link from 'next/link';
import Pagination from '@/components/shared/Pagination';
import { useAdminUsedListings } from '@/hooks/used-listings/use-used-listings';
import { useDealerName } from '@/hooks/dealers/use-dealer-name';
import { formatINR } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import {
  EMPTY_FILTER_VALUES,
  STATUS_TABS,
  USED_LISTING_SORT_OPTIONS,
  activeFilterChips,
  clearFilterGroup,
  parseUsedListingQuery,
  serializeUsedListingQuery,
  toListingFilters,
  type FilterGroup,
  type UsedListingFilterValues,
  type UsedListingQuery,
} from '@/lib/utils/used-listing-filters';
import type { ListingSortBy } from '@/types/models/used-listing';
import { UsedListingFilterPanel } from './components/UsedListingFilterPanel';

export default function AdminUsedListingsPage() {
  // useSearchParams needs a Suspense boundary so the page can still prerender
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-24">
          <TractorLoader className="text-[var(--color-brand-green)]" size={48} />
        </div>
      }
    >
      <AdminUsedListingsContent />
    </Suspense>
  );
}

function AdminUsedListingsContent() {
  const searchParams = useSearchParams();
  // The whole grid state lives here and is mirrored to the URL, so reloads and Back keep it
  const [query, setQuery] = useState<UsedListingQuery>(() => parseUsedListingQuery(searchParams));
  const [searchInput, setSearchInput] = useState(query.search);
  const [showFilters, setShowFilters] = useState(false);

  const listings = useAdminUsedListings(toListingFilters(query));
  const dealerId = query.filters.dealerId === '' ? null : Number(query.filters.dealerId);
  const dealerName = useDealerName(
    dealerId !== null && Number.isFinite(dealerId) ? dealerId : null
  );
  const chips = activeFilterChips(query.filters, dealerName);
  const isNarrowed = chips.length > 0 || query.search !== '' || query.status !== 'ALL';

  // Search waits for a pause in typing before it reaches the server
  useEffect(() => {
    const term = searchInput.trim();
    const timer = setTimeout(() => {
      setQuery((q) => (q.search === term ? q : { ...q, search: term, page: 1 }));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    const qs = serializeUsedListingQuery(query);
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, [query]);

  /** Any change other than paging starts again from page 1 */
  const updateQuery = (patch: Partial<UsedListingQuery>) =>
    setQuery((q) => ({ ...q, page: 1, ...patch }));

  const applyFilters = (filters: UsedListingFilterValues) => {
    updateQuery({ filters });
    setShowFilters(false);
  };
  const removeChip = (group: FilterGroup) =>
    updateQuery({ filters: clearFilterGroup(query.filters, group) });
  const clearAllFilters = () => updateQuery({ filters: EMPTY_FILTER_VALUES });

  const rows = listings.data?.data ?? [];

  const getStatusBadge = (status: ListingStatus) => {
    switch (status) {
      case ListingStatus.ACTIVE:
        return (
          <span className="flex w-fit items-center gap-1 rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-black tracking-wider text-emerald-500 uppercase">
            <CheckCircle2 size={12} /> Active
          </span>
        );
      case ListingStatus.PENDING_APPROVAL:
        return (
          <span className="flex w-fit items-center gap-1 rounded-md border border-amber-500/20 bg-amber-500/10 px-2.5 py-1 text-xs font-black tracking-wider text-amber-500 uppercase">
            <Clock size={12} /> Pending
          </span>
        );
      case ListingStatus.REJECTED:
        return (
          <span className="flex w-fit items-center gap-1 rounded-md border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-black tracking-wider text-red-500 uppercase">
            <XCircle size={12} /> Rejected
          </span>
        );
      case ListingStatus.SOLD:
        return (
          <span className="flex w-fit items-center gap-1 rounded-md border border-violet-400/20 bg-violet-400/10 px-2.5 py-1 text-xs font-black tracking-wider text-violet-300 uppercase">
            <Tag size={12} /> Sold
          </span>
        );
      default:
        return (
          <span className="bg-foreground/10 text-foreground flex w-fit items-center gap-1 rounded-md border border-[var(--border-brand)] px-2.5 py-1 text-xs font-black tracking-wider uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="animate-fade-in w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-foreground text-3xl font-black tracking-tight md:text-4xl">
            Used Listings
          </h1>
          <p className="text-muted mt-2 text-sm font-bold tracking-widest uppercase">
            Manage and moderate marketplace listings.
          </p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col items-center justify-between gap-4 rounded-[1.5rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] p-3 shadow-[var(--card-shadow)] backdrop-blur-xl md:flex-row">
        <div className="no-scrollbar flex w-full gap-2 overflow-x-auto md:w-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => updateQuery({ status: tab.value })}
              className={`rounded-xl px-6 py-2.5 text-sm font-bold whitespace-nowrap transition-all duration-300 ${query.status === tab.value ? 'bg-[var(--color-brand-green)] text-white shadow-md' : 'text-muted hover:text-foreground hover:bg-foreground/5'}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative w-full shrink-0 md:w-72">
          <Search className="text-muted absolute top-1/2 left-4 -translate-y-1/2" size={18} />
          <input
            type="text"
            placeholder="Search brand, model, place..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-background/50 w-full rounded-xl border border-[var(--border-subtle)] py-3 pr-4 pl-11 text-sm font-bold transition-all outline-none focus:border-[var(--color-brand-green)] focus:ring-4 focus:ring-[var(--color-brand-green)]/10"
          />
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((open) => !open)}
              aria-expanded={showFilters}
              className={`bg-foreground/5 hover:bg-foreground/10 inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold transition-colors ${chips.length > 0 || showFilters ? 'border-[var(--color-brand-green)]/40 text-[var(--color-brand-green)]' : 'text-foreground border-[var(--border-subtle)]'}`}
            >
              <Filter size={16} /> Filters
              {chips.length > 0 && (
                <span className="rounded-md bg-[var(--color-brand-green)] px-1.5 py-0.5 text-[10px] leading-none text-white">
                  {chips.length}
                </span>
              )}
            </button>
            <select
              aria-label="Sort listings"
              value={query.sortBy}
              onChange={(e) => updateQuery({ sortBy: e.target.value as ListingSortBy })}
              className="bg-background/50 text-foreground cursor-pointer rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-sm font-bold outline-none focus:border-[var(--color-brand-green)]"
            >
              {USED_LISTING_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <p className="text-muted text-sm font-bold" aria-live="polite">
            {listings.data
              ? `${listings.data.total} matching ${listings.data.total === 1 ? 'listing' : 'listings'}`
              : listings.loading
                ? 'Counting listings...'
                : ''}
          </p>
        </div>

        {chips.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((chip) => (
              <span
                key={chip.group}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 py-1 pr-1.5 pl-3 text-xs font-bold text-[var(--color-brand-green)]"
              >
                {chip.label}
                <button
                  type="button"
                  onClick={() => removeChip(chip.group)}
                  className="hover:bg-foreground/10 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove filter ${chip.label}`}
                >
                  <X size={12} />
                </button>
              </span>
            ))}
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-muted hover:text-foreground ml-1 text-xs font-black tracking-wider uppercase transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {showFilters && (
        <UsedListingFilterPanel
          applied={query.filters}
          onApply={applyFilters}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* Data Table */}
      <div className="overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-[var(--card-bg)] shadow-[var(--card-shadow)] backdrop-blur-2xl">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-foreground/5 border-b border-[var(--border-subtle)]">
                <th className="text-muted px-6 py-5 text-[10px] font-black tracking-widest uppercase">
                  Tractor
                </th>
                <th className="text-muted px-6 py-5 text-[10px] font-black tracking-widest uppercase">
                  Price / Location
                </th>
                <th className="text-muted px-6 py-5 text-[10px] font-black tracking-widest uppercase">
                  Status
                </th>
                <th className="text-muted px-6 py-5 text-[10px] font-black tracking-widest uppercase">
                  Stats
                </th>
                <th className="text-muted px-6 py-5 text-right text-[10px] font-black tracking-widest uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {listings.loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <TractorLoader
                      className="mx-auto mb-2 text-[var(--color-brand-green)]"
                      size={48}
                    />
                    <p className="text-muted mt-2 text-sm font-medium">Loading listings...</p>
                  </td>
                </tr>
              ) : listings.error ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-sm font-bold text-rose-400">{listings.error}</p>
                    <button
                      type="button"
                      onClick={listings.reload}
                      className="bg-foreground/5 hover:bg-foreground/10 text-foreground mt-4 rounded-xl px-4 py-2 text-sm font-bold transition-colors"
                    >
                      Try again
                    </button>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-muted px-6 py-12 text-center font-medium">
                    {isNarrowed ? 'No listings match the selected filters.' : 'No listings found.'}
                  </td>
                </tr>
              ) : (
                rows.map((listing: UsedTractorListing) => (
                  <tr
                    key={listing.id}
                    className="hover:bg-background/60 group transition-colors duration-300"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-4">
                        <div className="bg-foreground/10 h-12 w-16 shrink-0 overflow-hidden rounded-lg border border-[var(--border-subtle)]">
                          {listing.media?.[0]?.url ? (
                            <img
                              src={listing.media[0].url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="text-muted flex h-full w-full items-center justify-center">
                              No Img
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="text-foreground flex items-center gap-2 font-black">
                            {listing.tractorBrand} {listing.tractorModel}
                            {listing.isCertified && (
                              <ShieldCheck size={14} className="text-[var(--color-brand-green)]" />
                            )}
                          </div>
                          <div className="text-muted mt-0.5 text-xs font-bold">
                            ID: {listing.id} • {listing.yearOfManufacture} • {listing.hoursUsed} Hrs
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-foreground font-black">
                        {formatINR(listing.askingPrice)}
                      </div>
                      <div className="text-muted mt-0.5 text-xs font-bold">
                        {listing.district}, {listing.state}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(listing.listingStatus)}</td>
                    <td className="px-6 py-4">
                      <div className="text-foreground text-sm font-black">
                        {listing.leadCount || 0} Leads
                      </div>
                      <div className="text-muted mt-0.5 text-xs font-bold">
                        {listing.viewsCount || 0} Views
                      </div>
                      <div className="text-muted mt-0.5 text-[10px] font-bold tracking-wide uppercase">
                        Listed {formatDate(listing.createdAt)} · Updated{' '}
                        {formatDate(listing.updatedAt)}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link
                        href={`/admin/used-listings/${listing.id}`}
                        className="bg-foreground/5 inline-flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] px-4 py-2 text-sm font-bold shadow-sm transition-all duration-300 hover:border-[var(--color-brand-green)] hover:bg-[var(--color-brand-green)] hover:text-white"
                      >
                        <Eye size={16} /> Review
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <Pagination
          page={query.page}
          limit={query.limit}
          totalCount={listings.data?.total ?? 0}
          totalPages={listings.data?.totalPages ?? 0}
          onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
          onLimitChange={(limit) => updateQuery({ limit })}
        />
      </div>
    </div>
  );
}
