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
    <div className={`flex flex-col items-center text-center p-6 bg-background rounded-3xl border-2 transition-all h-full relative overflow-hidden ${isWinner ? 'border-[var(--color-brand-green)] shadow-lg shadow-[var(--color-brand-green)]/10' : 'border-transparent'}`}>
      
      {isWinner && (
        <div className="absolute top-0 inset-x-0 h-1 bg-[var(--color-brand-green)]" />
      )}
      
      <div className="w-full aspect-square max-h-[160px] bg-foreground/5 rounded-2xl p-4 flex items-center justify-center mb-4 border border-[var(--border-subtle)]">
        {tractor.primaryMedia?.url ? (
          <img src={tractor.primaryMedia.url} alt={tractor.modelName} className="w-full h-full object-contain hover:scale-110 transition-transform duration-500" />
        ) : (
          <TractorIcon size={48} className="text-muted/30" />
        )}
      </div>

      <div className="text-[10px] font-black uppercase tracking-widest text-[var(--color-brand-orange)] mb-1">
        {tractor.brand?.name || 'Unknown Brand'}
      </div>
      
      <h3 className="text-xl font-black text-foreground leading-tight mb-2">
        {tractor.modelName}
      </h3>
      
      <div className="mt-auto pt-4 flex flex-col gap-1 w-full">
        <span className="text-xs font-bold text-muted uppercase tracking-wider">Starting from</span>
        <span className="text-lg font-black text-foreground">
          {tractor.exShowroomPriceMin 
            ? `₹ ${Number(tractor.exShowroomPriceMin).toLocaleString('en-IN')}`
            : 'Price on Request'}
        </span>
      </div>
    </div>
  );
}
