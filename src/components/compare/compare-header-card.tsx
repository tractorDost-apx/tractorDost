'use client';

import React from 'react';
import { Tractor } from '@/lib/api/tractors';
import { Tractor as TractorIcon, Check, X } from 'lucide-react';

interface CompareHeaderCardProps {
  tractor: Tractor;
  isWinner?: boolean;
}

export default function CompareHeaderCard({ tractor, isWinner = false }: CompareHeaderCardProps) {
  return (
    <div
      className={`bg-background relative flex h-full flex-col items-center overflow-hidden rounded-3xl border-2 p-6 text-center transition-all ${isWinner ? 'border-[var(--color-brand-green)] shadow-[var(--color-brand-green)]/10 shadow-lg' : 'border-transparent'}`}
    >
      {isWinner && <div className="absolute inset-x-0 top-0 h-1 bg-[var(--color-brand-green)]" />}

      <div className="bg-foreground/5 mb-4 flex aspect-square max-h-[160px] w-full items-center justify-center rounded-2xl border border-[var(--border-subtle)] p-4">
        {tractor.primaryMedia?.url ? (
          <img
            src={tractor.primaryMedia.url}
            alt={tractor.modelName}
            className="h-full w-full object-contain transition-transform duration-500 hover:scale-110"
          />
        ) : (
          <TractorIcon size={48} className="text-muted/30" />
        )}
      </div>

      <div className="mb-1 text-[10px] font-black tracking-widest text-[var(--color-brand-orange)] uppercase">
        {tractor.brand?.name || 'Unknown Brand'}
      </div>

      <h3 className="text-foreground mb-2 text-xl leading-tight font-black">{tractor.modelName}</h3>

      <div className="mt-auto flex w-full flex-col gap-1 pt-4">
        <span className="text-muted text-xs font-bold tracking-wider uppercase">Starting from</span>
        <span className="text-foreground text-lg font-black">
          {tractor.exShowroomPriceMin
            ? `₹ ${Number(tractor.exShowroomPriceMin).toLocaleString('en-IN')}`
            : 'Price on Request'}
        </span>
      </div>
    </div>
  );
}
