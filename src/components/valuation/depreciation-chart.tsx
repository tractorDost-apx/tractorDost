'use client';

import React from 'react';
import { formatCurrencyINR } from '@/lib/utils/format-number';

interface DepreciationChartProps {
  currentPrice: number;
  yearOfManufacture: number;
}

export function DepreciationChart({ currentPrice, yearOfManufacture }: DepreciationChartProps) {
  const currentYear = new Date().getFullYear();
  const projections = [
    { year: currentYear, value: currentPrice },
    { year: currentYear + 1, value: Math.round(currentPrice * 0.94) },
    { year: currentYear + 2, value: Math.round(currentPrice * 0.88) },
    { year: currentYear + 3, value: Math.round(currentPrice * 0.82) },
    { year: currentYear + 4, value: Math.round(currentPrice * 0.77) },
  ];

  const maxValue = currentPrice;

  return (
    <div className="w-full space-y-4 rounded-2xl border border-border/50 bg-card/60 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          5-Year Value Trajectory
        </h4>
        <span className="text-[11px] text-muted-foreground">Historical Tractor Value Index</span>
      </div>

      <div className="flex h-36 items-end justify-between gap-3 pt-4">
        {projections.map((item, index) => {
          const heightPct = Math.max(30, Math.round((item.value / maxValue) * 100));
          const isNow = index === 0;

          return (
            <div key={item.year} className="flex flex-1 flex-col items-center gap-2">
              <span className="text-[10px] font-semibold text-muted-foreground">
                {Math.round(item.value / 1000)}k
              </span>
              <div className="relative w-full rounded-t-xl bg-muted/30 p-1 flex items-end justify-center h-24">
                <div
                  style={{ height: `${heightPct}%` }}
                  className={`w-full rounded-t-lg transition-all duration-500 ${
                    isNow
                      ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                      : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                  }`}
                />
              </div>
              <span className={`text-xs font-bold ${isNow ? 'text-emerald-400' : 'text-muted-foreground'}`}>
                {item.year}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default DepreciationChart;
