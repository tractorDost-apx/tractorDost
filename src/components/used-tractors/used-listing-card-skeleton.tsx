'use client';

import React from 'react';

export function UsedListingCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-[2rem] border border-border/40 bg-card/40 p-4 backdrop-blur-md animate-pulse">
      <div className="aspect-[16/10] w-full rounded-2xl bg-muted/60" />
      <div className="mt-4 space-y-3">
        <div className="h-5 w-3/4 rounded-lg bg-muted/60" />
        <div className="h-4 w-1/2 rounded-lg bg-muted/40" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <div className="h-8 rounded-xl bg-muted/40" />
          <div className="h-8 rounded-xl bg-muted/40" />
        </div>
        <div className="pt-2 flex items-center justify-between border-t border-border/30">
          <div className="h-6 w-24 rounded-lg bg-muted/60" />
          <div className="h-8 w-20 rounded-xl bg-muted/60" />
        </div>
      </div>
    </div>
  );
}

export default UsedListingCardSkeleton;
