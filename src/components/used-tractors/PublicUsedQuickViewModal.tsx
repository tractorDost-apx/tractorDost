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
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm animate-in fade-in duration-200 dark:bg-black/75"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative max-h-[85vh] overflow-y-auto w-full max-w-4xl rounded-3xl border border-zinc-200 bg-white p-6 shadow-2xl transition-all md:p-8 dark:border-white/10 dark:bg-[#141a16]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 rounded-full p-2 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 transition-colors dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-[var(--color-brand-green)]" size={36} />
            <p className="mt-3 text-xs font-bold text-zinc-500 dark:text-zinc-400">Loading tractor specifications...</p>
          </div>
        ) : error || !listing ? (
          <div className="py-12 text-center">
            <p className="text-red-500 font-bold text-sm">{error || 'Unable to find listing.'}</p>
            <button
              onClick={onClose}
              className="mt-4 rounded-xl border border-zinc-200 bg-zinc-100 px-5 py-2 text-xs font-bold text-zinc-700 hover:bg-zinc-200 dark:border-white/10 dark:bg-white/5 dark:text-zinc-300 dark:hover:bg-white/10"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header */}
            <div className="border-b border-zinc-100 pb-4 pr-8 dark:border-white/10">
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-black text-zinc-900 dark:text-white">{fullTitle}</h2>
                {listing.isCertified && (
                  <span className="flex items-center gap-1 rounded-full border border-lime-500/30 bg-lime-500/10 px-2.5 py-0.5 text-xs font-bold text-lime-600 dark:text-lime-400">
                    <ShieldCheck size={13} /> Certified
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <MapPin size={13} className="text-[var(--color-brand-green)]" />
                <span>{listing.district}, {listing.state}</span>
              </p>
            </div>

            {/* Gallery & Pricing Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
              {/* Image Preview */}
              <div className="lg:col-span-6 space-y-3">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl border border-zinc-200/80 bg-zinc-50 flex items-center justify-center dark:border-white/10 dark:bg-white/5">
                  {activeMediaUrl ? (
                    <img src={activeMediaUrl} alt={fullTitle} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
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
                            : 'border-zinc-200 opacity-60 hover:opacity-100 dark:border-white/10'
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
                <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <span className="text-xs font-black tracking-widest uppercase text-zinc-500 dark:text-zinc-400">Asking Price</span>
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
                    <p className="mt-2 text-xs font-bold text-purple-600 flex items-center gap-1.5 dark:text-purple-400">
                      <CircleDollarSign size={14} /> Easy EMI & Loan Assistance Available
                    </p>
                  )}
                </div>

                {/* Key Specs */}
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                    <span className="text-[10px] font-bold block text-zinc-500 dark:text-zinc-400">Year</span>
                    <span className="font-black text-sm text-zinc-900 dark:text-white">{listing.yearOfManufacture}</span>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                    <span className="text-[10px] font-bold block text-zinc-500 dark:text-zinc-400">Ownership</span>
                    <span className="font-black text-sm text-zinc-900 dark:text-white">{listing.ownership}st Owner</span>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 dark:border-white/10 dark:bg-white/5">
                    <span className="text-[10px] font-bold block text-zinc-500 dark:text-zinc-400">Hours Run</span>
                    <span className="font-black text-sm text-zinc-900 dark:text-white">{listing.hoursUsed ? `${listing.hoursUsed} hrs` : 'N/A'}</span>
                  </div>
                </div>

                {/* Seller info - safe */}
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs flex items-center justify-between dark:border-white/10 dark:bg-white/5">
                  <span className="font-bold text-zinc-500 dark:text-zinc-400">Listed by:</span>
                  <span className="font-black text-zinc-900 dark:text-white">
                    {listing.seller?.fullName || 'Verified Seller'}
                  </span>
                </div>
              </div>
            </div>

            {/* Condition Scores */}
            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5 dark:border-white/10 dark:bg-white/5">
              <h4 className="text-xs font-black uppercase tracking-wider text-[var(--color-brand-green)] flex items-center gap-1.5 mb-3">
                <Wrench size={14} /> Inspection & Condition Assessment
              </h4>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
                <div className="rounded-xl border border-zinc-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                  <span className="text-[10px] font-bold block text-zinc-500 dark:text-zinc-400">Engine Health</span>
                  <span className="font-black text-sm text-zinc-900 dark:text-white">
                    {listing.engineConditionPct ? `${listing.engineConditionPct}%` : 'Good'}
                  </span>
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                  <span className="text-[10px] font-bold block text-zinc-500 dark:text-zinc-400">Tyres Condition</span>
                  <span className="font-black text-sm text-zinc-900 dark:text-white">{listing.tyreCondition || 'Good'}</span>
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                  <span className="text-[10px] font-bold block text-zinc-500 dark:text-zinc-400">Hydraulics</span>
                  <span className="font-black text-sm text-zinc-900 dark:text-white">{listing.hydraulicsCondition || 'Good'}</span>
                </div>
                <div className="rounded-xl border border-zinc-200/80 bg-white p-3 dark:border-white/10 dark:bg-white/5">
                  <span className="text-[10px] font-bold block text-zinc-500 dark:text-zinc-400">Clutch / Transmission</span>
                  <span className="font-black text-sm text-zinc-900 dark:text-white">{listing.clutchCondition || 'Good'}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {listing.description && (
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4 text-xs text-zinc-600 leading-relaxed dark:border-white/10 dark:bg-white/5 dark:text-zinc-300">
                <span className="font-bold block mb-1 text-zinc-900 dark:text-white">Seller Notes:</span>
                &ldquo;{listing.description}&rdquo;
              </div>
            )}

            {/* Action Bar */}
            <div className="flex flex-wrap items-center justify-end gap-3 border-t border-zinc-100 pt-4 dark:border-white/10">
              <button
                onClick={() => {
                  onClose();
                  onContactSeller(listing);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-[var(--color-brand-orange)]/30 bg-[var(--color-brand-orange)]/10 px-5 py-2.5 text-xs font-bold text-[var(--color-brand-orange)] transition-all hover:bg-[var(--color-brand-orange)]/20"
              >
                <MessageCircle size={14} /> Contact Seller
              </button>
              <Link
                href={`/used-tractors/details/${listing.id}`}
                className="flex items-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-[var(--color-brand-green)]/20 transition-all hover:bg-[var(--color-brand-green-dark)] hover:shadow-lg"
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
