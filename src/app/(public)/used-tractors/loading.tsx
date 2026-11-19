import React from 'react';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function Loading() {
  return (
    <div className="mx-auto flex min-h-[85vh] w-full max-w-7xl flex-col items-center justify-center px-4 py-16">
      <TractorLoader size={64} className="text-[var(--color-brand-green)]" />
      <p className="mt-5 animate-pulse text-xs font-black tracking-[0.2em] text-[var(--color-brand-green)] uppercase">
        Loading Verified Listing...
      </p>
    </div>
  );
}
