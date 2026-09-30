'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  Eye,
  Loader2,
  Lock,
  MessageSquareText,
  Power,
  ShieldCheck,
  Trash2,
} from 'lucide-react';
import { SpatialButton } from '@/components/ui/spatial-button';
import { ListingStatusBadge } from '@/components/used-tractors/status-badges';
import ListingDocumentsManager from '@/components/used-tractors/ListingDocumentsManager';
import SellerEnquiryInbox from '@/components/used-tractors/SellerEnquiryInbox';
import { useUsedListing } from '@/hooks/used-listings/use-used-listing';
import { useListingActions } from '@/hooks/used-listings/use-listing-actions';
import { formatINR } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import { ListingStatus, type UsedTractorListing } from '@/types/models/used-listing';

interface SellerListingManagerProps {
  listingId: string;
  /** Route back to the seller's listing grid */
  backHref: string;
}

type Tab = 'overview' | 'photos' | 'enquiries';

function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="glass-inner px-4 py-3">
      <p className="text-muted text-xs font-bold uppercase">{label}</p>
      <p className="text-foreground mt-1 font-bold">{value ?? '—'}</p>
    </div>
  );
}

function humanize(value: string | null | undefined): string {
  if (!value) return '—';
  return value
    .toLowerCase()
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function SellerListingManager({ listingId, backHref }: SellerListingManagerProps) {
  const [tab, setTab] = useState<Tab>('overview');
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const { data: listing, loading, error, reload } = useUsedListing(listingId);
  const { pendingId, setActive, remove } = useListingActions();

  if (loading && !listing) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-lime-400" size={32} />
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="glass-inner p-8 text-center">
        <p className="mb-4 font-medium text-red-400">{error ?? 'Listing not found'}</p>
        <SpatialButton href={backHref} variant="glass">
          Back to my listings
        </SpatialButton>
      </div>
    );
  }

  const busy = pendingId === listing.id;
  const canToggle =
    listing.listingStatus === ListingStatus.ACTIVE ||
    listing.listingStatus === ListingStatus.PAUSED;
  const isClosed =
    listing.listingStatus === ListingStatus.EXPIRED || listing.listingStatus === ListingStatus.SOLD;
  const inspection = listing.inspections?.[0];

  const handleToggle = async (current: UsedTractorListing) => {
    const res = await setActive(current.id, !current.isActive);
    setNotice({ type: res.success ? 'success' : 'error', text: res.message });
    if (res.success) reload();
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove this listing from the marketplace? This cannot be undone.')) return;
    const res = await remove(listing.id);
    setNotice({
      type: res.success ? 'success' : 'error',
      text: res.success ? 'Listing removed' : res.message,
    });
    if (res.success) reload();
  };

  return (
    <div className="flex flex-col gap-6">
      <Link
        href={backHref}
        className="text-muted flex w-fit items-center gap-2 text-sm font-bold hover:text-lime-400"
      >
        <ArrowLeft size={16} /> My listings
      </Link>

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-3">
            <h1 className="text-foreground text-3xl font-black">
              {listing.tractorBrand} {listing.tractorModel}
            </h1>
            <ListingStatusBadge status={listing.listingStatus} />
            {listing.isCertified && (
              <span className="flex items-center gap-1 rounded-full border border-lime-400/30 bg-lime-400/10 px-3 py-1 text-xs font-bold text-lime-400">
                <ShieldCheck size={14} /> Certified
              </span>
            )}
          </div>
          <p className="text-2xl font-black text-lime-400">{formatINR(listing.askingPrice)}</p>
          <p className="text-muted mt-1 flex flex-wrap items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1">
              <Eye size={14} /> {listing.viewsCount} views
            </span>
            <span className="flex items-center gap-1">
              <MessageSquareText size={14} /> {listing.leadCount ?? 0} enquiries
            </span>
            <span>Listed {formatDate(listing.createdAt)}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {listing.listingStatus === ListingStatus.ACTIVE && (
            <Link
              href={`/used-tractors/details/${listing.id}`}
              className="glass-button text-foreground flex items-center gap-2 px-4 py-2 text-sm font-bold hover:text-lime-400"
            >
              <ExternalLink size={16} /> View public page
            </Link>
          )}
          <button
            disabled={!canToggle || busy}
            onClick={() => handleToggle(listing)}
            className={`glass-button flex items-center gap-2 px-4 py-2 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-40 ${
              listing.isActive ? 'text-foreground hover:text-red-400' : 'text-lime-400'
            }`}
          >
            {busy ? <Loader2 size={16} className="animate-spin" /> : <Power size={16} />}
            {listing.isActive ? 'Deactivate' : 'Activate'}
          </button>
          {!isClosed && (
            <button
              disabled={busy}
              onClick={handleRemove}
              className="glass-button text-muted flex items-center gap-2 px-4 py-2 text-sm font-bold hover:text-red-400 disabled:opacity-40"
            >
              <Trash2 size={16} /> Remove
            </button>
          )}
        </div>
      </div>

      {notice && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm font-medium ${
            notice.type === 'success'
              ? 'border-lime-400/30 bg-lime-400/10 text-lime-300'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}
        >
          {notice.text}
        </div>
      )}

      {listing.listingStatus === ListingStatus.PENDING_APPROVAL && (
        <p className="rounded-xl border border-sky-400/30 bg-sky-400/10 px-4 py-3 text-sm text-sky-300">
          Your listing is being reviewed by our team. It becomes visible to buyers once approved.
        </p>
      )}
      {listing.listingStatus === ListingStatus.PAUSED && (
        <p className="text-muted border-border/50 bg-foreground/5 rounded-xl border px-4 py-3 text-sm">
          This listing is inactive and hidden from buyers. Activate it to show it again.
        </p>
      )}
      {listing.listingStatus === ListingStatus.REJECTED && (
        <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          Rejected{listing.rejectionReason ? `: ${listing.rejectionReason}` : ''}
        </p>
      )}

      <div className="flex gap-2">
        {(['overview', 'photos', 'enquiries'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`glass-button px-4 py-2 text-sm font-bold capitalize ${
              tab === t ? 'text-lime-400 ring-1 ring-lime-400/50' : 'text-muted hover:text-lime-400'
            }`}
          >
            {t === 'photos' ? 'Photos & Papers' : t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          <p className="text-muted flex items-center gap-2 text-sm">
            <Lock size={14} /> Listing details are locked after submission and cannot be edited.
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            <Detail label="Year" value={listing.yearOfManufacture} />
            <Detail label="Owners" value={listing.ownership} />
            <Detail label="Hours used" value={listing.hoursUsed ?? '—'} />
            <Detail label="Overall condition" value={humanize(listing.conditionGrade)} />
            <Detail
              label="Engine"
              value={listing.engineConditionPct != null ? `${listing.engineConditionPct}%` : '—'}
            />
            <Detail label="Tyres" value={humanize(listing.tyreCondition)} />
            <Detail label="Hydraulics" value={humanize(listing.hydraulicsCondition)} />
            <Detail label="Body" value={humanize(listing.bodyCondition)} />
            <Detail label="Negotiable" value={listing.negotiable ? 'Yes' : 'No'} />
            <Detail label="Finance" value={listing.financeAvailable ? 'Available' : 'No'} />
            <Detail label="RC available" value={listing.rcAvailable ? 'Yes' : 'No'} />
            <Detail label="Loan status" value={humanize(listing.loanClearanceStatus)} />
            <Detail
              label="Location"
              value={[listing.villageCity, listing.district, listing.state]
                .filter(Boolean)
                .join(', ')}
            />
            <Detail label="Listing strength" value={`${listing.listingQualityScore ?? 0}/100`} />
            <Detail label="Expires" value={formatDate(listing.expiresAt)} />
            <Detail
              label="Inspection"
              value={inspection ? humanize(inspection.status) : 'Not scheduled'}
            />
          </div>
          {listing.description && (
            <div className="glass-inner p-4">
              <p className="text-muted mb-1 text-xs font-bold uppercase">Description</p>
              <p className="text-foreground text-sm whitespace-pre-line">{listing.description}</p>
            </div>
          )}
        </div>
      )}

      {tab === 'photos' && <ListingDocumentsManager listingId={listing.id} readOnly={isClosed} />}

      {tab === 'enquiries' && (
        <SellerEnquiryInbox
          listingId={listing.id}
          title="Enquiries for this tractor"
          description="Call interested buyers and update each lead as you progress."
        />
      )}
    </div>
  );
}
