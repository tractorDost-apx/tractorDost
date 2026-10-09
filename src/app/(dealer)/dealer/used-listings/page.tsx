'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Tractor,
  Plus,
  Search,
  RefreshCw,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Filter,
  ShieldCheck,
  Layers,
  Store,
  Sparkles,
  ArrowUpDown,
  MessageSquareText,
  Camera,
  Users,
} from 'lucide-react';
import { SpatialButton } from '@/components/ui/spatial-button';
import { useMyUsedListings } from '@/hooks/used-listings/use-used-listings';
import { useListingActions } from '@/hooks/used-listings/use-listing-actions';
import { useDealerInventory } from '@/hooks/dealers/use-dealer-inventory';
import { MY_LISTING_TABS } from '@/lib/constants/listing-statuses';
import { ListingStatus, type UsedTractorListing } from '@/types/models/used-listing';
import { AddUsedTractorFlow } from './components/AddUsedTractorFlow';
import { DealerListingQuickViewModal } from './components/DealerListingQuickViewModal';
import { DealerListingDocumentsModal } from './components/DealerListingDocumentsModal';
import { DealerListingEnquiriesModal } from './components/DealerListingEnquiriesModal';
import { DealerUsedListingCard } from './components/DealerUsedListingCard';
import { DealerUsedStatsCards } from './components/DealerUsedStatsCards';

type ViewMode = 'listings' | 'all_leads';

export default function DealerUsedListingsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('listings');
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');

  // Get dealer info
  const { dealerName } = useDealerInventory();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [docModalListing, setDocModalListing] = useState<{ id: number; title: string } | null>(null);
  const [enqModalListing, setEnqModalListing] = useState<{ id: number | null; title: string } | null>(null);

  // Toast notice
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const selectedStatus = MY_LISTING_TABS[tabIndex].status;
  const { data, loading, error, reload } = useMyUsedListings({
    listingStatus: selectedStatus,
    page,
    limit: 40,
  });

  const { pendingId, setActive, remove } = useListingActions();

  const showToast = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    setTimeout(() => {
      setNotice(null);
    }, 4000);
  };

  const rawListings = data?.data ?? [];
  const totalCount = data?.total ?? rawListings.length;
  const totalPages = data?.totalPages ?? 1;

  // Local filter & search
  const filteredListings = useMemo(() => {
    let result = [...rawListings];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.tractorBrand?.toLowerCase().includes(q) ||
          item.tractorModel?.toLowerCase().includes(q) ||
          item.district?.toLowerCase().includes(q) ||
          item.state?.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'price_asc') {
      result.sort((a, b) => Number(a.askingPrice) - Number(b.askingPrice));
    } else if (sortBy === 'price_desc') {
      result.sort((a, b) => Number(b.askingPrice) - Number(a.askingPrice));
    } else if (sortBy === 'year_desc') {
      result.sort((a, b) => b.yearOfManufacture - a.yearOfManufacture);
    } else if (sortBy === 'hours_asc') {
      result.sort((a, b) => (a.hoursUsed ?? 0) - (b.hoursUsed ?? 0));
    }

    return result;
  }, [rawListings, searchQuery, sortBy]);

  // Compute summary metrics
  const activeCount = rawListings.filter((l) => l.listingStatus === ListingStatus.ACTIVE).length;
  const pausedCount = rawListings.filter((l) => l.listingStatus === ListingStatus.PAUSED).length;
  const totalViews = rawListings.reduce((sum, l) => sum + (l.viewsCount || 0), 0);
  const totalLeads = rawListings.reduce((sum, l) => sum + (l.leadCount || 0), 0);

  // Toggle active/paused handler
  const handleToggleActive = async (listing: UsedTractorListing) => {
    const nextState = !listing.isActive;
    const res = await setActive(listing.id, nextState);
    if (res.success) {
      showToast('success', `Listing visibility updated: ${nextState ? 'Active (Live)' : 'Paused'}`);
      reload();
    } else {
      showToast('error', res.message || 'Failed to update listing status.');
    }
  };

  // Delete handler
  const handleDeleteListing = async (listing: UsedTractorListing) => {
    if (
      !window.confirm(
        `Are you sure you want to remove "${listing.tractorBrand} ${listing.tractorModel}" from the Used Marketplace?`
      )
    ) {
      return;
    }
    const res = await remove(listing.id);
    if (res.success) {
      showToast('success', 'Used tractor listing removed successfully.');
      reload();
    } else {
      showToast('error', res.message || 'Failed to delete listing.');
    }
  };

  return (
    <div className="flex h-full flex-col space-y-6">
      {/* Top Banner & Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-foreground md:text-3xl">
              Used Tractor Marketplace
            </h1>
            <span className="flex items-center gap-1 rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-0.5 text-xs font-bold text-lime-400">
              <ShieldCheck size={14} /> Dealer Direct
            </span>
          </div>
          <p className="text-xs font-medium text-muted md:text-sm mt-1">
            Pre-owned tractor inventory &bull; Auto-verified listings &bull; Photo management &bull; Real-time buyer leads CRM
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setEnqModalListing({ id: null, title: 'All Dealership Used Leads' })}
            className="flex items-center gap-1.5 rounded-xl border border-purple-500/30 bg-purple-500/10 px-3.5 py-2 text-xs font-bold text-purple-300 hover:bg-purple-500/20 transition-colors"
          >
            <Users size={15} /> View All Leads ({totalLeads})
          </button>
          <button
            onClick={reload}
            disabled={loading}
            className="flex items-center gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3 py-2 text-xs font-bold text-muted hover:border-[var(--border-brand)] hover:text-foreground transition-colors"
            title="Refresh Listings"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Toast Notice */}
      {notice && (
        <div
          className={`flex items-center gap-2 rounded-xl border p-4 text-sm font-medium animate-in fade-in duration-200 ${
            notice.type === 'success'
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Stats Cards */}
      <DealerUsedStatsCards
        total={totalCount}
        activeCount={activeCount}
        pausedCount={pausedCount}
        totalViews={totalViews}
        totalLeads={totalLeads}
      />

      {/* Search, Sort & Status Tabs Bar */}
      <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border-subtle)] bg-[var(--background)] p-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
        {/* Status Tabs */}
        <div className="flex flex-wrap gap-1.5">
          {MY_LISTING_TABS.map((t, idx) => (
            <button
              key={t.label}
              onClick={() => {
                setTabIndex(idx);
                setPage(1);
              }}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                tabIndex === idx
                  ? 'bg-lime-400 text-black shadow-md shadow-lime-400/20'
                  : 'border border-[var(--border-subtle)] bg-foreground/5 text-muted hover:border-[var(--border-brand)] hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search & Sort Filters */}
        <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-3 top-2.5 text-muted" size={15} />
            <input
              type="text"
              placeholder="Search brand, model, city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 pl-9 pr-3 py-2 text-xs font-medium text-foreground focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div className="relative min-w-[140px]">
            <ArrowUpDown className="absolute left-3 top-2.5 text-muted" size={14} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full rounded-xl border border-[var(--border-subtle)] bg-foreground/5 pl-8 pr-3 py-2 text-xs font-medium text-foreground focus:border-lime-400 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="year_desc">Year: Newest</option>
              <option value="hours_asc">Lowest Hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-1 flex-col items-center justify-center py-24">
          <Loader2 className="animate-spin text-lime-400" size={36} />
          <p className="text-xs font-semibold text-muted mt-3">Loading your used tractor listings...</p>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-[var(--background)] p-8 text-center backdrop-blur-sm">
          <AlertCircle className="mx-auto text-red-400 mb-3" size={36} />
          <p className="font-bold text-red-400 mb-2">{error}</p>
          <SpatialButton onClick={reload} variant="glass" className="mt-2">
            Try Again
          </SpatialButton>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--border-subtle)] bg-[var(--background)] p-12 text-center backdrop-blur-sm">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-lime-400/10 text-lime-400 mb-4">
            <Tractor size={32} />
          </div>
          <h3 className="text-lg font-black text-foreground">No Used Tractor Listings Found</h3>
          <p className="text-xs text-muted max-w-md mt-1 mb-6">
            {searchQuery
              ? `No pre-owned tractors match "${searchQuery}". Try adjusting your filters.`
              : 'You have not listed any used tractors in this category yet. List tractors for sale directly from your inventory.'}
          </p>
          <Link href="/dealer/inventory">
            <SpatialButton variant="primary" className="gap-2">
              <Tractor size={16} /> Go to Inventory
            </SpatialButton>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Listings Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredListings.map((listing) => (
              <DealerUsedListingCard
                key={listing.id}
                listing={listing}
                isToggling={pendingId === listing.id}
                onToggleActive={handleToggleActive}
                onQuickView={(id) => setQuickViewId(id)}
                onOpenPhotos={(id, title) => setDocModalListing({ id, title })}
                onOpenEnquiries={(id, title) => setEnqModalListing({ id, title })}
                onDelete={handleDeleteListing}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 border-t border-[var(--border-subtle)] pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-1.5 text-xs font-bold text-foreground disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-bold text-muted px-2">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="rounded-xl border border-[var(--border-subtle)] bg-foreground/5 px-3.5 py-1.5 text-xs font-bold text-foreground disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Used Tractor Flow */}
      <AddUsedTractorFlow
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={(msg) => {
          showToast('success', msg);
          reload();
        }}
        dealerName={dealerName}
      />

      {/* Quick View Modal */}
      <DealerListingQuickViewModal
        listingId={quickViewId}
        onClose={() => setQuickViewId(null)}
        onOpenPhotos={(id, title) => {
          setQuickViewId(null);
          setDocModalListing({ id, title });
        }}
        onOpenEnquiries={(id, title) => {
          setQuickViewId(null);
          setEnqModalListing({ id, title });
        }}
      />

      {/* Photos & Documents Modal */}
      <DealerListingDocumentsModal
        listingId={docModalListing?.id ?? null}
        listingTitle={docModalListing?.title}
        isOpen={!!docModalListing}
        onClose={() => setDocModalListing(null)}
        onPhotosUpdated={reload}
      />

      {/* Buyer Enquiries & Leads Modal */}
      <DealerListingEnquiriesModal
        listingId={enqModalListing?.id ?? null}
        listingTitle={enqModalListing?.title}
        isOpen={!!enqModalListing}
        onClose={() => setEnqModalListing(null)}
        onStatusUpdated={reload}
      />
    </div>
  );
}
