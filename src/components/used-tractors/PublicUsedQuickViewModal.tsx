'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  X,
  Tractor,
  IndianRupee,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  User,
  Eye,
  FileCheck,
  CircleDollarSign,
  Wrench,
  Loader2,
  ChevronRight,
  MessageCircle,
} from 'lucide-react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { formatINR } from '@/lib/utils/format-currency';
import type { UsedTractorListing } from '@/types/models/used-listing';

interface PublicUsedQuickViewModalProps {
  listingId: number | null;
  onClose: () => void;
  onContactSeller: (listing: UsedTractorListing) => void;
}

export function PublicUsedQuickViewModal({
  listingId,
  onClose,
  onContactSeller,
}: PublicUsedQuickViewModalProps) {
  const [listing, setListing] = useState<UsedTractorListing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  useEffect(() => {
    if (!listingId) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    usedTractorListingAPI
      .getListingById(listingId)
      .then((res) => {
        if (!isMounted) return;
        if (res.success && res.data) {
          setListing(res.data);
        } else {
          setError(res.message || 'Failed to load tractor details.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Error fetching details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [listingId]);

  if (!listingId) return null;

  const mediaList = listing?.media || [];
  const activeMediaUrl = mediaList[activePhotoIdx]?.url || null;
  const fullTitle = listing ? `${listing.tractorBrand} ${listing.tractorModel}` : 'Tractor Details';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-h-[80vh] overflow-y-auto w-full max-w-4xl rounded-3xl border border-[var(--border-subtle)] bg-background p-6 shadow-2xl md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-muted hover:text-foreground absolute top-6 right-6 rounded-full p-2 transition-colors"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={36} />
            <p className="text-muted mt-3 text-xs font-bold">Loading tractor specifications...</p>
          </div>
        ) : error || !listing ? (
          <div className="py-12 text-center">
            <p className="text-red-400 font-bold text-sm">{error || 'Unable to find listing.'}</p>
            <button
              onClick={onClose}
              className="bg-foreground/5 text-foreground mt-4 rounded-xl px-5 py-2 text-xs font-bold"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header */}
            <div className="border-b border-[var(--border-subtle)] pb-4 pr-8">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-black text-foreground">{fullTitle}</h2>
                {listing.isCertified && (
                  <span className="flex items-center gap-1 rounded-full border border-lime-400/30 bg-lime-400/10 px-2.5 py-0.5 text-xs font-bold text-lime-400">
                    <ShieldCheck size={13} /> Certified
                  </span>
                )}
              </div>
              <p className="text-muted mt-1 flex items-center gap-1 text-xs font-bold">
                <MapPin size={13} className="text-[var(--color-brand-green)]" />
                <span>{listing.district}, {listing.state}</span>
              </p>
            </div>

            {/* Gallery & Pricing Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Image Preview */}
              <div className="lg:col-span-6 space-y-3">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-foreground/5 flex items-center justify-center">
                  {activeMediaUrl ? (
                    <img src={activeMediaUrl} alt={fullTitle} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-muted">
                      <Tractor size={48} className="stroke-[1.5]" />
                      <span className="mt-2 text-xs font-medium">No Image</span>
                    </div>
                  )}
                </div>

                {mediaList.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {mediaList.map((m, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all ${
                          activePhotoIdx === idx
                            ? 'border-[var(--color-brand-green)]'
                            : 'border-[var(--border-subtle)] opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={m.url} alt={`Thumb ${idx + 1}`} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Price & Summary */}
              <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
                <div className="bg-foreground/[0.03] rounded-2xl border border-[var(--border-subtle)] p-5">
                  <span className="text-muted text-xs font-black tracking-widest uppercase">Asking Price</span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-black text-[var(--color-brand-green)]">
                      {formatINR(listing.askingPrice)}
                    </span>
                    {listing.negotiable && (
                      <span className="rounded-md border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 px-2 py-0.5 text-xs font-bold text-[var(--color-brand-green)]">
                        Negotiable
                      </span>
                    )}
                  </div>
                  {listing.financeAvailable && (
                    <p className="text-purple-400 mt-2 text-xs font-bold flex items-center gap-1.5">
                      <CircleDollarSign size={14} /> Easy EMI & Loan Assistance Available
                    </p>
                  )}
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-foreground/[0.02] rounded-xl border border-[var(--border-subtle)] p-3">
                    <span className="text-muted text-[10px] font-bold block">Year</span>
                    <span className="text-foreground font-black text-sm">{listing.yearOfManufacture}</span>
                  </div>
                  <div className="bg-foreground/[0.02] rounded-xl border border-[var(--border-subtle)] p-3">
                    <span className="text-muted text-[10px] font-bold block">Ownership</span>
                    <span className="text-foreground font-black text-sm">{listing.ownership}st Owner</span>
                  </div>
                  <div className="bg-foreground/[0.02] rounded-xl border border-[var(--border-subtle)] p-3">
                    <span className="text-muted text-[10px] font-bold block">Hours Run</span>
                    <span className="text-foreground font-black text-sm">{listing.hoursUsed ? `${listing.hoursUsed} hrs` : 'N/A'}</span>
                  </div>
                </div>

                {/* Seller info - safe */}
                <div className="bg-foreground/[0.02] rounded-xl border border-[var(--border-subtle)] p-3 text-xs flex items-center justify-between">
                  <span className="text-muted font-bold">Listed by:</span>
                  <span className="text-foreground font-black">
                    {listing.seller?.fullName || 'Verified Seller'}
                  </span>
                </div>
              </div>
            </div>

            {/* Condition Scores */}
            <div className="bg-foreground/[0.02] rounded-2xl border border-[var(--border-subtle)] p-5">
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)] flex items-center gap-1.5 mb-3">
                <Wrench size={14} /> Inspection & Condition Assessment
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3">
                  <span className="text-muted text-[10px] font-bold block">Engine Health</span>
                  <span className="text-foreground font-black text-sm">
                    {listing.engineConditionPct ? `${listing.engineConditionPct}%` : 'Good'}
                  </span>
                </div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3">
                  <span className="text-muted text-[10px] font-bold block">Tyres Condition</span>
                  <span className="text-foreground font-black text-sm">{listing.tyreCondition || 'Good'}</span>
                </div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3">
                  <span className="text-muted text-[10px] font-bold block">Hydraulics</span>
                  <span className="text-foreground font-black text-sm">{listing.hydraulicsCondition || 'Good'}</span>
                </div>
                <div className="rounded-xl border border-[var(--border-subtle)] bg-background/50 p-3">
                  <span className="text-muted text-[10px] font-bold block">Clutch / Transmission</span>
                  <span className="text-foreground font-black text-sm">{listing.clutchCondition || 'Good'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-foreground/[0.02] rounded-2xl border border-[var(--border-subtle)] p-4 text-xs text-muted leading-relaxed">
                <span className="text-foreground font-bold block mb-1">Seller Notes:</span>
                &ldquo;{listing.description}&rdquo;
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-[var(--border-subtle)] pt-4">
              <button
                onClick={() => {
                  onClose();
                  onContactSeller(listing);
                }}
                className="bg-[var(--color-brand-orange)]/10 hover:bg-[var(--color-brand-orange)]/20 text-[var(--color-brand-orange)] flex items-center gap-1.5 rounded-xl border border-[var(--color-brand-orange)]/30 px-5 py-2.5 text-xs font-bold transition-all"
              >
                <MessageCircle size={14} /> Contact Seller
              </button>
              <Link
                href={`/used-tractors/details/${listing.id}`}
                className="bg-[var(--color-brand-green)] hover:opacity-90 text-black flex items-center gap-1.5 rounded-xl px-6 py-2.5 text-xs font-bold shadow-md shadow-[var(--color-brand-green)]/20 transition-all"
              >
                Full Details Page <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
