'use client';

import React from 'react';
import Link from 'next/link';
import {
  Tractor,
  MapPin,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Eye,
  MessageCircle,
  FileCheck,
  CircleDollarSign,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { formatINR } from '@/lib/utils/format-currency';
import type { UsedTractorListing } from '@/types/models/used-listing';

interface PublicUsedTractorCardProps {
  listing: UsedTractorListing;
  viewMode?: 'grid' | 'list';
  onQuickView: (listingId: number) => void;
  onEnquiry: (listing: UsedTractorListing) => void;
}

export function PublicUsedTractorCard({
  listing,
  viewMode = 'grid',
  onQuickView,
  onEnquiry,
}: PublicUsedTractorCardProps) {
  const cover =
    listing.media?.[0]?.url ||
    (Array.isArray((listing as any).documents) && (listing as any).documents[0]?.url) ||
    null;

  const fullTitle = `${listing.tractorBrand} ${listing.tractorModel}`;

  if (viewMode === 'list') {
    return (
      <div className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-background/60 p-4 backdrop-blur-md transition-all duration-300 hover:border-[var(--color-brand-green)]/40 hover:shadow-xl hover:shadow-[var(--color-brand-green)]/5 md:flex-row md:items-center md:gap-6 md:p-5">
        {/* Image */}
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden rounded-2xl bg-foreground/5 md:w-64">
          {cover ? (
            <img
              src={cover}
              alt={fullTitle}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-muted">
              <Tractor size={40} className="stroke-[1.5]" />
              <span className="mt-1 text-xs font-medium">No Image</span>
            </div>
          )}

          {listing.isCertified && (
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full border border-lime-400/30 bg-black/80 px-2.5 py-0.5 text-[11px] font-bold text-lime-400 backdrop-blur-sm">
              <ShieldCheck size={13} /> Certified
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-4 flex flex-1 flex-col justify-between md:mt-0">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <Link
                  href={`/used-tractors/details/${listing.id}`}
                  className="text-foreground hover:text-[var(--color-brand-green)] transition-colors"
                >
                  <h3 className="text-lg font-black tracking-tight md:text-xl">{fullTitle}</h3>
                </Link>
                <p className="text-muted mt-1 flex items-center gap-1.5 text-xs font-bold">
                  <MapPin size={13} className="text-[var(--color-brand-green)]" />
                  <span>{listing.district}, {listing.state}</span>
                </p>
              </div>

              <div className="text-left md:text-right">
                <span className="text-xl font-black text-[var(--color-brand-green)] block">
                  {formatINR(listing.askingPrice)}
                </span>
                {listing.negotiable && (
                  <span className="text-[10px] font-bold text-muted uppercase">Negotiable</span>
                )}
              </div>
            </div>

            {/* Spec Chips */}
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 font-bold">
                <Calendar size={13} className="text-muted" /> {listing.yearOfManufacture}
              </span>
              <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 font-bold">
                <User size={13} className="text-muted" /> {listing.ownership}st Owner
              </span>
              <span className="bg-foreground/5 text-foreground flex items-center gap-1.5 rounded-lg border border-[var(--border-subtle)] px-2.5 py-1 font-bold">
                <Clock size={13} className="text-muted" /> {listing.hoursUsed ? `${listing.hoursUsed} hrs` : 'N/A'}
              </span>
              {listing.rcAvailable && (
                <span className="bg-emerald-500/10 text-emerald-400 flex items-center gap-1 rounded-lg border border-emerald-500/20 px-2.5 py-1 font-bold">
                  <FileCheck size={13} /> RC Available
                </span>
              )}
              {listing.financeAvailable && (
                <span className="bg-purple-500/10 text-purple-400 flex items-center gap-1 rounded-lg border border-purple-500/20 px-2.5 py-1 font-bold">
                  <CircleDollarSign size={13} /> Loan Available
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5 border-t border-[var(--border-subtle)] pt-3">
            <button
              onClick={() => onQuickView(listing.id)}
              className="bg-foreground/5 hover:bg-foreground/10 text-foreground flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all"
            >
              <Eye size={14} /> Quick View
            </button>
            <button
              onClick={() => onEnquiry(listing)}
              className="bg-[var(--color-brand-orange)]/10 hover:bg-[var(--color-brand-orange)]/20 text-[var(--color-brand-orange)] flex items-center gap-1.5 rounded-xl border border-[var(--color-brand-orange)]/30 px-3.5 py-2 text-xs font-bold transition-all"
            >
              <MessageCircle size={14} /> Contact Seller
            </button>
            <Link
              href={`/used-tractors/details/${listing.id}`}
              className="bg-[var(--color-brand-green)] hover:opacity-90 text-white flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-md shadow-[var(--color-brand-green)]/20 transition-all"
            >
              View Details <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Grid View Mode
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-[var(--border-subtle)] bg-background/60 p-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-[var(--color-brand-green)]/40 hover:shadow-xl hover:shadow-[var(--color-brand-green)]/5">
      <div>
        {/* Media Thumbnail */}
        <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-foreground/5">
          {cover ? (
            <img
              src={cover}
              alt={fullTitle}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center text-muted">
              <Tractor size={42} className="stroke-[1.5]" />
              <span className="mt-1 text-xs font-medium">No Image</span>
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
            {listing.isCertified && (
              <span className="flex items-center gap-1 rounded-full border border-lime-400/30 bg-black/80 px-2.5 py-0.5 text-[10px] font-bold text-lime-400 backdrop-blur-sm">
                <ShieldCheck size={12} /> Certified
              </span>
            )}
            {listing.conditionGrade && (
              <span className="rounded-full border border-white/20 bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white uppercase backdrop-blur-sm">
                {listing.conditionGrade}
              </span>
            )}
          </div>

          {/* Quick View Button */}
          <button
            onClick={() => onQuickView(listing.id)}
            className="absolute bottom-2.5 right-2.5 flex items-center gap-1 rounded-lg border border-white/20 bg-black/80 px-2.5 py-1 text-[11px] font-bold text-white opacity-0 group-hover:opacity-100 backdrop-blur-sm hover:bg-[var(--color-brand-green)] hover:text-black transition-all"
          >
            <Eye size={12} /> Quick Specs
          </button>
        </div>

        {/* Title & Location */}
        <div className="mt-3.5">
          <Link
            href={`/used-tractors/details/${listing.id}`}
            className="text-foreground hover:text-[var(--color-brand-green)] transition-colors block"
          >
            <h3 className="text-base font-black tracking-tight line-clamp-1">{fullTitle}</h3>
          </Link>
          <p className="text-muted mt-1 flex items-center gap-1 text-xs font-bold">
            <MapPin size={12} className="text-[var(--color-brand-green)]" />
            <span>{listing.district}, {listing.state}</span>
          </p>
        </div>

        {/* Specs Grid */}
        <div className="mt-3 grid grid-cols-3 gap-1.5 rounded-xl border border-[var(--border-subtle)] bg-foreground/[0.02] p-2 text-center text-xs">
          <div>
            <span className="text-muted text-[10px] font-bold block">Year</span>
            <span className="text-foreground font-black">{listing.yearOfManufacture}</span>
          </div>
          <div className="border-x border-[var(--border-subtle)]">
            <span className="text-muted text-[10px] font-bold block">Owner</span>
            <span className="text-foreground font-black">{listing.ownership}st</span>
          </div>
          <div>
            <span className="text-muted text-[10px] font-bold block">Hours Run</span>
            <span className="text-foreground font-black">{listing.hoursUsed ? `${listing.hoursUsed}h` : 'N/A'}</span>
          </div>
        </div>

        {/* Pricing & Tag */}
        <div className="mt-3 flex items-baseline justify-between border-t border-[var(--border-subtle)] pt-2.5">
          <div>
            <span className="text-lg font-black text-[var(--color-brand-green)] block">
              {formatINR(listing.askingPrice)}
            </span>
            {listing.negotiable && (
              <span className="text-muted text-[10px] font-bold uppercase">Price Negotiable</span>
            )}
          </div>
          {listing.financeAvailable && (
            <span className="bg-purple-500/10 text-purple-400 rounded-md border border-purple-500/20 px-2 py-0.5 text-[10px] font-bold">
              Loan Available
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 grid grid-cols-2 gap-2 border-t border-[var(--border-subtle)] pt-3">
        <button
          onClick={() => onEnquiry(listing)}
          className="bg-[var(--color-brand-orange)]/10 hover:bg-[var(--color-brand-orange)]/20 text-[var(--color-brand-orange)] flex items-center justify-center gap-1 rounded-xl border border-[var(--color-brand-orange)]/30 py-2 text-xs font-bold transition-all"
        >
          <MessageCircle size={13} /> Contact
        </button>
        <Link
          href={`/used-tractors/details/${listing.id}`}
          className="bg-[var(--color-brand-green)] hover:opacity-90 text-white flex items-center justify-center gap-1 rounded-xl py-2 text-xs font-bold shadow-md shadow-[var(--color-brand-green)]/20 transition-all"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
