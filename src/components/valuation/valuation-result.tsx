'use client';

import React from 'react';
import { PriceRangeBar } from './price-range-bar';
import { DepreciationChart } from './depreciation-chart';
import { ValuationCta } from './valuation-cta';

interface ValuationResultProps {
  brand: string;
  model: string;
  year: number;
  minPrice: number;
  avgPrice: number;
  maxPrice: number;
  quickSalePrice?: number;
  confidenceScore?: number;
}

export function ValuationResult({
  brand,
  model,
  year,
  minPrice,
  avgPrice,
  maxPrice,
  quickSalePrice,
  confidenceScore = 92,
}: ValuationResultProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-4">
          <div>
            <h3 className="text-xl font-black text-foreground">
              {year} {brand} {model}
            </h3>
            <p className="text-xs text-muted-foreground">Certified Valuation Report</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400">
            <span>Accuracy: {confidenceScore}%</span>
          </div>
        </div>

        <div className="mt-6">
          <PriceRangeBar
            minPrice={minPrice}
            avgPrice={avgPrice}
            maxPrice={maxPrice}
            quickSalePrice={quickSalePrice}
          />
        </div>

        <div className="mt-6">
          <DepreciationChart currentPrice={avgPrice} yearOfManufacture={year} />
        </div>
      </div>

      <ValuationCta brand={brand} model={model} estimatedPrice={avgPrice} />
    </div>
  );
}

export default ValuationResult;
