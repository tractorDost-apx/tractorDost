'use client';

import React from 'react';
import { PublicUsedTractorCard } from './PublicUsedTractorCard';
import { UsedListingCardSkeleton } from './used-listing-card-skeleton';
import type { UsedTractorListing } from '@/types/models/used-listing';

interface UsedListingGridProps {
  listings: UsedTractorListing[];
  isLoading?: boolean;
  onQuickView?: (id: number) => void;
  onEnquiry?: (listing: UsedTractorListing) => void;
  emptyMessage?: string;
}

export function UsedListingGrid({
  listings,
  isLoading = false,
  onQuickView = () => {},
  onEnquiry = () => {},
  emptyMessage = 'No used tractors found matching your criteria.',
}: UsedListingGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <UsedListingCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border/60 p-12 text-center">
        <p className="text-sm font-medium text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {listings.map((listing) => (
        <PublicUsedTractorCard
          key={listing.id}
          listing={listing}
          onQuickView={onQuickView}
          onEnquiry={onEnquiry}
        />
      ))}
    </div>
  );
}

export default UsedListingGrid;
