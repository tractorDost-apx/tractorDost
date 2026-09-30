'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, Loader2, MessageSquareText, Tractor } from 'lucide-react';
import { SpatialButton } from '@/components/ui/spatial-button';
import { LeadStatusBadge } from '@/components/used-tractors/status-badges';
import { useMyEnquiries } from '@/hooks/leads/use-my-enquiries';
import { formatINR } from '@/lib/utils/format-currency';
import { formatDateTime } from '@/lib/utils/format-date';
import { ListingStatus } from '@/types/models/used-listing';

export default function MyEnquiriesPage() {
  const [page, setPage] = useState(1);
  const { data, loading, error, reload } = useMyEnquiries({ page });

  const enquiries = data?.data ?? [];
  const totalPages = data?.meta.totalPages ?? 1;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-8">
        <h1 className="text-foreground mb-2 text-3xl font-black">My Enquiries</h1>
        <p className="text-muted font-medium">
          Used tractors you&apos;ve enquired about while logged in, and where each seller is with
          your request.
        </p>
      </div>

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
      ) : enquiries.length === 0 ? (
        <div className="glass-inner flex flex-col items-center p-12 text-center">
          <MessageSquareText className="text-muted mb-4" size={40} />
          <p className="text-foreground mb-1 font-bold">No enquiries yet</p>
          <p className="text-muted mb-6 text-sm">
            Found a tractor you like? Send the seller an enquiry.
          </p>
          <SpatialButton href="/used-tractors" variant="secondary">
            Browse used tractors
          </SpatialButton>
        </div>
      ) : (
        <div className="space-y-4">
          {enquiries.map((enq) => {
            const isLive = enq.listing.listingStatus === ListingStatus.ACTIVE;
            return (
              <div key={enq.id} className="glass-inner p-6">
                <div className="mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div>
                    <h3 className="text-foreground flex items-center gap-2 text-lg font-bold">
                      <Tractor size={18} className="text-lime-400" />
                      {isLive ? (
                        <Link
                          href={`/used-tractors/details/${enq.listing.id}`}
                          className="hover:text-lime-400"
                        >
                          {enq.listing.tractorBrand} {enq.listing.tractorModel}
                        </Link>
                      ) : (
                        <span>
                          {enq.listing.tractorBrand} {enq.listing.tractorModel}
                        </span>
                      )}
                    </h3>
                    <p className="text-muted mt-1 text-sm font-medium">
                      {enq.listing.askingPrice != null &&
                        `${formatINR(enq.listing.askingPrice)} · `}
                      {isLive ? 'Listing live' : 'No longer available'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <LeadStatusBadge status={enq.status} />
                    <span className="text-muted flex items-center gap-1 text-xs font-bold">
                      <Calendar size={14} /> {formatDateTime(enq.createdAt)}
                    </span>
                  </div>
                </div>

                {enq.message && (
                  <div className="bg-secondary/20 flex gap-3 rounded-xl p-4">
                    <MessageSquareText size={20} className="text-muted mt-0.5 flex-shrink-0" />
                    <p className="text-foreground text-sm leading-relaxed font-medium">
                      &ldquo;{enq.message}&rdquo;
                    </p>
                  </div>
                )}
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
