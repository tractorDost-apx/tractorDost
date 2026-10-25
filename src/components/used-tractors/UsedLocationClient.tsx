'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  MapPin,
  Search,
  Filter,
  ArrowLeft,
  ArrowRight,
  Tractor,
  CheckCircle2,
  SlidersHorizontal,
} from 'lucide-react';
import { usedTractorListingAPI } from '@/lib/api/used-listings';
import { PublicUsedTractorCard } from '@/components/used-tractors/PublicUsedTractorCard';
import { PublicUsedQuickViewModal } from '@/components/used-tractors/PublicUsedQuickViewModal';
import { PublicUsedEnquiryModal } from '@/components/used-tractors/PublicUsedEnquiryModal';
import { TractorLoader } from '@/components/ui/TractorLoader';
import type { UsedTractorListing } from '@/types/models/used-listing';

interface UsedLocationClientProps {
  state?: string;
  district?: string;
  isCertifiedOnly?: boolean;
  title: string;
  subtitle: string;
}

export function UsedLocationClient({
  state,
  district,
  isCertifiedOnly,
  title,
  subtitle,
}: UsedLocationClientProps) {
  const [tractors, setTractors] = useState<UsedTractorListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Modals state
  const [quickViewId, setQuickViewId] = useState<number | null>(null);
  const [enquiryListing, setEnquiryListing] = useState<UsedTractorListing | null>(null);

  useEffect(() => {
    async function loadListings() {
      try {
        setLoading(true);
        const params: any = { limit: 24, page: 1 };
        if (state) params.state = state;
        if (district) params.district = district;
        if (isCertifiedOnly) params.isCertified = true;

        const res = await usedTractorListingAPI.getAllListings(params);
        if (res.success && res.data) {
          setTractors(res.data.data || []);
          setTotalCount(res.data.total || 0);
        } else {
          setTractors([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error('Failed to load used tractor listings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadListings();
  }, [state, district, isCertifiedOnly]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-7xl px-4 pt-8 pb-24 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-xs font-bold text-muted-foreground">
        <Link href="/used-tractors" className="hover:text-foreground">
          Used Tractors
        </Link>
        {state && (
          <>
            <span>/</span>
            <Link href={`/used-tractors/${state.toLowerCase()}`} className="hover:text-foreground">
              {state}
            </Link>
          </>
        )}
        {district && (
          <>
            <span>/</span>
            <span className="text-[var(--color-brand-green)]">{district}</span>
          </>
        )}
        {isCertifiedOnly && (
          <>
            <span>/</span>
            <span className="text-[var(--color-brand-green)]">Certified</span>
          </>
        )}
      </div>

      {/* Hero Banner */}
      <section className="relative mb-12 flex flex-col items-center justify-center pt-4 pb-10 text-center">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/10 px-4 py-1.5 text-xs font-black tracking-widest text-[var(--color-brand-green)] uppercase">
            {isCertifiedOnly ? (
              <>
                <ShieldCheck size={14} /> 120-Point Inspected & Certified
              </>
            ) : (
              <>
                <MapPin size={14} /> Verified Regional Marketplace
              </>
            )}
          </div>
          <h1 className="text-foreground text-4xl leading-tight font-extrabold tracking-tight md:text-5xl">
            {title}
          </h1>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base md:text-lg">
            {subtitle}
          </p>
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -z-10 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--color-brand-green)]/5 blur-[120px]" />
      </section>

      {/* Certified Guarantee Box if Certified */}
      {isCertifiedOnly && (
        <div className="mb-12 rounded-3xl border border-[var(--color-brand-green)]/30 bg-[var(--color-brand-green)]/5 p-6 md:p-8 backdrop-blur-xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-[var(--color-brand-green)] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-foreground text-sm font-bold mb-1">
                  120-Point Physical Inspection
                </strong>
                <span className="text-muted-foreground">
                  Engine compression, hydraulic lift pressure, gearbox backlash, and tyre tread depth verified by engineers.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-[var(--color-brand-green)] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-foreground text-sm font-bold mb-1">
                  100% Genuine RC & Hypothecation
                </strong>
                <span className="text-muted-foreground">
                  All loans and hypothecation clearances authenticated directly through Parivahan RTO registry.
                </span>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-[var(--color-brand-green)] shrink-0 mt-0.5" />
              <div>
                <strong className="block text-foreground text-sm font-bold mb-1">
                  Instant Pre-Approved Loans
                </strong>
                <span className="text-muted-foreground">
                  Avail up to 80% financing on certified used tractors with low interest rates and flexible harvest EMIs.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <TractorLoader size={48} />
          <p className="text-muted-foreground mt-4 text-sm font-semibold">Loading used tractors...</p>
        </div>
      ) : tractors.length === 0 ? (
        <div className="rounded-3xl border border-border/50 bg-card/40 p-12 text-center">
          <Tractor size={48} className="text-muted-foreground mx-auto mb-3" />
          <h3 className="text-foreground text-lg font-bold">No used tractors listed here yet</h3>
          <p className="text-muted-foreground text-xs mt-1 mb-6">
            Be the first to list your tractor in this location or explore all pre-owned listings across India.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/sell-used-tractor"
              className="rounded-full bg-[var(--color-brand-orange)] px-6 py-2.5 text-xs font-bold text-white shadow-md"
            >
              Sell Your Tractor
            </Link>
            <Link
              href="/used-tractors"
              className="rounded-full border border-border/60 bg-card px-6 py-2.5 text-xs font-bold text-foreground hover:bg-secondary"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tractors.map((listing) => (
            <PublicUsedTractorCard
              key={listing.id}
              listing={listing}
              viewMode="grid"
              onQuickView={(id) => setQuickViewId(id)}
              onEnquiry={(item) => setEnquiryListing(item)}
            />
          ))}
        </div>
      )}

      {/* Quick View Inspection Modal */}
      <PublicUsedQuickViewModal
        listingId={quickViewId}
        onClose={() => setQuickViewId(null)}
        onContactSeller={(item) => setEnquiryListing(item)}
      />

      {/* Secure Contact Seller Modal */}
      <PublicUsedEnquiryModal
        listing={enquiryListing}
        onClose={() => setEnquiryListing(null)}
        onSuccess={() => setEnquiryListing(null)}
      />
    </div>
  );
}
