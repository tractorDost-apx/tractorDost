'use client';

import React from 'react';
import Link from 'next/link';
import {
  Tractor,
  Eye,
  MessageSquareText,
  MapPin,
  Clock,
  User,
  ShieldCheck,
  Settings2,
  Trash2,
  Power,
  Camera,
} from 'lucide-react';
import { ListingStatusBadge } from '@/components/used-tractors/status-badges';
import { formatINR } from '@/lib/utils/format-currency';
import { formatDate } from '@/lib/utils/format-date';
import { ListingStatus, type UsedTractorListing } from '@/types/models/used-listing';

interface DealerUsedListingCardProps {
  listing: UsedTractorListing;
  isToggling: boolean;
  onToggleActive: (listing: UsedTractorListing) => void;
  onQuickView: (listingId: number) => void;
  onOpenPhotos: (listingId: number, title: string) => void;
  onOpenEnquiries: (listingId: number, title: string) => void;
  onDelete: (listing: UsedTractorListing) => void;
}

export function DealerUsedListingCard({
  listing,
  isToggling,
  onToggleActive,
  onQuickView,
  onOpenPhotos,
  onOpenEnquiries,
  onDelete,
}: DealerUsedListingCardProps) {
  const cover = listing.media?.[0]?.url;
  const canToggle =
    listing.listingStatus === ListingStatus.ACTIVE || listing.listingStatus === ListingStatus.PAUSED;
  const isSoldOrExpired =
    listing.listingStatus === ListingStatus.SOLD || listing.listingStatus === ListingStatus.EXPIRED;
  const fullTitle = `${listing.tractorBrand} ${listing.tractorModel}`;

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-lime-400/30 hover:shadow-lg hover:shadow-lime-400/5">
      {/* Top Media & Tags */}
      <div>
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-900 flex items-center justify-center">
          {cover ? (
            <img
              src={cover}
              alt={fullTitle}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-600">
              <Tractor size={42} className="stroke-[1.5]" />
              <span className="text-[11px] font-medium mt-1">No Image</span>
            </div>
          )}

          {/* Status Badge overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            <ListingStatusBadge status={listing.listingStatus} />
            {listing.isCertified && (
              <span className="flex items-center gap-1 rounded-full border border-lime-400/30 bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold text-lime-400 backdrop-blur-sm">
                <ShieldCheck size={12} /> Dealer Certified
              </span>
            )}
          </div>

          {/* Quick Actions overlay */}
          <div className="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
            <button
              onClick={() => onOpenPhotos(listing.id, fullTitle)}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950/80 px-2 py-1 text-[11px] font-bold text-foreground opacity-90 backdrop-blur-sm hover:bg-lime-400 hover:text-black transition-all"
              title="Manage Photos & Papers"
            >
              <Camera size={12} /> Photos
            </button>
            <button
              onClick={() => onQuickView(listing.id)}
              className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-950/80 px-2.5 py-1 text-xs font-bold text-foreground opacity-90 backdrop-blur-sm hover:bg-lime-400 hover:text-black transition-all"
            >
              <Eye size={13} /> Specs
            </button>
          </div>
        </div>

        {/* Title & Price */}
        <div className="mt-3.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-black text-foreground group-hover:text-lime-400 transition-colors line-clamp-1">
                {fullTitle}
              </h3>
              <p className="text-xs text-muted font-medium flex items-center gap-1 mt-0.5">
                <MapPin size={12} className="text-lime-400/80" />
                <span>{listing.district}, {listing.state}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="text-lg font-black text-lime-400 block">
                {formatINR(listing.askingPrice)}
              </span>
              {listing.negotiable && (
                <span className="text-[10px] font-bold text-muted uppercase">Negotiable</span>
              )}
            </div>
          </div>

          {/* Specs grid */}
          <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-xl border border-slate-800/80 bg-slate-900/50 p-2 text-center text-xs">
            <div>
              <span className="text-[10px] font-bold text-muted block">Year</span>
              <span className="font-black text-foreground">{listing.yearOfManufacture}</span>
            </div>
            <div className="border-x border-slate-800">
              <span className="text-[10px] font-bold text-muted block">Owner</span>
              <span className="font-black text-foreground">{listing.ownership}st</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-muted block">Hours Run</span>
              <span className="font-black text-foreground">{listing.hoursUsed ? `${listing.hoursUsed}h` : '—'}</span>
            </div>
          </div>

          {/* Views & Leads Bar */}
          <div className="mt-2.5 flex items-center justify-between border-t border-slate-800/60 pt-2 text-xs text-muted font-medium">
            <span className="flex items-center gap-1">
              <Eye size={13} /> {listing.viewsCount ?? 0} views
            </span>
            <button
              onClick={() => onOpenEnquiries(listing.id, fullTitle)}
              className="flex items-center gap-1 text-purple-400 font-bold hover:underline"
              title="View Enquiries / Leads"
            >
              <MessageSquareText size={13} /> {listing.leadCount ?? 0} leads
            </button>
            <span className="text-[11px]">{formatDate(listing.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-800 pt-3">
        {/* Toggle Active Button */}
        {canToggle && (
          <button
            onClick={() => onToggleActive(listing)}
            disabled={isToggling}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all ${
              listing.isActive
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
            }`}
            title={listing.isActive ? 'Click to Pause / Hide' : 'Click to Make Live'}
          >
            <Power size={13} className={isToggling ? 'animate-spin' : ''} />
            {listing.isActive ? 'Active (Live)' : 'Paused'}
          </button>
        )}

        {isSoldOrExpired && (
          <span className="text-xs font-bold text-muted px-2 py-1">
            Archived
          </span>
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          {/* Manage / Photos link */}
          <Link
            href={`/dealer/used-listings/${listing.id}`}
            className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-bold text-slate-200 hover:border-lime-400/40 hover:text-lime-400 transition-all"
          >
            <Settings2 size={13} /> Details
          </Link>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(listing)}
            className="rounded-xl border border-slate-800 bg-slate-900/60 p-1.5 text-slate-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all"
            title="Delete Listing"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
