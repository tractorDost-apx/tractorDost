import React from 'react';
import { TractorLoader } from '@/components/ui/TractorLoader';

export default function Loading() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6">
      <TractorLoader size={64} className="text-[var(--color-brand-green)]" />
      <div className="text-[var(--color-brand-green)] animate-pulse text-sm font-black tracking-[0.2em] uppercase">
        Loading...
      </div>
    </div>
  );
}
