'use client';

import React, { useState, useEffect } from 'react';
import { Calculator, ArrowRight, IndianRupee, Tractor, PlusCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface SavedValuation {
  id: number | string;
  brand: string;
  model: string;
  year: number | string;
  condition: string;
  estimatedValue: string;
  date: string;
}

const DEFAULT_SAMPLE_VALUATIONS: SavedValuation[] = [
  {
    id: 1,
    brand: 'Mahindra',
    model: '575 DI SP Plus',
    year: '2020',
    condition: 'Good',
    estimatedValue: '₹4,80,000 - ₹5,20,000',
    date: '10 Oct 2024',
  },
  {
    id: 2,
    brand: 'Swaraj',
    model: '744 FE',
    year: '2022',
    condition: 'Excellent',
    estimatedValue: '₹5,50,000 - ₹5,90,000',
    date: '18 Sep 2024',
  },
];

export default function MyValuationsPage() {
  const [valuations, setValuations] = useState<SavedValuation[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tractordost:user_valuations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setValuations(parsed);
          setHydrated(true);
          return;
        }
      }
    } catch (_) {}
    setValuations(DEFAULT_SAMPLE_VALUATIONS);
    setHydrated(true);
  }, []);

  if (!hydrated) return null;

  return (
    <div className="animate-fade-in flex h-full flex-col space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-foreground mb-1 text-3xl font-black">My Valuations</h1>
          <p className="text-muted text-xs font-medium sm:text-sm">
            History of your tractor market valuation checks using TractorDost TrueVal.
          </p>
        </div>

        <Link
          href="/used-tractor-valuation"
          className="flex items-center gap-2 rounded-xl bg-[var(--color-brand-green)] px-5 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md transition-all hover:opacity-90 active:scale-95"
        >
          <Calculator size={18} /> Check New Valuation
        </Link>
      </div>

      {valuations.length === 0 ? (
        <div className="glass-panel flex flex-col items-center justify-center rounded-3xl border border-[var(--border-subtle)] p-12 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)] mb-4">
            <Calculator size={32} />
          </div>
          <h3 className="text-foreground text-lg font-bold">No Valuations Checked Yet</h3>
          <p className="text-muted mt-1 max-w-sm text-xs font-medium">
            Find out the true fair market price of any used tractor in Maharashtra using our algorithmic TrueVal calculator.
          </p>
          <Link
            href="/used-tractor-valuation"
            className="mt-6 rounded-xl bg-[var(--color-brand-green)] px-6 py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-md hover:opacity-90"
          >
            Calculate Tractor Valuation
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {valuations.map((val) => (
            <div
              key={val.id}
              className="glass-panel flex flex-col justify-between rounded-2xl border border-[var(--border-subtle)] p-6 transition-all hover:border-[var(--color-brand-green)]/40 hover:shadow-md"
            >
              <div>
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--color-brand-green)]/10 text-[var(--color-brand-green)]">
                      <Tractor size={22} />
                    </div>
                    <div>
                      <h3 className="text-foreground text-lg font-black">
                        {val.brand} {val.model}
                      </h3>
                      <div className="text-muted mt-1 flex flex-wrap items-center gap-2 text-xs font-bold">
                        <span>Model Year: {val.year}</span>
                        <span>•</span>
                        <span>Condition: {val.condition}</span>
                      </div>
                    </div>
                  </div>

                  <span className="text-muted rounded-lg bg-foreground/5 px-2.5 py-1 text-[11px] font-bold">
                    {val.date}
                  </span>
                </div>

                {/* Estimate Box */}
                <div className="mb-4 rounded-xl border border-[var(--color-brand-green)]/20 bg-[var(--color-brand-green)]/10 p-4">
                  <p className="mb-1 flex items-center gap-1 text-xs font-black text-[var(--color-brand-green)] uppercase tracking-wider">
                    <IndianRupee size={14} /> Estimated Fair Market Resale Value
                  </p>
                  <p className="text-foreground text-2xl font-black">{val.estimatedValue}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 border-t border-[var(--border-subtle)] pt-4">
                <Link
                  href={`/sell-used-tractor?brand=${encodeURIComponent(val.brand)}&model=${encodeURIComponent(val.model)}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[var(--color-brand-green)] py-2.5 text-xs font-black tracking-wider text-white uppercase shadow-sm transition-opacity hover:opacity-90"
                >
                  <PlusCircle size={15} /> Sell at this price
                </Link>
                <Link
                  href="/used-tractor-valuation"
                  className="text-muted hover:text-foreground flex items-center gap-1 rounded-xl border border-[var(--border-subtle)] px-4 py-2.5 text-xs font-bold transition-colors"
                >
                  <RefreshCw size={14} /> Re-check
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
