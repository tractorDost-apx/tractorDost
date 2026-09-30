'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Eye,
  Loader2,
  MapPin,
  MessageSquareText,
  Plus,
  Power,
  Settings2,
  Trash2,
  Tractor,
} from 'lucide-react';
import { SpatialButton } from '@/components/ui/spatial-button';
import { ListingStatusBadge } from '@/components/used-tractors/status-badges';
import { useMyUsedListings } from '@/hooks/used-listings/use-used-listings';
import { useListingActions } from '@/hooks/used-listings/use-listing-actions';
import { MY_LISTING_TABS } from '@/lib/constants/listing-statuses';
import { formatINR } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import { ListingStatus, type UsedTractorListing } from '@/types/models/used-listing';

interface MyUsedListingsProps {
  /** Base route for a listing's manage page, e.g. /dashboard/my-listings */
  basePath: string;
  /** Where "Add New Listing" points */
  createHref: string;
  createLabel?: string;
}

export default function MyUsedListings({
  basePath,
  createHref,
  createLabel = 'Add New Listing',
}: MyUsedListingsProps) {
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const listingStatus = MY_LISTING_TABS[tab].status;
  const { data, loading, error, reload } = useMyUsedListings({ listingStatus, page });
  const { pendingId, setActive, remove } = useListingActions();

  const listings = data?.data ?? [];
  const totalPages = data?.totalPages ?? 1;

  const handleToggle = async (listing: UsedTractorListing) => {
    const next = !listing.isActive;
    const res = await setActive(listing.id, next);
    setNotice({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) reload();
  };

  const handleRemove = async (listing: UsedTractorListing) => {
    if (
      !window.confirm(
        `Remove "${listing.tractorBrand} ${listing.tractorModel}" from the marketplace? This cannot be undone.`
      )
    )
      return;
    const res = await remove(listing.id);
    setNotice({
      type: res.success ? 'success' : 'error',
      text: res.success ? 'Listing removed' : res.message,
    });
    if (res.success) reload();
  };

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground mb-2 text-3xl font-black">My Listings</h1>
          <p className="text-muted font-medium">
            Tractors you are selling. Listing details are locked once submitted; switch a listing
            off to hide it.
          </p>
        </div>
        <SpatialButton href={createHref} variant="glass" className="gap-2 whitespace-nowrap">
          <Plus size={18} /> {createLabel}
        </SpatialButton>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {MY_LISTING_TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => {
              setTab(i);
              setPage(1);
            }}
            className={`glass-button px-4 py-2 text-sm font-bold transition-all ${
              tab === i ? 'text-lime-400 ring-1 ring-lime-400/50' : 'text-muted hover:text-lime-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {notice && (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-sm font-medium ${
            notice.type === 'success'
              ? 'border-lime-400/30 bg-lime-400/10 text-lime-300'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          {notice.text}
        </div>
      )}

      {loading ? (
        <div className="flex flex-1 items-center justify-center py-20">
          <Loader2 className="animate-spin text-lime-400" size={32} />
        </div>
      ) : error ? (
        <div className="glass-inner p-8 text-center">
          <p className="mb-4 font-medium text-red-400">{error}</p>
          <SpatialButton variant="glass" onClick={reload}>
            Try again
          </SpatialButton>
        </div>
      ) : listings.length === 0 ? (
        <div className="glass-inner flex flex-col items-center p-12 text-center">
          <Tractor className="text-muted mb-4" size={40} />
          <p className="text-foreground mb-1 font-bold">No listings here yet</p>
          <p className="text-muted mb-6 text-sm">List your tractor to reach buyers across India.</p>
          <SpatialButton href={createHref} variant="secondary">
            {createLabel}
          </SpatialButton>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {listings.map((listing) => {
            const cover = listing.media?.[0]?.url;
            const canToggle =
              listing.listingStatus === ListingStatus.ACTIVE ||
              listing.listingStatus === ListingStatus.PAUSED;
            const canRemove =
              listing.listingStatus !== ListingStatus.EXPIRED &&
              listing.listingStatus !== ListingStatus.SOLD;
            const busy = pendingId === listing.id;

            return (
              <div
                key={listing.id}
                className="glass-inner flex flex-col p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-lime-400/10"
              >
                <div className="bg-secondary/20 relative mb-4 h-40 overflow-hidden rounded-xl">
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={`${listing.tractorBrand} ${listing.tractorModel}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="text-muted flex h-full items-center justify-center">
                      <Tractor size={36} />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <ListingStatusBadge status={listing.listingStatus} />
                  </div>
                </div>

                <h3 className="text-foreground mb-1 line-clamp-1 text-lg font-bold">
                  {listing.tractorBrand} {listing.tractorModel}{' '}
                  <span className="text-muted font-medium">({listing.yearOfManufacture})</span>
                </h3>
                <p className="mb-3 text-xl font-black text-lime-400">
                  {formatINR(listing.askingPrice)}
                </p>

                <div className="text-muted mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin size={14} /> {listing.district}, {listing.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={14} /> {listing.viewsCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquareText size={14} /> {listing.leadCount ?? 0}
                  </span>
                </div>

                {listing.listingStatus === ListingStatus.REJECTED && listing.rejectionReason && (
                  <p className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
                    Rejected: {listing.rejectionReason}
                  </p>
                )}
                <p className="text-muted mb-4 text-xs">
                  Listed {formatDate(listing.createdAt)}
                  {listing.expiresAt ? ` · Expires ${formatDate(listing.expiresAt)}` : ''}
                </p>

                <div className="mt-auto grid grid-cols-3 gap-2">
                  <Link
                    href={`${basePath}/${listing.id}`}
                    className="glass-button text-foreground flex items-center justify-center gap-1 py-2 text-xs font-bold hover:text-lime-400"
                  >
                    <Settings2 size={14} /> Manage
                  </Link>
                  <button
                    disabled={!canToggle || busy}
                    onClick={() => handleToggle(listing)}
                    title={canToggle ? undefined : 'Only live or inactive listings can be switched'}
                    className={`glass-button flex items-center justify-center gap-1 py-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
                      listing.isActive ? 'text-foreground hover:text-red-400' : 'text-lime-400'
                    }`}
                  >
                    {busy ? <Loader2 size={14} className="animate-spin" /> : <Power size={14} />}
                    {listing.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    disabled={!canRemove || busy}
                    onClick={() => handleRemove(listing)}
                    className="glass-button text-muted flex items-center justify-center gap-1 py-2 text-xs font-bold hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3">
          <button
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="glass-button text-foreground px-4 py-2 text-sm font-bold disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-muted text-sm font-bold">
            Page {page} of {totalPages}
          </span>
          <button
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="glass-button text-foreground px-4 py-2 text-sm font-bold disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
