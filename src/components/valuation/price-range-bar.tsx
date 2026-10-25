'use client';

import React from 'react';
import { formatCurrencyINR } from '@/lib/utils/format-number';

interface PriceRangeBarProps {
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  quickSalePrice?: number;
}

export function PriceRangeBar({ minPrice, avgPrice, maxPrice, quickSalePrice }: PriceRangeBarProps) {
  return (
    <div className="w-full space-y-3 rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        <span>Fair Market Range</span>
        <span className="text-emerald-500 font-bold">TractorDost AI Valuation</span>
      </div>

      {/* Main Big Number */}
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-foreground">{formatCurrencyINR(avgPrice)}</span>
        <span className="text-xs font-medium text-muted-foreground">Estimated Fair Value</span>
      </div>

      {/* Visual Bar */}
      <div className="relative pt-4 pb-2">
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/40">
          <div className="h-full w-full bg-gradient-to-r from-amber-500 via-emerald-500 to-sky-500 rounded-full" />
        </div>
      </div>

      {/* Range Labels */}
      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
        <div className="rounded-xl border border-border/40 bg-background/50 p-2">
          <p className="text-[11px] text-muted-foreground">Quick Sale</p>
          <p className="text-xs font-bold text-amber-500">
            {formatCurrencyINR(quickSalePrice || minPrice * 0.95)}
          </p>
        </div>
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-2">
          <p className="text-[11px] text-emerald-400 font-semibold">Fair Market</p>
          <p className="text-xs font-extrabold text-emerald-400">{formatCurrencyINR(avgPrice)}</p>
        </div>
        <div className="rounded-xl border border-border/40 bg-background/50 p-2">
          <p className="text-[11px] text-muted-foreground">Dealer Asking</p>
          <p className="text-xs font-bold text-sky-400">{formatCurrencyINR(maxPrice)}</p>
        </div>
      </div>
    </div>
  );
}

export default PriceRangeBar;
